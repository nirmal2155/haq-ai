import { NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firestore';

export const dynamic = 'force-dynamic';

/**
 * Readiness probe: /api/readyz
 * Checks downstream dependencies (Firestore and Cloud Storage).
 * Returns 200 when ready to accept traffic, 503 if any dependency check fails.
 */
export async function GET() {
  const checks: {
    firestore: 'ok' | 'degraded' | 'failed';
    storage: 'ok' | 'degraded' | 'failed';
  } = {
    firestore: 'failed',
    storage: 'failed',
  };

  const errors: Record<string, string> = {};

  // 1. Check Firestore
  try {
    // Ping firestore with listCollections or a shallow probe
    if (adminDb) {
      await adminDb.listCollections();
      checks.firestore = 'ok';
    } else {
      checks.firestore = 'failed';
      errors.firestore = 'adminDb instance is undefined';
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    // If running in development/emulator/test without GCP credentials, report degraded
    if (process.env.NODE_ENV !== 'production') {
      checks.firestore = 'degraded';
      errors.firestore = `Non-production environment warning: ${errorMsg}`;
    } else {
      checks.firestore = 'failed';
      errors.firestore = errorMsg;
    }
  }

  // 2. Check Cloud Storage
  try {
    if (adminStorage) {
      const bucket = adminStorage.bucket();
      const [exists] = await bucket.exists();
      if (exists) {
        checks.storage = 'ok';
      } else {
        if (process.env.NODE_ENV !== 'production') {
          checks.storage = 'degraded';
          errors.storage = 'Bucket not found (non-production placeholder)';
        } else {
          checks.storage = 'failed';
          errors.storage = 'Bucket does not exist';
        }
      }
    } else {
      checks.storage = 'failed';
      errors.storage = 'adminStorage instance is undefined';
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (process.env.NODE_ENV !== 'production') {
      checks.storage = 'degraded';
      errors.storage = `Non-production environment warning: ${errorMsg}`;
    } else {
      checks.storage = 'failed';
      errors.storage = errorMsg;
    }
  }

  const isHealthy =
    checks.firestore !== 'failed' && checks.storage !== 'failed';

  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: isHealthy ? 'ready' : 'unhealthy',
      service: 'haq-ai',
      probe: 'readiness',
      timestamp: new Date().toISOString(),
      checks,
      ...(Object.keys(errors).length > 0 ? { errors } : {}),
    },
    {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
