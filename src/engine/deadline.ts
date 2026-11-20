/**
 * Haq AI — Statutory Deadline & Appointed Day Engine
 * References:
 * - MSMED Act 2006: Section 2(b) ("day of acceptance", "day of deemed acceptance", "appointed day")
 * - MSMED Act 2006: Section 15 ("liability of buyer to make payment")
 * - Income Tax Act 1961: Section 43B(h)
 *
 * Core Statutory Rules:
 * 1. Without written agreement: statutory limit is strictly 15 days from acceptance/deemed acceptance.
 * 2. With written agreement: limit is agreed days, strictly capped at 45 days. Any contract term > 45 days is void ab initio under Section 15 proviso.
 * 3. Deemed acceptance: If buyer makes no written objection within 15 days of delivery, acceptance is deemed to have occurred on the delivery date. If written objection was made within 15 days, acceptance occurs on dispute resolution date.
 * 4. Appointed day: The day following immediately after the expiry of 15 days from acceptance (when no agreement), or the day following the agreed credit period (capped at 45 days).
 *
 * All dates are IST calendar dates (YYYY-MM-DD), avoiding timezone offset bugs.
 */

export type DeadlineRule = '15_DAY_NO_AGREEMENT' | 'AGREED_TERM' | '45_DAY_STATUTORY_CAP';

export interface DueDateInput {
  acceptanceDate: string; // YYYY-MM-DD (IST calendar date)
  hasWrittenAgreement: boolean;
  agreedCreditDays?: number | null;
}

export interface DueDateResult {
  dueDate: string; // YYYY-MM-DD
  effectiveCreditDays: number;
  rule: DeadlineRule;
}

export interface AppointedDayInput {
  invoiceDate?: string | Date;
  deliveryDate?: string | Date;
  acceptanceDate?: string | Date;
  agreedPaymentDays?: number | null;
  hasWrittenAgreement?: boolean;
  writtenObjectionDate?: string | null;
  calculationDate?: string | Date;
}

export interface AppointedDayResult {
  baseAcceptanceDate: string; // YYYY-MM-DD
  isDeemedAcceptance: boolean;
  statutoryLimitDays: number;
  appointedDay: Date;
  appointedDayStr: string; // YYYY-MM-DD
  rule: DeadlineRule;
  isOverdue: boolean;
  daysOverdue: number;
}

/**
 * Validates and normalizes date inputs to YYYY-MM-DD in IST.
 */
