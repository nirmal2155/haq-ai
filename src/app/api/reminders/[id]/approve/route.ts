import { NextResponse } from 'next/server';
import { z } from 'zod';
import { secureRoute } from '@/lib/apiSecurity';
import { adminDb } from '@/lib/firestore';
import { CaseService } from '@/services/cases';
import { defaultMailer } from '@/services/mailer';
import { NotFoundError, AppError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

const approveSchema = z.object({
  customMessage: z.string().optional(),
  recipientEmail: z.string().email(),
  channel: z.enum(['email', 'whatsapp']).default('email'),
});

export const POST = secureRoute(
  {
    action: 'REMINDER_HUMAN_APPROVE_SEND',
    bodySchema: approveSchema,
    paramsSchema: z.object({ id: z.string().min(1) }),
  },
  async ({ auth, body, params }) => {
    const reminderId = params.id;
    const { uid } = auth;

    // 1. Fetch Reminder
    const reminderRef = adminDb.collection('reminders').doc(reminderId);
    const snap = await reminderRef.get();

    if (!snap.exists) {
      throw new NotFoundError(`Reminder ${reminderId}`);
    }

    const reminder = snap.data()!;
    if (reminder.ownerUid !== uid) {
      throw new AppError('Forbidden: you do not own this reminder', 403, 'FORBIDDEN');
    }

    if (reminder.status === 'sent') {
      return NextResponse.json({
        success: true,
        message: 'Reminder was already dispatched.',
        reminderId,
        alreadySent: true,
      });
    }

    const caseService = new CaseService();
    const caseEntity = await caseService.getCaseById(reminder.caseId, uid);

    // 2. Transition case state: REMINDER_DUE -> REMINDER_APPROVED
    const idempotencyBase = `approve_${reminderId}_${Date.now()}`;
    await caseService.transition({
      caseId: caseEntity.id,
      toState: 'REMINDER_APPROVED',
      ownerUid: uid,
      actor: { uid, role: 'user' },
      idempotencyKey: `idem_appr_${idempotencyBase}`,
    });

    // 3. Dispatch via Mailer
    const subject = `Statutory Payment Reminder: Invoice #${caseEntity.invoiceNumber} (MSMED Act)`;
    const textBody =
      body.customMessage ||
      `Dear Accounts Team,\n\nThis is a statutory payment follow-up regarding Invoice #${caseEntity.invoiceNumber} dated ${caseEntity.invoiceDate}.\nThe statutory appointed day was ${caseEntity.appointedDay}.\n\nStatutory compound interest under Section 16 of the MSMED Act 2006 is accruing.\n\nDraft only. Review with a CA/lawyer before sending.`;

    const dispatchResult = await defaultMailer.sendEmail({
      to: body.recipientEmail,
      subject,
      text: textBody,
    });

    const nowIso = new Date().toISOString();

    // 4. Update reminder status to 'sent'
    await reminderRef.update({
      status: 'sent',
      approvedAt: nowIso,
      sentAt: nowIso,
      dispatchResult,
      updatedAt: nowIso,
    });

    // 5. Transition case state: REMINDER_APPROVED -> REMINDER_SENT
    await caseService.transition({
      caseId: caseEntity.id,
      toState: 'REMINDER_SENT',
      ownerUid: uid,
      actor: { uid, role: 'system' },
      idempotencyKey: `idem_sent_${idempotencyBase}`,
      metadata: {
        messageId: dispatchResult.messageId,
        provider: dispatchResult.provider,
        channel: body.channel,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Reminder approved and dispatched successfully.',
      reminderId,
      dispatch: dispatchResult,
    });
  }
);
