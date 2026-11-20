import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { verifyTokenAndGetContext, AuthContext } from './auth';
import { checkRateLimit } from './ratelimit';
import { writeAuditLog } from './audit';
import { adminDb } from './firestore';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
} from './errors';

export interface RouteSecurityOptions<TBody = unknown, TQuery = unknown, TParams = unknown> {
  action: string;
  rateLimitPerMinute?: number;
  bodySchema?: z.ZodType<TBody>;
  querySchema?: z.ZodType<TQuery>;
  paramsSchema?: z.ZodType<TParams>;
  requireOwnership?: {
    collection: 'invoices' | 'cases' | 'notices' | 'reminders' | 'evidence' | 'calls' | 'users';
    extractId: (ctx: { body: TBody; query: TQuery; params: TParams; request: Request }) => string | null | undefined;
  };
}

export interface SecureRequestContext<TBody = unknown, TQuery = unknown, TParams = unknown> {
  request: Request;
  auth: AuthContext;
  body: TBody;
  query: TQuery;
  params: TParams;
  resourceDoc?: Record<string, unknown>;
}

export type SecureRouteHandler<TBody = unknown, TQuery = unknown, TParams = unknown> = (
  ctx: SecureRequestContext<TBody, TQuery, TParams>
) => Promise<Response | NextResponse>;

// In-memory test store for isolated unit tests without live GCP credentials
export const testResourceStore = new Map<string, Record<string, unknown>>();

/**
 * Standard security headers applied to all responses
 */
export const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Permissions-Policy': 'camera=(), microphone=(self), geolocation=()',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

/**
 * Checks and attaches CORS headers locked to our application origin.
 */
export function applyCorsHeaders(responseHeaders: Headers, request: Request): void {
  const origin = request.headers.get('origin');
  const allowedOrigin = process.env.APP_URL || (origin ? origin : 'http://localhost:3000');

  // Lock CORS strictly to allowed origin
  if (origin && (origin === allowedOrigin || process.env.NODE_ENV !== 'production')) {
    responseHeaders.set('Access-Control-Allow-Origin', origin);
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Idempotency-Key');
    responseHeaders.set('Access-Control-Allow-Credentials', 'true');
  }
}

/**
 * Standardized JSON error response that never leaks server internals or stack traces.
 */
export function createStandardErrorResponse(err: unknown, request?: Request): NextResponse {
  const headers = new Headers(SECURITY_HEADERS);
  if (request) applyCorsHeaders(headers, request);

  if (err instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: err.code,
          message: err.message,
          ...(err.details ? { details: err.details } : {}),
        },
      },
      { status: err.statusCode, headers }
    );
  }

  // Handle ZodError directly if not wrapped
  if (err instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request input',
          details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        },
      },
      { status: 400, headers }
    );
  }

  // Generic / Unknown internal error: sanitize completely
  console.error('[INTERNAL_ROUTE_ERROR]', err instanceof Error ? err.stack || err.message : String(err));
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred. Please contact support.',
      },
    },
    { status: 500, headers }
  );
}

/**
 * Higher-order security pipeline wrapping Next.js route handlers.
 * Enforces:
 * 1. Token authentication
 * 2. Per-UID rate limit
 * 3. Zod validation of body, query, and route params
 * 4. Resource ownership check (403 Forbidden on cross-tenant attempts)
 * 5. Handler execution
 * 6. PII-safe audit logging
 * 7. Standardized safe error serialization & security headers
 */
