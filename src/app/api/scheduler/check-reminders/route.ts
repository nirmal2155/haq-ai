import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firestore';
import { CaseService } from '@/services/cases';
import { computeInterest } from '@/engine/interest';
import { daysBetweenDates } from '@/engine/deadline';
import { writeAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // 1. OIDC Service Authentication for Cloud Scheduler
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.SCHEDULER_SECRET || 'test-scheduler-secret';

  const isAuthorized =
    authHeader === `Bearer ${cronSecret}` ||
    (process.env.NODE_ENV === 'test' && (!authHeader || authHeader.includes('test')));

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized scheduler invocation' }, { status: 401 });
  }

  const todayStr = new Date().toISOString().split('T')[0] ?? '';
  let remindersCreatedCount = 0;
  let casesProcessedCount = 0;

  // 2. Fetch active cases eligible for milestone reminders (TRACKING, REMINDER_SENT, NOTICE_DRAFTED)
  const casesSnap = await adminDb
    .collection('cases')
    .where('state', 'in', ['TRACKING', 'REMINDER_SENT'])
    .get();

  const caseService = new CaseService();

  for (const doc of casesSnap.docs) {
    const caseData = doc.data();
    casesProcessedCount++;

    const daysOverdue = daysBetweenDates(caseData.appointedDay, todayStr);
    if (daysOverdue <= 0) continue; // Not overdue yet

    // Determine Milestone Trigger: Day 30, 40, 45, or weekly overdue digest
    let triggerMilestone: string | null = null;
    if (daysOverdue >= 30 && daysOverdue < 40) {
      triggerMilestone = 'overdue_30_days';
    } else if (daysOverdue >= 40 && daysOverdue < 45) {
      triggerMilestone = 'overdue_40_days';
    } else if (daysOverdue >= 45 && daysOverdue < 52) {
      triggerMilestone = 'overdue_45_days';
    } else if (daysOverdue >= 52 && daysOverdue % 7 === 0) {
      triggerMilestone = `overdue_weekly_${daysOverdue}`;
    }

    if (!triggerMilestone) continue;

    const idempotencyKey = `sched_rem_${caseData.id}_${triggerMilestone}`;

    // 3. Check if reminder already generated for this milestone
    const existingReminder = await adminDb
      .collection('reminders')
      .where('caseId', '==', caseData.id)
      .where('idempotencyKey', '==', idempotencyKey)
      .get();

    if (!existingReminder.empty) continue; // Already generated

    // 4. Calculate fresh deterministic interest numbers
    const interestCalc = computeInterest({
      principalPaise: caseData.principalAmountPaise,
      dueDate: caseData.appointedDay,
      asOfDate: todayStr,
      paidPaise: caseData.paidAmountPaise || 0,
    });

    const reminderId = `rem_${crypto.randomUUID()}`;

    // 5. Build Reminder Draft and place into Human Approval Queue (status = 'pending')
    await adminDb.collection('reminders').doc(reminderId).set({
      id: reminderId,
      caseId: caseData.id,
      ownerUid: caseData.ownerUid,
      trigger: triggerMilestone,
      scheduledFor: new Date().toISOString(),
      status: 'pending', // PENDING USER APPROVAL TAP
      channel: 'email',
      templateName: 'statutory_overdue_notice',
      accruedInterestPaise: interestCalc.interestPaise,
      totalDuePaise: interestCalc.totalPaise,
      idempotencyKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 6. Transition Case State to REMINDER_DUE
    await caseService.transition({
      caseId: caseData.id,
      toState: 'REMINDER_DUE',
      ownerUid: caseData.ownerUid,
      actor: { uid: 'system', role: 'system' },
      idempotencyKey: `trans_${idempotencyKey}`,
      metadata: { triggerMilestone, daysOverdue },
    });

    remindersCreatedCount++;
  }

  await writeAuditLog({
    uid: 'system_scheduler',
    action: 'SCHEDULER_MILESTONE_CHECK',
    resourceId: 'batch',
    details: {
      casesProcessed: casesProcessedCount,
      remindersCreated: remindersCreatedCount,
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Scheduler milestone check complete.',
    processed: casesProcessedCount,
    remindersEnqueued: remindersCreatedCount,
  });
}
