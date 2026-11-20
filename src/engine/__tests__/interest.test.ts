import { describe, it, expect } from 'vitest';
import {
  computeInterest,
  LegalConfig,
  DEFAULT_LEGAL_CONFIG,
  getNotifiedBankRate,
  RBI_BANK_RATE_TABLE,
} from '../interest';
import { rupeesToPaise, paiseToRupees, formatPaiseToINR } from '../money';

describe('MSMED Act Statutory Interest Engine (Section 16)', () => {
  const standardConfig: LegalConfig = {
    bankRatePercent: 6.5,
    rateMultiplier: 3, // 3 * 6.5% = 19.5% statutory rate
    compounding: 'monthly',
    noAgreementDays: 15,
    maxAgreedDays: 45,
  };

  describe('Money and Paise Helpers', () => {
    it('converts rupee string to exact integer paise', () => {
      expect(rupeesToPaise('1234.56')).toBe(123456);
      expect(rupeesToPaise('0.50')).toBe(50);
      expect(rupeesToPaise('100')).toBe(10000);
      expect(rupeesToPaise('1,00,000.00')).toBe(10000000);
    });

    it('converts integer paise back to rupee string', () => {
      expect(paiseToRupees(123456)).toBe('1234.56');
      expect(paiseToRupees(50)).toBe('0.50');
      expect(paiseToRupees(0)).toBe('0.00');
    });

    it('formats paise to Indian currency string', () => {
      expect(formatPaiseToINR(10000000)).toBe('₹1,00,000.00');
      expect(formatPaiseToINR(12345678)).toBe('₹1,23,456.78');
    });
  });

  describe('Edge Cases: On-time, Zero Principal, Negative Balances', () => {
    it('returns zero overdue days and zero interest when paid on time', () => {
      const res = computeInterest({
        principalPaise: 5000000,
        dueDate: '2026-03-31',
        asOfDate: '2026-03-31',
        config: standardConfig,
      });

      expect(res.daysOverdue).toBe(0);
      expect(res.interestPaise).toBe(0);
      expect(res.totalPaise).toBe(5000000);
      expect(res.breakdown).toHaveLength(0);
    });

    it('returns zero interest when checked before the due date (future date)', () => {
      const res = computeInterest({
        principalPaise: 5000000,
        dueDate: '2026-04-15',
        asOfDate: '2026-04-01',
        config: standardConfig,
      });

      expect(res.daysOverdue).toBe(0);
      expect(res.interestPaise).toBe(0);
      expect(res.totalPaise).toBe(5000000);
    });

    it('returns zero interest when principal is zero', () => {
      const res = computeInterest({
        principalPaise: 0,
        dueDate: '2026-01-01',
        asOfDate: '2026-02-01',
        config: standardConfig,
      });

      expect(res.interestPaise).toBe(0);
      expect(res.totalPaise).toBe(0);
    });

    it('correctly handles partial payment (only charges interest on unpaid balance)', () => {
      // Principal: ₹1,00,000 (10,000,000 paise), Paid: ₹40,000 (4,000,000 paise)
      // Unpaid Principal: ₹60,000 (6,000,000 paise)
      const res = computeInterest({
        principalPaise: 10000000,
        paidPaise: 4000000,
        dueDate: '2026-01-01',
        asOfDate: '2026-01-02',
        config: standardConfig,
      });

      expect(res.unpaidPrincipalPaise).toBe(6000000);
      expect(res.daysOverdue).toBe(1);
      // Interest on 6,000,000 paise for 1 day = 6000000 * 0.195 / 365 = 3205.47 paise -> 3205 paise
      expect(res.interestPaise).toBe(3205);
      expect(res.totalPaise).toBe(6003205);
    });
  });

  describe('Golden Test 1: Exactly 1 Day Late (Manual CA Verification)', () => {
    /**
     * Arithmetic Verification:
     * Principal = ₹1,00,000.00 = 10,000,000 paise
     * RBI Bank Rate = 6.5% -> MSMED Statutory Rate = 3 x 6.5% = 19.5% p.a.
     * Year 2026 has 365 days.
     * Interest for 1 day:
     *   = 10,000,000 * 0.195 * (1 / 365)
     *   = 5342.465753... paise
     *   Rounded half up = 5342 paise (₹53.42)
     * Total = 10,000,000 + 5342 = 10,005,342 paise (₹1,00,053.42)
     */
    it('computes exact interest for 1 day overdue', () => {
      const res = computeInterest({
        principalPaise: 10000000,
        dueDate: '2026-05-01',
        asOfDate: '2026-05-02',
        config: standardConfig,
      });

      expect(res.daysOverdue).toBe(1);
      expect(res.interestPaise).toBe(5342);
      expect(res.totalPaise).toBe(10005342);
      expect(paiseToRupees(res.interestPaise)).toBe('53.42');
    });
  });

  describe('Golden Test 2: Monthly Rests Compounding Across Months', () => {
    /**
     * Arithmetic Verification:
     * Principal = ₹1,00,000 = 10,000,000 paise
     * Due Date = 2026-01-01, asOfDate = 2026-03-01
     * Rest 1 (Jan 1, 2026 to Feb 1, 2026 = 31 days):
     *   Interest = 10,000,000 * 0.195 * (31 / 365) = 165616.438356... paise
     *   Balance at Feb 1 = 10,165,616.438356... paise
     * Rest 2 (Feb 1, 2026 to Mar 1, 2026 = 28 days in 2026):
     *   Interest = 10,165,616.438356... * 0.195 * (28 / 365) = 152066.4815... paise
     * Total accrued interest = 165616.438356 + 152066.481511 = 317682.919867... paise
     *   Rounded half up = 317683 paise (₹3,176.83)
     * Total Payable = 10,000,000 + 317683 = 10,317,683 paise (₹1,03,176.83)
     */
    it('compounds with monthly rests over 2 months', () => {
      const res = computeInterest({
        principalPaise: 10000000,
        dueDate: '2026-01-01',
        asOfDate: '2026-03-01',
        config: standardConfig,
      });

      expect(res.daysOverdue).toBe(59); // 31 in Jan + 28 in Feb
      expect(res.breakdown).toHaveLength(2);

      // Period 1: Jan 1 to Feb 1 (31 days)
      expect(res.breakdown[0].days).toBe(31);
      expect(res.breakdown[0].interestPaise).toBe(165616);

      // Period 2: Feb 1 to Mar 1 (28 days)
      expect(res.breakdown[1].days).toBe(28);
      expect(res.breakdown[1].interestPaise).toBe(152066);

      // Total interest matches exact compound arithmetic
      expect(res.interestPaise).toBe(317683);
      expect(res.totalPaise).toBe(10317683);
    });
  });

  describe('Leap Year Crossing (2024)', () => {
    it('uses 366 days in leap year divisor', () => {
      // 2024 is a leap year (366 days)
      // 1 day late in Feb 2024
      const res = computeInterest({
        principalPaise: 10000000,
        dueDate: '2024-02-15',
        asOfDate: '2024-02-16',
        config: standardConfig,
      });

      // 10,000,000 * 0.195 * 1 / 366 = 5327.868... paise -> 5328 paise
      expect(res.daysOverdue).toBe(1);
      expect(res.interestPaise).toBe(5328);
    });
  });

  describe('Configurable Bank Rate (Injectable)', () => {
    it('computes correctly with 6.75% bank rate (20.25% statutory rate)', () => {
      const customConfig: LegalConfig = {
        ...DEFAULT_LEGAL_CONFIG,
        bankRatePercent: 6.75,
        rateMultiplier: 3, // 20.25% p.a.
      };

      const res = computeInterest({
        principalPaise: 10000000,
        dueDate: '2026-01-01',
        asOfDate: '2026-01-02',
        config: customConfig,
      });

      // 10,000,000 * 0.2025 / 365 = 5547.945... paise -> 5548 paise
      expect(res.effectiveAnnualRatePercent).toBe(20.25);
      expect(res.interestPaise).toBe(5548);
    });
  });

  describe('Versioned RBI Bank Rate Table (Rule 5)', () => {
    it('returns 6.75% for dates on or after 2023-02-08', () => {
      const entry = getNotifiedBankRate('2024-01-01');
      expect(entry.ratePercent).toBe(6.75);
      expect(entry.effectiveDate).toBe('2023-02-08');
      expect(entry.source).toContain('RBI');
    });

    it('returns 6.50% for dates between 2022-12-07 and 2023-02-07', () => {
      const entry = getNotifiedBankRate('2023-01-15');
      expect(entry.ratePercent).toBe(6.50);
      expect(entry.effectiveDate).toBe('2022-12-07');
    });

    it('returns historical rate for dates in 2020', () => {
      const entry = getNotifiedBankRate('2021-06-01');
      expect(entry.ratePercent).toBe(4.25);
    });

    it('contains valid versioned entries in chronological descending order', () => {
      expect(RBI_BANK_RATE_TABLE.length).toBeGreaterThanOrEqual(5);
      for (let i = 0; i < RBI_BANK_RATE_TABLE.length - 1; i++) {
        expect(RBI_BANK_RATE_TABLE[i].effectiveDate > RBI_BANK_RATE_TABLE[i + 1].effectiveDate).toBe(true);
      }
    });
  });
});
