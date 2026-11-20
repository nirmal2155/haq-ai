import Decimal from 'decimal.js';
import { getBankRate, RBI_RATES_TABLE, RateEntry } from './rates';

// Configure Decimal for exact financial calculations
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export interface LegalConfig {
  bankRatePercent: number; // Configured base bank rate
  rateMultiplier: number; // MSMED Act statutory multiplier = 3
  compounding: 'monthly' | 'annual';
  noAgreementDays: number; // 15
  maxAgreedDays: number; // 45
}

export const DEFAULT_LEGAL_CONFIG: LegalConfig = {
  bankRatePercent: 6.5,
  rateMultiplier: 3,
  compounding: 'monthly',
  noAgreementDays: 15,
  maxAgreedDays: 45,
};

// Re-export BankRateEntry & RBI table for backward compatibility
export type BankRateEntry = RateEntry;
export const RBI_BANK_RATE_TABLE = RBI_RATES_TABLE;

export function getNotifiedBankRate(asOfDate: string): RateEntry {
  return getBankRate(asOfDate, RBI_RATES_TABLE);
}

export interface PartPayment {
  paymentDate: string; // YYYY-MM-DD
  amountPaise: number;
}

export interface InterestInput {
  principalPaise: number;
  dueDate: string; // YYYY-MM-DD (or appointed day)
  asOfDate: string; // YYYY-MM-DD (calculation date)
  paidPaise?: number;
  partPayments?: PartPayment[];
  config?: Partial<LegalConfig>;
}

export interface InterestBreakdownPeriod {
  periodStart: string; // YYYY-MM-DD
  periodEnd: string; // YYYY-MM-DD
  days: number;
  openingPrincipalPaise: number;
  bankRatePercent: number;
  statutoryRatePercent: number;
  interestPaise: number;
  closingPrincipalPaise: number;
}

