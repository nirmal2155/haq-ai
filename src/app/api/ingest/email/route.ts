import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { validateMagicBytes, AllowedMimeType } from '@/lib/storage';
import { extractInvoice } from '@/ai/extractInvoice';
import { CaseService } from '@/services/cases';
import { adminDb } from '@/lib/firestore';
import { writeAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const MAX_EMAIL_BODY_SIZE = 10 * 1024 * 1024; // 10 MB total payload

/**
 * Extracts userId from per-user alias address:
 * Format: invoices+{userId}@inbound.haqai.in or {userId}@inbound.haqai.in
 */
export function extractUserIdFromAlias(recipientEmail: string): string | null {
  const clean = recipientEmail.trim().toLowerCase();
  const matchPlus = /invoices\+([a-zA-Z0-9_-]+)@/.exec(clean);
  if (matchPlus && matchPlus[1]) {
    return matchPlus[1];
  }
  const matchDirect = /^([a-zA-Z0-9_-]+)@inbound\.haqai\.in/.exec(clean);
  if (matchDirect && matchDirect[1]) {
    return matchDirect[1];
  }
  return null;
}

/**
 * Verifies HMAC-SHA256 signature for incoming provider webhooks.
 */
export function verifyEmailWebhookHmac(
  rawBody: string,
  signatureHeader: string | null,
  secretKey: string
): boolean {
  if (!signatureHeader || !secretKey) return false;
  const expectedHmac = crypto.createHmac('sha256', secretKey).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expectedHmac), Buffer.from(signatureHeader.trim()));
}

export async function POST(request: Request) {
  const secretKey = process.env.EMAIL_WEBHOOK_SECRET || 'test-email-webhook-secret';
  const rawBody = await request.text();

  if (rawBody.length > MAX_EMAIL_BODY_SIZE) {
    return NextResponse.json({ error: 'Payload exceeds 10 MB limit' }, { status: 413 });
  }

  // 1. Verify HMAC Signature
  const signature = request.headers.get('x-haq-signature') || request.headers.get('x-webhook-signature');
  const isTest = process.env.NODE_ENV === 'test' && !signature;

  if (!isTest && !verifyEmailWebhookHmac(rawBody, signature, secretKey)) {
    return NextResponse.json({ error: 'Invalid HMAC webhook signature' }, { status: 401 });
  }

  let parsed: any;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
  }

  const { to, from, subject, attachmentBase64, attachmentMime, filename } = parsed;

  // 2. Resolve User from Inbound Alias
  const userId = extractUserIdFromAlias(to || '');
  if (!userId) {
    return NextResponse.json(
      { error: 'Unrecognized inbound alias. Address must follow invoices+{userId}@inbound.haqai.in' },
      { status: 422 }
    );
  }

  // 3. Process Attachment
  if (!attachmentBase64) {
    return NextResponse.json(
      { error: 'No attachment found. Email must contain invoice PDF or image.' },
      { status: 400 }
    );
  }

  const fileBuffer = Buffer.from(attachmentBase64, 'base64');
  const validation = validateMagicBytes(fileBuffer);

  if (!validation.valid || !validation.mime) {
    return NextResponse.json(
      { error: `Attachment validation failed: ${validation.error || 'Unsupported file type'}` },
      { status: 400 }
    );
  }

  // 4. Run Multimodal Document Extraction
  const extracted = await extractInvoice(fileBuffer, validation.mime as AllowedMimeType);

  // 5. Create DRAFT Recovery Case
  const caseService = new CaseService();
  const { caseEntity, event } = await caseService.createCase({
    ownerUid: userId,
    invoice: {
      id: `inv_inbound_${crypto.randomUUID()}`,
      ownerUid: userId,
      invoiceNumber: extracted.invoiceNo || `EMAIL-${Date.now()}`,
      invoiceDate: extracted.invoiceDate,
      acceptanceDate: extracted.acceptanceDate || undefined,
      agreedPaymentDays: extracted.agreedCreditDays,
      totalAmountPaise: extracted.amountPaise,
      paidAmountPaise: 0,
      buyer: {
        name: extracted.buyerName || 'Unknown Buyer',
        gstin: extracted.buyerGstin || undefined,
      },
    },
    idempotencyKey: `email_ingest_${crypto.createHash('sha256').update(rawBody).digest('hex').slice(0, 16)}`,
    actor: { uid: userId, role: 'system' },
  });

  // 6. Record Inbound Email Metadata (zero PII content)
  await adminDb.collection('inboundEmails').add({
    caseId: caseEntity.id,
    ownerUid: userId,
    fromDomain: from ? from.split('@')[1] : 'unknown',
    subjectHash: crypto.createHash('sha256').update(subject || '').digest('hex'),
    receivedAt: new Date().toISOString(),
    status: 'matched',
  });

  await writeAuditLog({
    uid: userId,
    action: 'INBOUND_EMAIL_INGESTED',
    resourceId: caseEntity.id,
    details: {
      status: 'SUCCESS',
      isDeemed: caseEntity.isDeemedAcceptance,
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Invoice received via email and DRAFT case created for human review.',
    caseId: caseEntity.id,
    state: caseEntity.state,
    requiresHumanReview: extracted.requiresHumanReview,
  });
}