export function secureRoute<TBody = unknown, TQuery = unknown, TParams = unknown>(
  options: RouteSecurityOptions<TBody, TQuery, TParams>,
  handler: SecureRouteHandler<TBody, TQuery, TParams>
) {
  return async (request: Request, routeCtx?: { params?: Promise<TParams> | TParams }): Promise<Response> => {
    // 0. Handle CORS Preflight OPTIONS
    if (request.method === 'OPTIONS') {
      const headers = new Headers(SECURITY_HEADERS);
      applyCorsHeaders(headers, request);
      return new NextResponse(null, { status: 204, headers });
    }

    const {
      action,
      rateLimitPerMinute = 30,
      bodySchema,
      querySchema,
      paramsSchema,
      requireOwnership,
    } = options;

    let authContext: AuthContext | null = null;
    let resourceIdForAudit = 'none';

    try {
      // 1. Verify Firebase ID Token
      try {
        authContext = await verifyTokenAndGetContext(request);
      } catch (authErr: unknown) {
        throw new UnauthorizedError(authErr instanceof Error ? authErr.message : 'Authentication required');
      }

      // 2. Per-UID Rate Limit (Transactional Counter)
      const rateLimitRes = await checkRateLimit(authContext.uid, rateLimitPerMinute);
      if (!rateLimitRes.allowed) {
        throw new RateLimitError(`Rate limit of ${rateLimitPerMinute} requests/min exceeded. Try again in ${rateLimitRes.resetSeconds}s.`);
      }

      // 3. Resolve and validate route params
      let resolvedParams = {} as TParams;
      if (routeCtx?.params) {
        const rawParams = await Promise.resolve(routeCtx.params);
        if (paramsSchema) {
          const parsedParams = paramsSchema.safeParse(rawParams);
          if (!parsedParams.success) {
            throw new ValidationError('Invalid route parameters', parsedParams.error.issues);
          }
          resolvedParams = parsedParams.data;
        } else {
          resolvedParams = rawParams as TParams;
        }
      }

      // 4. Validate Query Parameters
      let resolvedQuery = {} as TQuery;
      const url = new URL(request.url);
      const queryObj: Record<string, string> = {};
      url.searchParams.forEach((val, key) => {
        queryObj[key] = val;
      });

      if (querySchema) {
        const parsedQuery = querySchema.safeParse(queryObj);
        if (!parsedQuery.success) {
          throw new ValidationError('Invalid query parameters', parsedQuery.error.issues);
        }
        resolvedQuery = parsedQuery.data;
      } else {
        resolvedQuery = queryObj as TQuery;
      }

      // 5. Validate Request Body (for POST/PUT/PATCH)
      let resolvedBody = {} as TBody;
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          let rawJson: unknown;
          try {
            rawJson = await request.json();
          } catch {
            throw new ValidationError('Malformed JSON payload in request body');
          }

          if (bodySchema) {
            const parsedBody = bodySchema.safeParse(rawJson);
            if (!parsedBody.success) {
              throw new ValidationError('Validation failed for request body', parsedBody.error.issues);
            }
            resolvedBody = parsedBody.data;
          } else {
            resolvedBody = rawJson as TBody;
          }
        } else if (bodySchema) {
          throw new ValidationError('Content-Type must be application/json');
        }
      }

      // 6. Ownership Check (Cross-Tenant Protection)
      let resourceDoc: Record<string, unknown> | undefined;
      if (requireOwnership) {
        const resId = requireOwnership.extractId({
          body: resolvedBody,
          query: resolvedQuery,
          params: resolvedParams,
          request,
        });

        if (!resId) {
          throw new ValidationError(`Required resource ID missing for ownership verification`);
        }
        resourceIdForAudit = resId;

        // Fetch resource from test store or Firestore
        let docData: Record<string, unknown> | null = null;
        const storeKey = `${requireOwnership.collection}/${resId}`;

        if (process.env.NODE_ENV === 'test' && testResourceStore.has(storeKey)) {
          docData = testResourceStore.get(storeKey) || null;
        } else {
          try {
            const snap = await adminDb.collection(requireOwnership.collection).doc(resId).get();
            if (snap.exists) {
              docData = snap.data() || {};
            }
          } catch (dbErr) {
            if (process.env.NODE_ENV === 'test' && testResourceStore.has(storeKey)) {
              docData = testResourceStore.get(storeKey) || null;
            } else {
              throw dbErr;
            }
          }
        }

        if (!docData) {
          throw new NotFoundError(`${requireOwnership.collection.slice(0, -1)} with ID ${resId}`);
        }

        resourceDoc = docData;

        // Verify ownership (either ownerUid or doc ID matches userId)
        const docOwner = requireOwnership.collection === 'users' ? resId : docData.ownerUid;
        if (docOwner !== authContext.uid) {
          // Strictly 403 Forbidden on cross-tenant access attempt
          throw new ForbiddenError(`Access denied: You do not own this ${requireOwnership.collection.slice(0, -1)}`);
        }
      }

      // 7. Execute Handler
      const response = await handler({
        request,
        auth: authContext,
        body: resolvedBody,
        query: resolvedQuery,
        params: resolvedParams,
        resourceDoc,
      });

      // 8. Attach Standard Security Headers & CORS to successful response
      Object.entries(SECURITY_HEADERS).forEach(([key, val]) => {
        response.headers.set(key, val);
      });
      applyCorsHeaders(response.headers, request);

      // 9. PII-Safe Audit Logging
      await writeAuditLog({
        uid: authContext.uid,
        action,
        resourceId: resourceIdForAudit,
        details: {
          status: 'SUCCESS',
          hasBody: Boolean(resolvedBody),
        },
      });

      return response;
    } catch (err: unknown) {
      // Audit log on failure (PII-safe)
      if (authContext) {
        const errCode = err instanceof AppError ? err.code : 'ERROR';
        await writeAuditLog({
          uid: authContext.uid,
          action: `${action}_FAILED`,
          resourceId: resourceIdForAudit,
          details: {
            errorCode: errCode,
          },
        });
      }

      return createStandardErrorResponse(err, request);
    }
  };
}