export interface InterestResult {
  daysOverdue: number;
  unpaidPrincipalPaise: number;
  interestPaise: number;
  totalPaise: number;
  effectiveAnnualRatePercent: number;
  breakdown: InterestBreakdownPeriod[];
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function parseDateStr(dateStr: string): Date {
  const clean = dateStr.includes('T') ? (dateStr.split('T')[0] ?? '') : dateStr;
  const [y, m, d] = clean.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatDateStr(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Computes statutory interest under Section 16 of the MSMED Act 2006:
 * - Rate: 3x RBI Bank Rate (with dynamic rate shifts supported)
 * - Compounding: Monthly rests (or annual if configured)
 * - Period: from the appointed day (or due date) to calculation date
 * - Handles:
 *   1. Rate changes mid-period
 *   2. Leap years (366 days) vs non-leap years (365 days)
 *   3. Month-end calendar variations (28/29/30/31 days)
 *   4. Zero overdue / future dates (strictly 0 interest)
 *   5. Part payments reducing principal balance
 */
export function computeInterest(input: InterestInput): InterestResult {
  const {
    principalPaise,
    dueDate,
    asOfDate,
    paidPaise = 0,
    partPayments = [],
    config: userConfig,
  } = input;

  const config: LegalConfig = { ...DEFAULT_LEGAL_CONFIG, ...userConfig };
  const multiplier = config.rateMultiplier ?? 3;

  const startUtc = parseDateStr(dueDate);
  const endUtc = parseDateStr(asOfDate);

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysOverdue = Math.max(0, Math.floor((endUtc.getTime() - startUtc.getTime()) / msPerDay));

  // Determine initial unpaid balance after total direct paidPaise
  let currentPrincipal = Math.max(0, principalPaise - (paidPaise || 0));

  // If due date is on or after asOfDate, or principal is 0: zero overdue, zero interest
  if (daysOverdue === 0 || currentPrincipal === 0) {
    const defaultBankRate = config.bankRatePercent ?? getBankRate(asOfDate).bankRatePct;
    return {
      daysOverdue: 0,
      unpaidPrincipalPaise: currentPrincipal,
      interestPaise: 0,
      totalPaise: currentPrincipal,
      effectiveAnnualRatePercent: Number(new Decimal(defaultBankRate).times(multiplier)),
      breakdown: [],
    };
  }

  // Sort part payments by date
  const sortedPayments = [...partPayments].sort((a, b) =>
    a.paymentDate.localeCompare(b.paymentDate)
  );

  const breakdown: InterestBreakdownPeriod[] = [];
  let currentBalance = new Decimal(currentPrincipal);
  let totalAccruedInterest = new Decimal(0);
  let periodStart = new Date(startUtc.getTime());

  // Generate monthly compounding rest points, plus any rate changes or part-payment dates
  while (periodStart < endUtc) {
    // Determine next monthly rest
    const nextRest = new Date(periodStart.getTime());
    if (config.compounding === 'monthly') {
      nextRest.setUTCMonth(nextRest.getUTCMonth() + 1);
    } else {
      nextRest.setUTCFullYear(nextRest.getUTCFullYear() + 1);
    }

    // Limit next segment to calculation end date
    let segmentEnd = nextRest > endUtc ? new Date(endUtc.getTime()) : nextRest;

    // Check if any part payments happen before segmentEnd
    const pendingPayment = sortedPayments.find((p) => {
      const pDate = parseDateStr(p.paymentDate);
      return pDate > periodStart && pDate < segmentEnd;
    });

    if (pendingPayment) {
      segmentEnd = parseDateStr(pendingPayment.paymentDate);
    }

    const periodDays = Math.max(
      0,
      Math.floor((segmentEnd.getTime() - periodStart.getTime()) / msPerDay)
    );

    if (periodDays > 0) {
      const startStr = formatDateStr(periodStart);
      const activeBankRate =
        config.bankRatePercent !== undefined
          ? config.bankRatePercent
          : getBankRate(startStr).bankRatePct;

      const statutoryRatePct = new Decimal(activeBankRate).times(multiplier);
      const year = periodStart.getUTCFullYear();
      const daysInYear = isLeapYear(year) ? 366 : 365;

      // Period Interest = balance * (statutoryRate / 100) * (days / daysInYear)
      const periodInterest = currentBalance
        .times(statutoryRatePct)
        .dividedBy(100)
        .times(new Decimal(periodDays))
        .dividedBy(new Decimal(daysInYear));

      const openingPaise = currentBalance.round().toNumber();
      const periodInterestPaise = periodInterest.round().toNumber();

      totalAccruedInterest = totalAccruedInterest.plus(periodInterest);
      currentBalance = currentBalance.plus(periodInterest);

      breakdown.push({
        periodStart: startStr,
        periodEnd: formatDateStr(segmentEnd),
        days: periodDays,
        openingPrincipalPaise: openingPaise,
        bankRatePercent: activeBankRate,
        statutoryRatePercent: statutoryRatePct.toNumber(),
        interestPaise: periodInterestPaise,
        closingPrincipalPaise: currentBalance.round().toNumber(),
      });
    }

    // If a part payment was reached exactly at segmentEnd, deduct from principal
    if (pendingPayment && formatDateStr(segmentEnd) === pendingPayment.paymentDate) {
      currentBalance = Decimal.max(0, currentBalance.minus(pendingPayment.amountPaise));
      // Remove handled payment
      const idx = sortedPayments.indexOf(pendingPayment);
      if (idx !== -1) sortedPayments.splice(idx, 1);
    }

    periodStart = segmentEnd;
  }

  const finalInterestPaise = Math.max(0, totalAccruedInterest.round().toNumber());
  const finalTotalPaise = currentPrincipal + finalInterestPaise;
  const latestBankRate = config.bankRatePercent ?? getBankRate(asOfDate).bankRatePct;

  return {
    daysOverdue,
    unpaidPrincipalPaise: currentPrincipal,
    interestPaise: finalInterestPaise,
    totalPaise: finalTotalPaise,
    effectiveAnnualRatePercent: Number(new Decimal(latestBankRate).times(multiplier)),
    breakdown,
  };
}

/**
 * Simplified wrapper for calculating MSME interest from Date objects.
 */
export function calculateMsmeInterest(params: {
  principalPaise: number;
  appointedDay: Date;
  calculationDate: Date;
  paidAmountPaise?: number;
  bankRateOverride?: number;
}): {
  interestPaise: number;
  totalDuePaise: number;
  daysOverdue: number;
  effectiveRatePercent: number;
} {
  const dueStr = formatDateStr(params.appointedDay);
  const calcStr = formatDateStr(params.calculationDate);

  const res = computeInterest({
    principalPaise: params.principalPaise,
    dueDate: dueStr,
    asOfDate: calcStr,
    paidPaise: params.paidAmountPaise ?? 0,
    config: params.bankRateOverride ? { bankRatePercent: params.bankRateOverride } : undefined,
  });

  return {
    interestPaise: res.interestPaise,
    totalDuePaise: res.totalPaise,
    daysOverdue: res.daysOverdue,
    effectiveRatePercent: res.effectiveAnnualRatePercent,
  };
}
