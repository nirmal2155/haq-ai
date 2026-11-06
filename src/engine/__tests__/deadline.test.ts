import { describe, it, expect } from 'vitest';
import { computeDueDate, computeDeemedAcceptance, addDaysToDate } from '../deadline';

describe('MSMED Act Deadline Engine (Section 15 & Section 2(b))', () => {
  describe('computeDueDate', () => {
    it('applies 15-day rule when no written agreement exists', () => {
      const res = computeDueDate({
        acceptanceDate: '2026-01-01',
        hasWrittenAgreement: false,
      });

      // 2026-01-01 + 15 days = 2026-01-16
      expect(res.dueDate).toBe('2026-01-16');
      expect(res.effectiveCreditDays).toBe(15);
      expect(res.rule).toBe('15_DAY_NO_AGREEMENT');
    });

    it('honors agreed term if <= 45 days (e.g. 30 days)', () => {
      const res = computeDueDate({
        acceptanceDate: '2026-03-01',
        hasWrittenAgreement: true,
        agreedCreditDays: 30,
      });

      // 2026-03-01 + 30 days = 2026-03-31
      expect(res.dueDate).toBe('2026-03-31');
      expect(res.effectiveCreditDays).toBe(30);
      expect(res.rule).toBe('AGREED_TERM');
    });

    it('honors exactly 45 days agreed term', () => {
      const res = computeDueDate({
        acceptanceDate: '2026-01-01',
        hasWrittenAgreement: true,
        agreedCreditDays: 45,
      });

      // 2026-01-01 + 45 days (30 days left in Jan + 15 in Feb) = 2026-02-15
      expect(res.dueDate).toBe('2026-02-15');
      expect(res.effectiveCreditDays).toBe(45);
      expect(res.rule).toBe('AGREED_TERM');
    });

    it('caps agreed terms exceeding 45 days strictly to 45 days (e.g. 90 days capped)', () => {
      const res = computeDueDate({
        acceptanceDate: '2026-01-01',
        hasWrittenAgreement: true,
        agreedCreditDays: 90,
      });

      // Capped to 45 days under Section 15 proviso
      expect(res.dueDate).toBe('2026-02-15');
      expect(res.effectiveCreditDays).toBe(45);
      expect(res.rule).toBe('45_DAY_STATUTORY_CAP');
    });

    it('correctly calculates leap year transitions (Feb 2024)', () => {
      // 2024 is a leap year (Feb has 29 days)
      const res = computeDueDate({
        acceptanceDate: '2024-02-15',
        hasWrittenAgreement: false,
      });

      // Feb 15 + 15 days in leap year: 14 days in Feb (to Feb 29) + 1 day in March = March 1, 2024
      expect(res.dueDate).toBe('2024-03-01');
      expect(res.effectiveCreditDays).toBe(15);
    });

    it('handles year-end month transitions', () => {
      const res = computeDueDate({
        acceptanceDate: '2025-12-25',
        hasWrittenAgreement: false,
      });

      // Dec 25 + 15 days: 6 days in Dec to Dec 31 + 9 days in Jan = Jan 9, 2026
      expect(res.dueDate).toBe('2026-01-09');
    });
  });

  describe('computeDeemedAcceptance (Section 2(b))', () => {
    it('computes deemed acceptance date as deliveryDate + 15 days when no objection raised', () => {
      const res = computeDeemedAcceptance('2026-04-10');
      expect(res.deemedAcceptanceDate).toBe('2026-04-25');
      expect(res.isDeemed).toBe(true);
    });

    it('uses written objection resolution date if objection was lodged in writing', () => {
      const res = computeDeemedAcceptance('2026-04-10', '2026-04-18');
      expect(res.deemedAcceptanceDate).toBe('2026-04-18');
      expect(res.isDeemed).toBe(false);
    });
  });

  describe('addDaysToDate helper', () => {
    it('adds 0 days', () => {
      expect(addDaysToDate('2026-05-15', 0)).toBe('2026-05-15');
    });

    it('adds days crossing multiple months', () => {
      expect(addDaysToDate('2026-01-01', 60)).toBe('2026-03-02');
    });
  });
});
