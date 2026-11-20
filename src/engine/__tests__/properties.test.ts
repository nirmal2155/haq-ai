import { describe, it, expect } from 'vitest';
import { computeInterest } from '../interest';

describe('Deterministic Engine Invariant & Property Tests', () => {
  it('Property 1: Interest is monotonically non-decreasing over time', () => {
    const principal = 10000000; // ₹1,00,000
    const dueDate = '2024-01-01';

    let previousInterest = 0;
    // Test sequentially from day 1 to day 90
    for (const day of [5, 15, 30, 45, 60, 75, 90]) {
      const asOf = new Date(Date.UTC(2024, 0, 1 + day)).toISOString().split('T')[0] ?? '';
      const result = computeInterest({
        principalPaise: principal,
        dueDate,
        asOfDate: asOf,
      });

      expect(result.interestPaise).toBeGreaterThanOrEqual(previousInterest);
      previousInterest = result.interestPaise;
    }
  });

  it('Property 2: Zero overdue strictly yields zero interest and zero overdue days', () => {
    const testCases = [
      { due: '2024-05-10', asOf: '2024-05-10' }, // exact same day
      { due: '2024-05-10', asOf: '2024-05-01' }, // 9 days before due
      { due: '2024-12-31', asOf: '2024-01-01' }, // 1 year before due
    ];

    for (const tc of testCases) {
      const result = computeInterest({
        principalPaise: 5000000,
        dueDate: tc.due,
        asOfDate: tc.asOf,
      });

      expect(result.daysOverdue).toBe(0);
      expect(result.interestPaise).toBe(0);
      expect(result.totalPaise).toBe(5000000);
      expect(result.breakdown).toHaveLength(0);
    }
  });

  it('Property 3: Partial payment strictly reduces accrued interest', () => {
    const principal = 10000000; // ₹1,00,000
    const dueDate = '2024-01-01';
    const asOfDate = '2024-03-01';

    const fullUnpaid = computeInterest({
      principalPaise: principal,
      dueDate,
      asOfDate,
      paidPaise: 0,
    });

    const halfPaid = computeInterest({
      principalPaise: principal,
      dueDate,
      asOfDate,
      paidPaise: 5000000, // ₹50,000 paid upfront
    });

    expect(halfPaid.interestPaise).toBeLessThan(fullUnpaid.interestPaise);
    // Because principal was cut in half, interest is approximately half
    expect(halfPaid.interestPaise).toBeCloseTo(fullUnpaid.interestPaise / 2, -2);
  });

  it('Property 4: Total due strictly equals unpaid principal plus accrued interest', () => {
    const testPrincipals = [1000, 50000, 1234567, 987654321];

    for (const p of testPrincipals) {
      const res = computeInterest({
        principalPaise: p,
        dueDate: '2024-01-01',
        asOfDate: '2024-02-15',
      });

      expect(res.totalPaise).toBe(res.unpaidPrincipalPaise + res.interestPaise);
    }
  });
});
