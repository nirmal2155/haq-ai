import { NextResponse } from 'next/server';
import { verifyTokenAndGetContext, AuthError } from '@/lib/auth';
import { checkRateLimit } from '@/lib/ratelimit';
import { adminDb } from '@/lib/firestore';
import { writeAuditLog } from '@/lib/audit';
import { computeDueDate } from '@/engine/deadline';
import { computeInterest, DEFAULT_LEGAL_CONFIG } from '@/engine/interest';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { uid } = await verifyTokenAndGetContext(request);
    const rate = await checkRateLimit(uid, 60);
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { id } = params;
    if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 });
    }

    const doc = await adminDb.collection('invoices').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const data = doc.data()!;
    if (data.ownerUid !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const today = new Date().toISOString().split('T')[0];
    const deadline = computeDueDate({
      acceptanceDate: data.acceptanceDate as string,
      hasWrittenAgreement: data.hasWrittenAgreement as boolean,
      agreedCreditDays: data.agreedCreditDays as number | null | undefined,
    });

    const interest = computeInterest({
      principalPaise: data.amountPaise as number,
      dueDate: deadline.dueDate,
      asOfDate: today,
      paidPaise: data.paidPaise as number,
      config: DEFAULT_LEGAL_CONFIG,
    });

    await writeAuditLog({ uid, action: 'INVOICE_VIEWED', resourceId: id });

    return NextResponse.json({
      invoice: {
        id: doc.id,
        ...data,
        statutoryDueDate: deadline.dueDate,
        statutoryRule: deadline.rule,
        daysOverdue: interest.daysOverdue,
        accruedInterestPaise: interest.interestPaise,
        totalPayablePaise: interest.totalPaise,
        effectiveAnnualRatePercent: interest.effectiveAnnualRatePercent,
      },
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('[INVOICE_GET_ERROR]', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to retrieve invoice' }, { status: 500 });
  }
}
