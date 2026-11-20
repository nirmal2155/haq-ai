import { describe, it, expect } from 'vitest';
import { checkMsmeEligibility, isValidUdyamFormat } from '../eligibility';

describe('MSMED Act & Section 43B(h) Eligibility Engine', () => {
  it('validates standard Udyam number format', () => {
    expect(isValidUdyamFormat('UDYAM-GJ-01-0012345')).toBe(true);
    expect(isValidUdyamFormat('UDYAM-MH-12-1234567')).toBe(true);
    expect(isValidUdyamFormat('INVALID-FORMAT')).toBe(false);
    expect(isValidUdyamFormat(null)).toBe(false);
  });

  it('marks registered Micro enterprise as eligible', () => {
    const res = checkMsmeEligibility({
      isUdyamRegistered: true,
      udyamNumber: 'UDYAM-GJ-01-0012345',
      enterpriseType: 'micro',
      activityType: 'manufacturing',
    });

    expect(res.eligible).toBe(true);
    expect(res.needsCaReview).toBe(false);
    expect(res.reasons.length).toBeGreaterThan(0);
  });

  it('marks Small enterprise as eligible', () => {
    const res = checkMsmeEligibility({
      isUdyamRegistered: true,
      udyamNumber: 'UDYAM-DL-02-0054321',
      enterpriseType: 'small',
      activityType: 'services',
    });

    expect(res.eligible).toBe(true);
    expect(res.needsCaReview).toBe(false);
  });

  it('strictly rejects Medium enterprise with clear statutory reason', () => {
    const res = checkMsmeEligibility({
      isUdyamRegistered: true,
      udyamNumber: 'UDYAM-MH-03-0099999',
      enterpriseType: 'medium',
    });

    expect(res.eligible).toBe(false);
    expect(res.reasons.some((r) => r.includes('MEDIUM'))).toBe(true);
  });

  it('rejects unregistered suppliers', () => {
    const res = checkMsmeEligibility({
      isUdyamRegistered: false,
      enterpriseType: 'micro',
    });

    expect(res.eligible).toBe(false);
    expect(res.reasons.some((r) => r.includes('not registered under Udyam'))).toBe(true);
  });

  it('flags invoices issued BEFORE Udyam registration date as needs-CA-review and ineligible', () => {
    const res = checkMsmeEligibility({
      isUdyamRegistered: true,
      udyamNumber: 'UDYAM-KA-05-0011111',
      enterpriseType: 'micro',
      registrationDate: '2024-06-01',
      invoiceDate: '2024-03-15',
    });

    expect(res.eligible).toBe(false);
    expect(res.needsCaReview).toBe(true);
    expect(res.reasons.some((r) => r.includes('precedes Udyam registration date'))).toBe(true);
  });

  it('flags pure trading activity with statutory warning and [NEEDS-CA-REVIEW]', () => {
    const res = checkMsmeEligibility({
      isUdyamRegistered: true,
      udyamNumber: 'UDYAM-RJ-08-0022222',
      enterpriseType: 'small',
      activityType: 'trading',
    });

    expect(res.needsCaReview).toBe(true);
    expect(res.warnings.some((w) => w.includes('Traders') && w.includes('[NEEDS-CA-REVIEW]'))).toBe(true);
  });

  it('warns on contractual credit terms exceeding 45 days', () => {
    const res = checkMsmeEligibility({
      isUdyamRegistered: true,
      udyamNumber: 'UDYAM-UP-09-0033333',
      enterpriseType: 'micro',
      hasWrittenAgreement: true,
      agreedCreditDays: 60,
    });

    expect(res.eligible).toBe(true);
    expect(res.warnings.some((w) => w.includes('capped at 45 days'))).toBe(true);
  });
});
