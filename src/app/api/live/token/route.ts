import { NextResponse } from 'next/server';
import { verifyTokenAndGetContext, AuthError } from '@/lib/auth';
import { checkRateLimit } from '@/lib/ratelimit';
import { adminDb } from '@/lib/firestore';
import { writeAuditLog } from '@/lib/audit';
import { computeDueDate } from '@/engine/deadline';
import { computeInterest, DEFAULT_LEGAL_CONFIG } from '@/engine/interest';
import { formatPaiseToINR } from '@/engine/money';
import { createLiveEphemeralToken } from '@/lib/gemini';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const TokenRequestSchema = z.object({
  invoiceId: z.string().min(1),
  supplierName: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const { uid, orgId } = await verifyTokenAndGetContext(request);

    // Rate-limited to 5 tokens per hour per uid for live voice demo
    const rate = await checkRateLimit(uid, 5);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Live voice session limit reached (maximum 5 sessions per hour)' },
        { status: 429, headers: { 'Retry-After': String(rate.resetSeconds) } }
      );
    }

    const body = await request.json();
    const { invoiceId, supplierName } = TokenRequestSchema.parse(body);

    // Verify invoice exists and user owns it
    const invoiceDoc = await adminDb.collection('invoices').doc(invoiceId).get();
    if (!invoiceDoc.exists) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const invoiceData = invoiceDoc.data()!;
    if (invoiceData.ownerUid !== uid) {
      return NextResponse.json({ error: 'Forbidden: You do not own this invoice' }, { status: 403 });
    }

    const today = new Date().toISOString().split('T')[0];

    const deadline = computeDueDate({
      acceptanceDate: invoiceData.acceptanceDate,
      hasWrittenAgreement: invoiceData.hasWrittenAgreement,
      agreedCreditDays: invoiceData.agreedCreditDays,
    });

    const interest = computeInterest({
      principalPaise: invoiceData.amountPaise,
      dueDate: deadline.dueDate,
      asOfDate: today,
      paidPaise: invoiceData.paidPaise || 0,
      config: DEFAULT_LEGAL_CONFIG,
    });

    const sName = supplierName || 'Registered MSME Supplier';
    const bName = invoiceData.buyerName;
    const invNo = invoiceData.invoiceNo;
    const amountStr = formatPaiseToINR(invoiceData.amountPaise);
    const dueDateStr = deadline.dueDate;
    const daysOverdue = interest.daysOverdue;
    const interestStr = formatPaiseToINR(interest.interestPaise);
    const totalClaimStr = formatPaiseToINR(interest.totalPaise);

    // Strict server-side system instruction from specification
    const serverSystemInstruction =
      `You are an AI assistant calling the accounts team of ${bName} on behalf of ${sName} about invoice ${invNo}. ` +
      `First say you are an AI assistant and that the call may be recorded; ask consent to continue and stop if refused. ` +
      `Be polite and brief. State only these facts: invoice amount is ${amountStr}, due date was ${dueDateStr}, ` +
      `the payment is ${daysOverdue} days overdue, and the supplier is entitled to statutory compound interest under the MSMED Act ` +
      `as calculated (${interestStr}, bringing total claim to ${totalClaimStr}). ` +
      `Never threaten, never claim legal outcomes, never give legal advice, never ask for OTPs, passwords or bank credentials. ` +
      `Ask when payment will be made and repeat the promised date back to confirm. ` +
      `Speak Hindi, Gujarati or English matching the listener.`;

    const tokenRes = await createLiveEphemeralToken(serverSystemInstruction);

    await writeAuditLog({
      uid,
      action: 'LIVE_CALL_TOKEN_ISSUED',
      resourceId: invoiceId,
    });

    return NextResponse.json({
      success: true,
      token: tokenRes.token,
      model: tokenRes.model,
      expiresAt: tokenRes.expiresAt,
      context: {
        buyerName: bName,
        invoiceNo: invNo,
        amount: amountStr,
        dueDate: dueDateStr,
        daysOverdue,
        interest: interestStr,
        total: totalClaimStr,
      },
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', issues: error.issues }, { status: 400 });
    }
    console.error('[LIVE_TOKEN_ERROR]', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to create ephemeral live session token' }, { status: 500 });
  }
}
