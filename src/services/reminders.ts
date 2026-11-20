export type ReminderTrigger =
  | 'before_due'
  | 'on_appointed_day'
  | 'overdue_15_days'
  | 'overdue_30_days'
  | 'year_end_43bh';

export interface StatutoryReminder {
  id: string;
  caseId: string;
  trigger: ReminderTrigger;
  scheduledFor: string;
  sentAt?: string;
  channel: 'email' | 'whatsapp' | 'sms';
  templateName: string;
  status: 'pending' | 'sent' | 'cancelled';
}

export function generateStatutorySchedule(
  caseId: string,
  appointedDay: Date
): StatutoryReminder[] {
  const schedule: StatutoryReminder[] = [];
  const baseTime = appointedDay.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  // 1. T-3 days friendly heads-up
  schedule.push({
    id: `rem_${caseId}_t_minus_3`,
    caseId,
    trigger: 'before_due',
    scheduledFor: new Date(baseTime - 3 * dayMs).toISOString(),
    channel: 'email',
    templateName: 'friendly_due_soon',
    status: 'pending',
  });

  // 2. T+0 Appointed day reminder
  schedule.push({
    id: `rem_${caseId}_appointed_day`,
    caseId,
    trigger: 'on_appointed_day',
    scheduledFor: appointedDay.toISOString(),
    channel: 'email',
    templateName: 'appointed_day_notice',
    status: 'pending',
  });

  // 3. T+15 Overdue reminder (Section 16 interest compounding reminder)
  schedule.push({
    id: `rem_${caseId}_t_plus_15`,
    caseId,
    trigger: 'overdue_15_days',
    scheduledFor: new Date(baseTime + 15 * dayMs).toISOString(),
    channel: 'email',
    templateName: 'formal_compound_interest_notice',
    status: 'pending',
  });

  // 4. T+30 Formal statutory notice reminder
  schedule.push({
    id: `rem_${caseId}_t_plus_30`,
    caseId,
    trigger: 'overdue_30_days',
    scheduledFor: new Date(baseTime + 30 * dayMs).toISOString(),
    channel: 'email',
    templateName: 'statutory_demand_notice',
    status: 'pending',
  });

  return schedule;
}
