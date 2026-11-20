import { NextResponse } from 'next/server';
import { z } from 'zod';
import { secureRoute } from '@/lib/apiSecurity';
import { CaseService } from '@/services/cases';

export const dynamic = 'force-dynamic';

const confirmPaymentSchema = z.object({
  caseId: z.string().min(1),
  paymentPaise: z.number().int().positive(),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  idempotencyKey: z.string().min(1),
});

export const POST = secureRoute(
  {
    action: 'CONFIRM_PAYMENT_MATCH',
    bodySchema: confirmPaymentSchema,
  },
  async ({ auth, body }) => {
    const { uid } = auth;
    const { caseId, paymentPaise, paymentDate, idempotencyKey } = body;

    const caseService = new CaseService();
    const caseEntity = await caseService.getCaseById(caseId, uid);

    const updatedPaid = caseEntity.paidAmountPaise + paymentPaise;
    const isFullyPaid = updatedPaid >= caseEntity.principalAmountPaise;

    // Transition state to PAID if fully settled, or update paid balance
    const targetState = isFullyPaid ? 'PAID' : caseEntity.state;

    const result = await caseService.transition({
      caseId,
      toState: targetState,
      ownerUid: uid,
      actor: { uid, role: 'user' },
      idempotencyKey,
      stateUpdates: {
        paidAmountPaise: updatedPaid,
      },
      metadata: {
        paymentDate,
        amountReceivedPaise: paymentPaise,
        isFullyPaid,
      },
    });

    return NextResponse.json({
      success: true,
      message: isFullyPaid ? 'Payment confirmed: Case marked as PAID.' : 'Partial payment recorded.',
      case: result.updatedCase,
    });
  }
);
