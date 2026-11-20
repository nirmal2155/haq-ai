/**
 * Haq AI — Structured Production Logger with Zero-PII Enforcement.
 *
 * Emits Google Cloud Logging compatible JSON format with trace context,
 * severity, and strict sanitization of all PII (GSTIN, PAN, Phone, Email,
 * Names, Bank details, and monetary amounts).
 */

export type LogSeverity = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface LogContext {
  traceId?: string;
  spanId?: string;
  uid?: string; // Hashed or opaque user ID
  component?: string;
  action?: string;
  [key: string]: unknown;
}

export interface StructuredLogEntry {
  severity: LogSeverity;
  message: string;
  timestamp: string;
  'logging.googleapis.com/trace'?: string;
  'logging.googleapis.com/spanId'?: string;
  component?: string;
  action?: string;
  uid?: string;
  metadata?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const PII_KEY_PATTERNS = [
  'name',
  'buyername',
  'sellername',
  'gstin',
  'pan',
  'phone',
  'mobilenumber',
  'email',
  'accountnumber',
  'bankaccount',
  'ifsc',
  'amount',
  'invoiceamount',
  'totalamount',
  'principalamount',
  'transcript',
  'rawtext',
  'address',
];

/**
 * Aggressive Regex matchers for sensitive Indian MSME data
 */
const GSTIN_REGEX = /\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/gi;
const PAN_REGEX = /\b[A-Z]{5}\d{4}[A-Z]{1}\b/gi;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;
const PHONE_REGEX = /(?:\+?91[\s-]?)?[6789]\d{9}\b/gi;
const AADHAAR_REGEX = /\b\d{4}\s?\d{4}\s?\d{4}\b/gi;
const CURRENCY_AMOUNT_REGEX = /(?:Rs\.?|INR|₹)\s*\d+(?:,\d+)*(?:\.\d+)?/gi;

/**
 * Recursively sanitize strings and objects to strip all PII.
 */
export function sanitizeLogValue(val: unknown, keyName?: string): unknown {
  if (val === null || val === undefined) return val;

  // Key-name based redaction
  if (keyName && PII_KEY_PATTERNS.some((p) => keyName.toLowerCase().includes(p))) {
    return '[REDACTED_PII]';
  }

  if (typeof val === 'string') {
    let sanitized = val
      .replace(GSTIN_REGEX, '[REDACTED_GSTIN]')
      .replace(PAN_REGEX, '[REDACTED_PAN]')
      .replace(EMAIL_REGEX, '[REDACTED_EMAIL]')
      .replace(PHONE_REGEX, '[REDACTED_PHONE]')
      .replace(AADHAAR_REGEX, '[REDACTED_ID]')
      .replace(CURRENCY_AMOUNT_REGEX, '[REDACTED_AMOUNT]');
    return sanitized;
  }

  if (typeof val === 'number' || typeof val === 'boolean') {
    return val;
  }

  if (Array.isArray(val)) {
    return val.map((item) => sanitizeLogValue(item));
  }

  if (typeof val === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      sanitizedObj[k] = sanitizeLogValue(v, k);
    }
    return sanitizedObj;
  }

  return String(val);
}

export class Logger {
  private component: string;

  constructor(component: string = 'HaqCore') {
    this.component = component;
  }

  private emit(
    severity: LogSeverity,
    message: string,
    context?: LogContext,
    err?: unknown
  ): StructuredLogEntry {
    const now = new Date().toISOString();
    const sanitizedMessage = String(sanitizeLogValue(message));

    const entry: StructuredLogEntry = {
      severity,
      message: sanitizedMessage,
      timestamp: now,
      component: context?.component || this.component,
    };

    if (context?.traceId) {
      const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'haq-ai-production';
      entry['logging.googleapis.com/trace'] = `projects/${projectId}/traces/${context.traceId}`;
    }

    if (context?.spanId) {
      entry['logging.googleapis.com/spanId'] = context.spanId;
    }

    if (context?.uid) {
      entry.uid = String(sanitizeLogValue(context.uid));
    }

    if (context?.action) {
      entry.action = context.action;
    }

    // Extract other metadata
    const metadata: Record<string, unknown> = {};
    if (context) {
      for (const [k, v] of Object.entries(context)) {
        if (!['traceId', 'spanId', 'uid', 'component', 'action'].includes(k)) {
          metadata[k] = sanitizeLogValue(v, k);
        }
      }
    }

    if (Object.keys(metadata).length > 0) {
      entry.metadata = metadata;
    }

    if (err instanceof Error) {
      entry.error = {
        name: err.name,
        message: String(sanitizeLogValue(err.message)),
        stack: err.stack ? String(sanitizeLogValue(err.stack)) : undefined,
      };
    } else if (err) {
      entry.error = {
        name: 'UnknownError',
        message: String(sanitizeLogValue(err)),
      };
    }

    // Output structured JSON line to stdout / stderr for Cloud Run ingestion
    const outputLine = JSON.stringify(entry);
    if (severity === 'ERROR' || severity === 'CRITICAL') {
      console.error(outputLine);
    } else {
      console.log(outputLine);
    }

    return entry;
  }

  debug(message: string, context?: LogContext): StructuredLogEntry {
    return this.emit('DEBUG', message, context);
  }

  info(message: string, context?: LogContext): StructuredLogEntry {
    return this.emit('INFO', message, context);
  }

  warn(message: string, context?: LogContext, err?: unknown): StructuredLogEntry {
    return this.emit('WARNING', message, context, err);
  }

  error(message: string, context?: LogContext, err?: unknown): StructuredLogEntry {
    return this.emit('ERROR', message, context, err);
  }

  critical(message: string, context?: LogContext, err?: unknown): StructuredLogEntry {
    return this.emit('CRITICAL', message, context, err);
  }

  /**
   * Specifically for audit logs required by master security rule
   */
  audit(action: string, uid: string, resourceId?: string, extra?: Record<string, unknown>): StructuredLogEntry {
    return this.emit('INFO', `AUDIT_ACTION: ${action}`, {
      action,
      uid,
      resourceId: resourceId || 'none',
      ...extra,
    });
  }
}

export const logger = new Logger('App');
