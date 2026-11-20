import Decimal from 'decimal.js';

export interface RateEntry {
  effectiveFrom: string; // YYYY-MM-DD
  effectiveDate: string; // Alias for backward compatibility
  bankRatePct: number; // Percentage e.g. 6.75
  ratePercent: number; // Alias for backward compatibility
  source: string; // Official gazette / circular reference
  verifiedOn: string; // YYYY-MM-DD (Date verified by CA/Auditor)
  isPlaceholder?: boolean; // Flag for unverified future projections
}

/**
 * Historical and current versioned RBI Bank Rate table.
 * Verified against RBI official notifications under Section 49 of RBI Act 1934.
 *
 * Stored in chronological descending order (newest first).
 */
export const RBI_RATES_TABLE: RateEntry[] = [
  {
    effectiveFrom: '2023-02-08',
    effectiveDate: '2023-02-08',
    bankRatePct: 6.75,
    ratePercent: 6.75,
    source: 'RBI Monetary Policy Resolution (Feb 8, 2023) - Bank Rate 6.75%',
    verifiedOn: '2024-03-31',
    isPlaceholder: false,
  },
  {
    effectiveFrom: '2022-12-07',
    effectiveDate: '2022-12-07',
    bankRatePct: 6.50,
    ratePercent: 6.50,
    source: 'RBI Monetary Policy Resolution (Dec 7, 2022) - Bank Rate 6.50%',
    verifiedOn: '2024-03-31',
    isPlaceholder: false,
  },
  {
    effectiveFrom: '2022-09-30',
    effectiveDate: '2022-09-30',
    bankRatePct: 6.15,
    ratePercent: 6.15,
    source: 'RBI Monetary Policy Resolution (Sep 30, 2022) - Bank Rate 6.15%',
    verifiedOn: '2024-03-31',
    isPlaceholder: false,
  },
  {
    effectiveFrom: '2022-08-05',
    effectiveDate: '2022-08-05',
    bankRatePct: 5.65,
    ratePercent: 5.65,
    source: 'RBI Monetary Policy Resolution (Aug 5, 2022) - Bank Rate 5.65%',
    verifiedOn: '2024-03-31',
    isPlaceholder: false,
  },
  {
    effectiveFrom: '2022-06-08',
    effectiveDate: '2022-06-08',
    bankRatePct: 5.15,
    ratePercent: 5.15,
    source: 'RBI Monetary Policy Resolution (Jun 8, 2022) - Bank Rate 5.15%',
    verifiedOn: '2024-03-31',
    isPlaceholder: false,
  },
  {
    effectiveFrom: '2022-05-04',
    effectiveDate: '2022-05-04',
    bankRatePct: 4.65,
    ratePercent: 4.65,
    source: 'RBI Off-cycle MPC Resolution (May 4, 2022) - Bank Rate 4.65%',
    verifiedOn: '2024-03-31',
    isPlaceholder: false,
  },
  {
    effectiveFrom: '2020-05-22',
    effectiveDate: '2020-05-22',
    bankRatePct: 4.25,
    ratePercent: 4.25,
    source: 'RBI Monetary Policy Statement (May 22, 2020) - Bank Rate 4.25%',
    verifiedOn: '2024-03-31',
    isPlaceholder: false,
  },
  {
    effectiveFrom: '2020-03-27',
    effectiveDate: '2020-03-27',
    bankRatePct: 4.65,
    ratePercent: 4.65,
    source: 'RBI COVID-19 Regulatory Package (Mar 27, 2020) - Bank Rate 4.65%',
    verifiedOn: '2024-03-31',
    isPlaceholder: false,
  },
];

/**
 * Looks up the notified RBI Bank Rate effective for a given calendar date (YYYY-MM-DD).
 */
export function getBankRate(dateStr: string, table: RateEntry[] = RBI_RATES_TABLE): RateEntry {
  const cleanDate = dateStr.includes('T') ? (dateStr.split('T')[0] ?? '') : dateStr;

  for (const entry of table) {
    if (cleanDate >= entry.effectiveFrom) {
      return entry;
    }
  }

  // Fallback to earliest recorded rate
  const oldest = table[table.length - 1];
  if (!oldest) {
    throw new Error('RBI rates table is empty');
  }
  return oldest;
}

/**
 * Returns effective MSMED Section 16 interest rate (3x bank rate) as a Decimal percentage.
 * Example: for 6.75% bank rate, returns 20.25 (as Decimal).
 */
export function getStatutoryInterestRate(
  dateStr: string,
  table: RateEntry[] = RBI_RATES_TABLE
): Decimal {
  const entry = getBankRate(dateStr, table);
  return new Decimal(entry.bankRatePct).times(3);
}

/**
 * CI / Integrity check: fails if any unverified placeholder rows exist in active rates.
 * Ensures production deployments never run on speculative/unverified rates.
 */
export function assertNoPlaceholderRates(table: RateEntry[] = RBI_RATES_TABLE): void {
  const unverified = table.filter(
    (entry) => entry.isPlaceholder === true || !entry.verifiedOn || entry.verifiedOn.trim() === ''
  );

  if (unverified.length > 0) {
    const errorDetails = unverified
      .map((e) => `[${e.effectiveFrom}] rate=${e.bankRatePct}% source=${e.source}`)
      .join('; ');
    throw new Error(
      `CI CHECK FAILED: Found ${unverified.length} unverified/placeholder rate row(s) in RBI rate table: ${errorDetails}`
    );
  }
}
