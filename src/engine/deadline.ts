export type DeadlineRule = '15_DAY_NO_AGREEMENT' | 'AGREED_TERM' | '45_DAY_STATUTORY_CAP';

export interface DueDateInput {
  acceptanceDate: string; // YYYY-MM-DD
  hasWrittenAgreement: boolean;
  agreedCreditDays?: number | null;
}

export interface DueDateResult {
  dueDate: string; // YYYY-MM-DD
  effectiveCreditDays: number;
  rule: DeadlineRule;
}

/**
 * Adds an integer number of days to a UTC calendar date string (YYYY-MM-DD).
 * Accurately accounts for leap years and varying month lengths.
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    throw new Error(`Invalid date format, expected YYYY-MM-DD: ${dateStr}`);
  }

  const [year, month, day] = parts.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateStr}`);
  }

  date.setUTCDate(date.getUTCDate() + days);

  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
}

/**
 * Computes statutory due date under Section 15 of MSMED Act 2006.
 *
 * Statutory Rule:
 * 1. If NO written agreement: Due date is strictly acceptance date + 15 days.
 * 2. If written agreement exists: Due date is acceptance date + min(agreedCreditDays, 45).
 *    Agreements stipulating terms > 45 days are legally void beyond 45 days under Section 15.
 */
export function computeDueDate(input: DueDateInput): DueDateResult {
  const { acceptanceDate, hasWrittenAgreement, agreedCreditDays } = input;

  if (!hasWrittenAgreement) {
    return {
      dueDate: addDaysToDate(acceptanceDate, 15),
      effectiveCreditDays: 15,
      rule: '15_DAY_NO_AGREEMENT',
    };
  }

  const requestedDays = agreedCreditDays ?? 45;

  if (requestedDays > 45) {
    return {
      dueDate: addDaysToDate(acceptanceDate, 45),
      effectiveCreditDays: 45,
      rule: '45_DAY_STATUTORY_CAP',
    };
  }

  const effectiveDays = Math.max(0, requestedDays);
  return {
    dueDate: addDaysToDate(acceptanceDate, effectiveDays),
    effectiveCreditDays: effectiveDays,
    rule: 'AGREED_TERM',
  };
}

/**
 * Computes Deemed Acceptance Date under Section 2(b) of MSMED Act 2006.
 *
 * "The day of deemed acceptance means, where no objection is made in writing
 *  with regard to the acceptance of goods or services within fifteen days
 *  from the day of delivery of goods or the rendering of services, the day of
 *  the actual delivery of goods or the rendering of services."
 *
 * If objection was lodged within 15 days and subsequently removed/resolved,
 * acceptance date is the date of dispute resolution.
 * If no objection was made, deemed acceptance date is deliveryDate + 15 days.
 */
export function computeDeemedAcceptance(
  deliveryDate: string,
  writtenObjectionDate?: string | null
): { deemedAcceptanceDate: string; isDeemed: boolean } {
  if (writtenObjectionDate) {
    return {
      deemedAcceptanceDate: writtenObjectionDate,
      isDeemed: false,
    };
  }

  return {
    deemedAcceptanceDate: addDaysToDate(deliveryDate, 15),
    isDeemed: true,
  };
}
