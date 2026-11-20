export type NextActionType =
  | 'wait'
  | 'friendly_reminder'
  | 'formal_reminder'
  | 'draft_notice'
  | 'samadhaan_kit';

export type ActionPriority = 'low' | 'medium' | 'high' | 'critical';

export interface NextActionInput {
  daysToDue: number; // positive if in the future, negative if overdue
  daysOverdue: number; // 0 if not overdue, positive if overdue
  unpaidPaise: number;
  hasDispute?: boolean;
}

export interface NextActionResult {
  action: NextActionType;
  label: string;
  priority: ActionPriority;
  statutoryReason: string;
  recommendedChannel: 'none' | 'whatsapp' | 'email' | 'registered_post' | 'msefc_portal';
  legalDisclaimer: string;
}

/**
 * Pure deterministic rule engine (NOT AI) that maps statutory due status
 * to actionable recovery milestones under the MSMED Act 2006.
 */
export function determineNextAction(input: NextActionInput): NextActionResult {
  const { daysToDue, daysOverdue, unpaidPaise, hasDispute } = input;
  const legalDisclaimer = 'Draft only. Review with a CA/lawyer before sending.';

  // If fully paid
  if (unpaidPaise <= 0) {
    return {
      action: 'wait',
      label: 'Settled',
      priority: 'low',
      statutoryReason: 'Invoice is fully paid. No recovery action required.',
      recommendedChannel: 'none',
      legalDisclaimer,
    };
  }

  // If a formal dispute has been raised by the buyer within 15 days
  if (hasDispute) {
    return {
      action: 'formal_reminder',
      label: 'Clarify Dispute / Objection',
      priority: 'high',
      statutoryReason:
        'Buyer lodged an objection under Section 2(b). Statutory deadline pauses until dispute is resolved in writing.',
      recommendedChannel: 'email',
      legalDisclaimer,
    };
  }

  // Not overdue yet
  if (daysOverdue <= 0) {
    if (daysToDue > 7) {
      return {
        action: 'wait',
        label: 'Wait (Within Credit Term)',
        priority: 'low',
        statutoryReason: `Invoice is within agreed credit terms (${daysToDue} days remaining until appointed day).`,
        recommendedChannel: 'none',
        legalDisclaimer,
      };
    }

    return {
      action: 'friendly_reminder',
      label: 'Friendly Advance Reminder',
      priority: 'low',
      statutoryReason: `Statutory payment due in ${daysToDue} days. Courtesy notification to ensure payment processing before appointed day.`,
      recommendedChannel: 'whatsapp',
      legalDisclaimer,
    };
  }

  // Overdue: Tier 1 (1 to 15 days overdue)
  if (daysOverdue <= 15) {
    return {
      action: 'friendly_reminder',
      label: 'Soft Overdue Reminder',
      priority: 'medium',
      statutoryReason: `Bill is ${daysOverdue} days overdue. Statutory interest under MSMED Act Section 16 is now accruing daily at 3x RBI bank rate.`,
      recommendedChannel: 'whatsapp',
      legalDisclaimer,
    };
  }

  // Overdue: Tier 2 (16 to 30 days overdue)
  if (daysOverdue <= 30) {
    return {
      action: 'formal_reminder',
      label: 'Formal Section 16 Demand',
      priority: 'high',
      statutoryReason: `Bill is ${daysOverdue} days overdue. Monthly compounding rest has elapsed. Statutory liability is compounding monthly.`,
      recommendedChannel: 'email',
      legalDisclaimer,
    };
  }

  // Overdue: Tier 3 (31 to 45 days overdue)
  if (daysOverdue <= 45) {
    return {
      action: 'draft_notice',
      label: 'Statutory Legal Notice',
      priority: 'critical',
      statutoryReason: `Bill is ${daysOverdue} days overdue. Formal statutory notice under MSMED Act Section 15 & 16 required before MSEFC escalation.`,
      recommendedChannel: 'registered_post',
      legalDisclaimer,
    };
  }

  // Overdue: Tier 4 (> 45 days overdue)
  return {
    action: 'samadhaan_kit',
    label: 'MSME Samadhaan Filing Kit',
    priority: 'critical',
    statutoryReason: `Bill is ${daysOverdue} days overdue. Statutory maximum 45-day window has expired. Prepare filing kit for Micro and Small Enterprise Facilitation Council (MSEFC).`,
    recommendedChannel: 'msefc_portal',
    legalDisclaimer,
  };
}
