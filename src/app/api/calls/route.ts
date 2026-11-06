import { NextResponse } from 'next/server';
import { verifyTokenAndGetContext, AuthError } from '@/lib/auth';
import { checkRateLimit } from '@/lib/ratelimit';
import { adminDb } from '@/lib/firestore';
import { writeAuditLog } from '@/lib/audit';
import { SaveCallRecordSchema } from '@/schemas/call';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { uid, orgId } = await verifyTokenAndGetContext(request);
    const rate = await checkRateLimit(uid, 30);
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const validated = SaveCallRecordSchema.parse(body);

    // Verify invoice ownership
    const invoiceDoc = await adminDb.collection('invoices').doc(validated.invoiceId).get();
    if (!invoiceDoc.exists) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const invoiceData = invoiceDoc.data()!;
    if (invoiceData.ownerUid !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // PRIVACY & CONSENT ENFORCEMENT:
    // Transcripts and promised dates are ONLY saved if consent was explicitly granted.
    const callRecord: Record<string, unknown> = {
      invoiceId: validated.invoiceId,
      ownerUid: uid,
      orgId,
      consentGiven: validated.consentGiven,
      createdAt: new Date().toISOString(),
    };

    if (validated.consentGiven) {
      callRecord.transcript = validated.transcript || '';
      callRecord.promisedDate = validated.promisedDate || null;
    } else {
      callRecord.transcript = '[CONSENT_REFUSED_TRANSCRIPT_OMITTED]';
      callRecord.promisedDate = null;
    }

    const docRef = await adminDb.collection('calls').add(callRecord);

    await writeAuditLog({
      uid,
      action: 'CALL_RECORD_SAVED',
      resourceId: docRef.id,
    });

    return NextResponse.json({
      success: true,
      callId: docRef.id,
      consentGiven: validated.consentGiven,
      saved: true,
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', issues: error.issues }, { status: 400 });
    }
    console.error('[SAVE_CALL_ERROR]', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to save call record' }, { status: 500 });
  }
}