export function normalizeDateToIST(d: string | Date): string {
  if (typeof d === 'string') {
    // If already YYYY-MM-DD
    const match = /^\d{4}-\d{2}-\d{2}/.exec(d.trim());
    if (match) {
      return match[0];
    }
  }

  const dateObj = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid date provided: ${d}`);
  }

  // Use UTC getters to avoid local machine timezone shifting
  const y = dateObj.getUTCFullYear();
  const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Adds an integer number of days to a calendar date string (YYYY-MM-DD).
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
 * Computes difference in calendar days between two YYYY-MM-DD dates (end - start).
 */
export function daysBetweenDates(startDateStr: string, endDateStr: string): number {
  const [y1, m1, d1] = startDateStr.split('-').map(Number);
  const [y2, m2, d2] = endDateStr.split('-').map(Number);

  const startUtc = Date.UTC(y1, m1 - 1, d1);
  const endUtc = Date.UTC(y2, m2 - 1, d2);

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((endUtc - startUtc) / msPerDay);
}

/**
 * Computes statutory due date under Section 15 of MSMED Act 2006.
 */
export function computeDueDate(input: DueDateInput): DueDateResult {
  const { acceptanceDate, hasWrittenAgreement, agreedCreditDays } = input;
  const cleanAcceptance = normalizeDateToIST(acceptanceDate);

  if (!hasWrittenAgreement) {
    return {
      dueDate: addDaysToDate(cleanAcceptance, 15),
      effectiveCreditDays: 15,
      rule: '15_DAY_NO_AGREEMENT',
    };
  }

  const requestedDays = agreedCreditDays ?? 45;

  if (requestedDays > 45) {
    return {
      dueDate: addDaysToDate(cleanAcceptance, 45),
      effectiveCreditDays: 45,
      rule: '45_DAY_STATUTORY_CAP',
    };
  }

  const effectiveDays = Math.max(0, requestedDays);
  return {
    dueDate: addDaysToDate(cleanAcceptance, effectiveDays),
    effectiveCreditDays: effectiveDays,
    rule: 'AGREED_TERM',
  };
}

/**
 * Computes Deemed Acceptance Date under Section 2(b) of MSMED Act 2006.
 *
 * If no objection is made in writing within 15 days of delivery,
 * acceptance date is the date of delivery.
 * If written objection was lodged within 15 days and later resolved,
 * acceptance date is the date of resolution.
 */
export function computeDeemedAcceptance(
  deliveryDate: string,
  writtenObjectionDate?: string | null
): { deemedAcceptanceDate: string; isDeemed: boolean } {
  const cleanDelivery = normalizeDateToIST(deliveryDate);

  if (writtenObjectionDate) {
    return {
      deemedAcceptanceDate: normalizeDateToIST(writtenObjectionDate),
      isDeemed: false,
    };
  }

  // Deemed acceptance occurs on delivery date + 15 days for objection expiry window
  return {
    deemedAcceptanceDate: addDaysToDate(cleanDelivery, 15),
    isDeemed: true,
  };
}

/**
 * High-level engine function for appointed day and overdue calculation.
 */
export function computeAppointedDay(input: AppointedDayInput): AppointedDayResult {
  const invoiceDateStr = input.invoiceDate ? normalizeDateToIST(input.invoiceDate) : undefined;
  const deliveryDateStr = input.deliveryDate ? normalizeDateToIST(input.deliveryDate) : undefined;
  const directAcceptanceStr = input.acceptanceDate ? normalizeDateToIST(input.acceptanceDate) : undefined;

  let baseAcceptanceDate: string;
  let isDeemedAcceptance = false;

  if (directAcceptanceStr) {
    baseAcceptanceDate = directAcceptanceStr;
  } else if (deliveryDateStr) {
    const deemed = computeDeemedAcceptance(deliveryDateStr, input.writtenObjectionDate);
    baseAcceptanceDate = deemed.deemedAcceptanceDate;
    isDeemedAcceptance = deemed.isDeemed;
  } else if (invoiceDateStr) {
    baseAcceptanceDate = invoiceDateStr;
  } else {
    throw new Error('At least one of acceptanceDate, deliveryDate, or invoiceDate must be provided');
  }

  const hasAgreement =
    input.hasWrittenAgreement !== undefined
      ? input.hasWrittenAgreement
      : input.agreedPaymentDays !== undefined && input.agreedPaymentDays !== null;

  const dueRes = computeDueDate({
    acceptanceDate: baseAcceptanceDate,
    hasWrittenAgreement: hasAgreement,
    agreedCreditDays: input.agreedPaymentDays,
  });

  const appointedDayDate = new Date(`${dueRes.dueDate}T00:00:00.000Z`);
  const calcDateStr = input.calculationDate
    ? normalizeDateToIST(input.calculationDate)
    : normalizeDateToIST(new Date());

  const daysDiff = daysBetweenDates(dueRes.dueDate, calcDateStr);
  const daysOverdue = Math.max(0, daysDiff);
  const isOverdue = daysOverdue > 0;

  return {
    baseAcceptanceDate,
    isDeemedAcceptance,
    statutoryLimitDays: dueRes.effectiveCreditDays,
    appointedDay: appointedDayDate,
    appointedDayStr: dueRes.dueDate,
    rule: dueRes.rule,
    isOverdue,
    daysOverdue,
  };
}
