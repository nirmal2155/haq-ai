import { describe, it, expect } from 'vitest';
import { computeInterest } from '../interest';
import { computeDueDate } from '../deadline';
import { calculateExposure43bh } from '../exposure43bh';

describe('Golden Vectors (docs/GOLDEN_VECTORS.md)', () => {
  it('Golden Vector 1: Standard 15-day statutory default (Leap year 2024)', () => {
    // Principal: ₹1,00,000 (10,000,000 paise), Due: 2024-01-16, Calc: 2024-02-16 (31 days)
    // Statutory Rate: 3x 6.75% = 20.25%, Leap year: 366 days
    // 100,000 * 0.2025 * (31 / 366) = 1715.1639 -> 171,516 paise
    const res = computeInterest({
      principalPaise: 10000000,
      dueDate: '2024-01-16',
      asOfDate: '2024-02-16',
      config: { bankRatePercent: 6.75 },
    });

    expect(res.daysOverdue).toBe(31);
    expect(res.interestPaise).toBe(171516);
    expect(res.totalPaise).toBe(10171516);
  });

  it('Golden Vector 2: Month-end & Leap year boundary (February 2024)', () => {
    // Feb 14 + 30 days = March 15, 2024 (2024 has 29 days in Feb)
    const dueRes = computeDueDate({
      acceptanceDate: '2024-02-14',
      hasWrittenAgreement: true,
      agreedCreditDays: 30,
    });
    expect(dueRes.dueDate).toBe('2024-03-15');

    // Overdue by 31 days (2024-03-15 to 2024-04-15)
    // Principal: ₹50,000 (5,000,000 paise)
    // 50,000 * 0.2025 * (31 / 366) = 857.5819 -> 85,758 paise
    const intRes = computeInterest({
      principalPaise: 5000000,
      dueDate: dueRes.dueDate,
      asOfDate: '2024-04-15',
      config: { bankRatePercent: 6.75 },
    });

    expect(intRes.daysOverdue).toBe(31);
    expect(intRes.interestPaise).toBe(85758);
    expect(intRes.totalPaise).toBe(5085758);
  });

  it('Golden Vector 3: Statutory 45-day cap on excessive credit terms (90 days requested)', () => {
    const dueRes = computeDueDate({
      acceptanceDate: '2024-01-01',
      hasWrittenAgreement: true,
      agreedCreditDays: 90,
    });

    // 2024-01-01 + 45 days (30 in Jan + 15 in Feb) = 2024-02-15
    expect(dueRes.dueDate).toBe('2024-02-15');
    expect(dueRes.effectiveCreditDays).toBe(45);
    expect(dueRes.rule).toBe('45_DAY_STATUTORY_CAP');
  });

  it('Golden Vector 4: Zero overdue on future bill', () => {
    const res = computeInterest({
      principalPaise: 25000000,
      dueDate: '2024-05-15',
      asOfDate: '2024-05-10',
      config: { bankRatePercent: 6.75 },
    });

    expect(res.daysOverdue).toBe(0);
    expect(res.interestPaise).toBe(0);
    expect(res.totalPaise).toBe(25000000);
  });

  it('Golden Vector 5: Multi-month compounding with monthly rests (2023 non-leap year)', () => {
    // 2023-01-01 to 2023-03-01 (59 days across Jan and Feb)
    const res = computeInterest({
      principalPaise: 10000000,
      dueDate: '2023-01-01',
      asOfDate: '2023-03-01',
      config: { bankRatePercent: 6.75, compounding: 'monthly' },
    });

    expect(res.breakdown.length).toBe(2);
    // Period 1: Jan (31 days): 171,986 paise
    expect(res.breakdown[0].days).toBe(31);
    expect(res.breakdown[0].interestPaise).toBe(171986);
    // Period 2: Feb (28 days on compounded opening principal 10,171,986): 158,012 paise
    expect(res.breakdown[1].days).toBe(28);
    expect(res.breakdown[1].interestPaise).toBe(158014);

    expect(res.interestPaise).toBe(330000);
    expect(res.totalPaise).toBe(10330000);
  });

  it('Golden Vector 6: Section 43B(h) year-end disallowance categorization', () => {
    const summary = calculateExposure43bh(
      [
        {
          id: 'bill-1',
          invoiceNumber: 'INV-001',
          invoiceDate: '2024-01-01',
          amountPaise: 50000000, // ₹5,00,000
          hasWrittenAgreement: true,
          agreedPaymentDays: 45,
          isMicroOrSmallSupplier: true,
          paymentDate: null, // unpaid
        },
        {
          id: 'bill-2',
          invoiceNumber: 'INV-002',
          invoiceDate: '2024-01-01',
          amountPaise: 30000000, // ₹3,00,000
          hasWrittenAgreement: true,
          agreedPaymentDays: 45,
          isMicroOrSmallSupplier: true,
          paymentDate: '2024-03-20',
          paidAmountPaise: 30000000,
        },
        {
          id: 'bill-3',
          invoiceNumber: 'INV-003',
          invoiceDate: '2024-03-25',
          amountPaise: 20000000, // ₹2,00,000
          hasWrittenAgreement: false,
          isMicroOrSmallSupplier: true,
          paymentDate: '2024-04-05',
          paidAmountPaise: 20000000,
        },
      ],
      '2024-03-31'
    );

    expect(summary.totalBills).toBe(3);
    expect(summary.disallowedBillsCount).toBe(1);
    expect(summary.totalDisallowedPaise).toBe(50000000);
    expect(summary.bills[0].isDisallowedUnder43Bh).toBe(true);
    expect(summary.bills[1].isDisallowedUnder43Bh).toBe(false);
    expect(summary.bills[2].isDisallowedUnder43Bh).toBe(false);
  });
});
