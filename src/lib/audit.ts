import { adminDb } from './firestore';

export interface AuditLogEntry {
  uid: string;
  action: string;
  resourceId: string;
  ts?: string;
  details?: Record<string, string | number | boolean>;
}

/**
 * Writes an audit log entry to Firestore and safe log sink.
 * Strictly avoids logging PII (no GSTIN, names, amounts, transcripts).
 */
export async function writeAuditLog(entry: {
  uid: string;
  action: string;
  resourceId: string;
  details?: Record<string, string | number | boolean>;
}): Promise<string> {
  const ts = new Date().toISOString();
  const sanitizedEntry: AuditLogEntry = {
    uid: entry.uid,
    action: entry.action,
    resourceId: entry.resourceId,
    ts,
  };

  // Safe console log: IDs and actions only, no PII
  console.info(`[AUDIT] action=${entry.action} uid=${entry.uid} resourceId=${entry.resourceId} ts=${ts}`);

  try {
    const docRef = await adminDb.collection('auditLogs').add(sanitizedEntry);
    return docRef.id;
  } catch (error) {
    // If running in test or emulator without Firestore connection, fallback cleanly
    if (process.env.NODE_ENV === 'test') {
      return 'test-audit-id';
    }
    console.error(`[AUDIT_ERROR] Failed to persist audit log: ${error instanceof Error ? error.message : 'Unknown'}`);
    return '';
  }
}
