import { NextResponse } from 'next/server';
import { verifyTokenAndGetContext, AuthError } from '@/lib/auth';
import { checkRateLimit } from '@/lib/ratelimit';
import { adminDb } from '@/lib/firestore';
import { writeAuditLog } from '@/lib/audit';
import { computeDueDate } from '@/engine/deadline';
import { computeInterest, DEFAULT_LEGAL_CONFIG } from '@/engine/interest';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreateInvoiceSchema = z.object({
  buyerName: z.string().min(1).max(200),
  buyerGstin: z.string().nullable().optional(),
  invoiceNo: z.string().min(1).max(100),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  acceptanceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  deemedAcceptance: z.boolean().default(false),
  amountPaise: z.number().int().positive(),
  paidPaise: z.number().int().min(0).default(0),
  hasWrittenAgreement: z.boolean().default(false),
  agreedCreditDays: z.number().int().min(0).max(365).nullable().optional(),
  source: z.object({
    storagePath: z.string(),
    mime: z.string(),
    sha256: z.string(),
  }).optional(),
});

export async function GET(request: Request) {
  try {
    const { uid, orgId } = await verifyTokenAndGetContext(request);
    const rate = await checkRateLimit(uid, 60);
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const snapshot = await adminDb
      .collection('invoices')
      .where('ownerUid', '==', uid)
      .get();

    const today = new Date().toISOString().split('T')[0];
    const invoices = snapshot.docs.map((doc) => {
      const data = doc.data();
      const deadline = computeDueDate({
        acceptanceDate: data.acceptanceDate,
        hasWrittenAgreement: data.hasWrittenAgreement,
        agreedCreditDays: data.agreedCreditDays,
      });

      const interest = computeInterest({
        principalPaise: data.amountPaise,
        dueDate: deadline.dueDate,
        asOfDate: today,
        paidPaise: data.paidPaise,
        config: DEFAULT_LEGAL_CONFIG,
      });

      return {
        id: doc.id,
        ...data,
        statutoryDueDate: deadline.dueDate,
        statutoryRule: deadline.rule,
        daysOverdue: interest.daysOverdue,
        accruedInterestPaise: interest.interestPaise,
        totalPayablePaise: interest.totalPaise,
      };
    });

    return NextResponse.json({ invoices });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to retrieve invoices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { uid, orgId } = await verifyTokenAndGetContext(request);
    const rate = await checkRateLimit(uid, 30);
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const validated = CreateInvoiceSchema.parse(body);

    const deadline = computeDueDate({
      acceptanceDate: validated.acceptanceDate,
      hasWrittenAgreement: validated.hasWrittenAgreement,
      agreedCreditDays: validated.agreedCreditDays,
    });

    const invoiceDoc = {
      ...validated,
      ownerUid: uid,
      orgId,
      statutoryDueDate: deadline.dueDate,
      statutoryRule: deadline.rule,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('invoices').add(invoiceDoc);

    await writeAuditLog({
      uid,
      action: 'INVOICE_CREATED',
      resourceId: docRef.id,
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      invoice: {
        id: docRef.id,
        ...invoiceDoc,
      },
    }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', issues: error.issues }, { status: 400 });
    }
    console.error('[INVOICE_CREATE_ERROR]', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to save confirmed invoice' }, { status: 500 });
  }
}
