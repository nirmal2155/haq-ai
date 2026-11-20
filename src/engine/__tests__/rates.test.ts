import { describe, it, expect } from 'vitest';
import {
  getBankRate,
  getStatutoryInterestRate,
  assertNoPlaceholderRates,
  RBI_RATES_TABLE,
  RateEntry,
} from '../rates';

describe('Versioned RBI Rates Table & CI Checks', () => {
  it('fetches current 6.75% rate for post-Feb 2023 dates', () => {
    const rate = getBankRate('2024-03-31');
    expect(rate.bankRatePct).toBe(6.75);
    expect(rate.effectiveFrom).toBe('2023-02-08');
  });

  it('fetches historical rates correctly for 2022 periods', () => {
    // Between 2022-12-07 and 2023-02-08: 6.50%
    const rateDec22 = getBankRate('2023-01-15');
    expect(rateDec22.bankRatePct).toBe(6.50);

    // Between 2022-09-30 and 2022-12-07: 6.15%
    const rateOct22 = getBankRate('2022-10-15');
    expect(rateOct22.bankRatePct).toBe(6.15);

    // Early 2022 (June): 5.15%
    const rateJun22 = getBankRate('2022-06-15');
    expect(rateJun22.bankRatePct).toBe(5.15);
  });

  it('calculates 3x statutory multiplier rate', () => {
    const statRate = getStatutoryInterestRate('2024-01-01');
    // 6.75 * 3 = 20.25
    expect(statRate.toNumber()).toBe(20.25);
  });

  it('passes CI check when all rate rows are verified and not placeholders', () => {
    expect(() => assertNoPlaceholderRates(RBI_RATES_TABLE)).not.toThrow();
  });

  it('CI check fails if any row is flagged as placeholder or missing verification', () => {
    const invalidTable: RateEntry[] = [
      {
        effectiveFrom: '2026-01-01',
        effectiveDate: '2026-01-01',
        bankRatePct: 7.00,
        ratePercent: 7.00,
        source: 'Estimated future rate',
        verifiedOn: '',
        isPlaceholder: true,
      },
    ];

    expect(() => assertNoPlaceholderRates(invalidTable)).toThrowError(/CI CHECK FAILED/);
  });
});
