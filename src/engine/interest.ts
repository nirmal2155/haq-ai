import Decimal from 'decimal.js';

export interface LegalConfig {
  bankRatePercent: number; // e.g. 6.5 or 6.75 (RBI Repo / Bank rate)
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

export interface InterestInput {
  principalPaise: number;
  dueDate: string; // YYYY-MM-DD
  asOfDate: string; // YYYY-MM-DD
  paidPaise?: number;
  config: LegalConfig;
}

export interface InterestBreakdownPeriod {
  periodStart: string;
  periodEnd: string;
  days: number;
  openingPrincipalPaise: number;
  ratePercent: number;
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

function parseDateUtc(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatDateUtc(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Computes statutory interest under Section 16 of the MSMED Act 2006:
 * - Rate: 3x RBI Bank Rate
 * - Compounding: Monthly rests (or annual if configured)
 * - Period: from the day immediately following the due date to the asOfDate
 */
export function computeInterest(input: InterestInput): InterestResult {
  const { principalPaise, dueDate, asOfDate, paidPaise = 0, config } = input;

  const unpaidPrincipal = Math.max(0, principalPaise - (paidPaise || 0));

  const startUtc = parseDateUtc(dueDate);
  const endUtc = parseDateUtc(asOfDate);

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysOverdue = Math.max(0, Math.floor((endUtc.getTime() - startUtc.getTime()) / msPerDay));

  const effectiveRate = new Decimal(config.bankRatePercent).times(config.rateMultiplier);
  const annualRateDecimal = effectiveRate.dividedBy(100);

  // If on-time, zero principal, or future date:
  if (daysOverdue === 0 || unpaidPrincipal === 0) {
    return {
      daysOverdue: 0,
      unpaidPrincipalPaise: unpaidPrincipal,
      interestPaise: 0,
      totalPaise: unpaidPrincipal,
      effectiveAnnualRatePercent: effectiveRate.toNumber(),
      breakdown: [],
    };
  }

  // Iterate period with monthly rests
  const breakdown: InterestBreakdownPeriod[] = [];
  let currentBalance = new Decimal(unpaidPrincipal);
  let totalInterest = new Decimal(0);
  let currentPeriodStart = new Date(startUtc.getTime());

  while (currentPeriodStart < endUtc) {
    let nextRest = new Date(currentPeriodStart.getTime());

    if (config.compounding === 'monthly') {
      // Advance by 1 month for monthly rests
      nextRest.setUTCMonth(nextRest.getUTCMonth() + 1);
    } else {
      // Advance by 1 year for annual rests
      nextRest.setUTCFullYear(nextRest.getUTCFullYear() + 1);
    }

    const currentPeriodEnd = nextRest > endUtc ? new Date(endUtc.getTime()) : nextRest;
    const periodDays = Math.max(
      0,
      Math.floor((currentPeriodEnd.getTime() - currentPeriodStart.getTime()) / msPerDay)
    );

    if (periodDays <= 0) break;

    const yearOfPeriod = currentPeriodStart.getUTCFullYear();
    const daysInYear = isLeapYear(yearOfPeriod) ? 366 : 365;

    // Period interest = currentBalance * annualRate * (periodDays / daysInYear)
    const periodInterest = currentBalance
      .times(annualRateDecimal)
      .times(new Decimal(periodDays))
      .dividedBy(new Decimal(daysInYear));

    const openingPaise = currentBalance.round().toNumber();
    const periodInterestPaise = periodInterest.round().toNumber();

    totalInterest = totalInterest.plus(periodInterest);
    currentBalance = currentBalance.plus(periodInterest);

    breakdown.push({
      periodStart: formatDateUtc(currentPeriodStart),
      periodEnd: formatDateUtc(currentPeriodEnd),
      days: periodDays,
      openingPrincipalPaise: openingPaise,
      ratePercent: effectiveRate.toNumber(),
      interestPaise: periodInterestPaise,
      closingPrincipalPaise: currentBalance.round().toNumber(),
    });

    currentPeriodStart = currentPeriodEnd;
  }

  const finalInterestPaise = Math.max(0, totalInterest.round().toNumber());
  const finalTotalPaise = unpaidPrincipal + finalInterestPaise;

  return {
    daysOverdue,
    unpaidPrincipalPaise: unpaidPrincipal,
    interestPaise: finalInterestPaise,
    totalPaise: finalTotalPaise,
    effectiveAnnualRatePercent: effectiveRate.toNumber(),
    breakdown,
  };
}
