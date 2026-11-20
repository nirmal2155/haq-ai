import { describe, it, expect } from 'vitest';
import { generateEvidencePackHtml, buildSamadhaanCopyKit } from '../evidencePack';
import { Case, CaseEvent } from '@/domain/types';
import { getBankRate } from '@/engine/rates';

describe('Prompt 7: Evidence Pack & Samadhaan Copy Kit Generator', () => {
  const mockCase: Case = {
    id: 'case_evidence_test_1',
    ownerUid: 'user_eval_1',
    invoiceId: 'inv_100',
    state: 'TRACKING',
    principalAmountPaise: 10000000, // ₹1,00,000
    paidAmountPaise: 0,
    accruedInterestPaise: 171516,
    totalClaimPaise: 10171516,
    statutoryCapDays: 45,
    appointedDay: '2024-02-15',
    daysOverdue: 31,
    buyerName: 'Larsen & Toubro Limited',
    buyerGstin: '27AAACL1234A1Z5',
    invoiceNumber: 'LT-2024-088',
    invoiceDate: '2024-01-01',
    deliveryDate: '2024-01-01',
    acceptanceDate: '2024-01-01',
    isDeemedAcceptance: false,
    hasDispute: false,
    disputeNotes: null,
    lastIdempotencyKey: 'idem_1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-02-15T00:00:00.000Z',
  };

  const mockEvents: CaseEvent[] = [
    {
      id: 'evt_1',
      caseId: 'case_evidence_test_1',
      actor: { uid: 'user_eval_1', role: 'user' },
      type: 'CASE_CREATED',
      fromState: null,
      toState: 'DRAFT',
      timestamp: '2024-01-01T10:00:00.000Z',
      payloadHash: 'a'.repeat(64),
      idempotencyKey: 'idem_1',
    },
    {
      id: 'evt_2',
      caseId: 'case_evidence_test_1',
      actor: { uid: 'user_eval_1', role: 'user' },
      type: 'STATUS_MODIFIED',
      fromState: 'DRAFT',
      toState: 'TRACKING',
      timestamp: '2024-01-02T10:00:00.000Z',
      payloadHash: 'b'.repeat(64),
      idempotencyKey: 'idem_2',
    },
  ];

  it('generates complete server-side HTML matching exact snapshot requirements', () => {
    const rateRow = getBankRate(mockCase.appointedDay);
    const html = generateEvidencePackHtml({
      caseEntity: mockCase,
      events: mockEvents,
      reminders: [],
      rateRow,
    });

    // 1. Cover summary check
    expect(html).toContain('Larsen & Toubro Limited');
    expect(html).toContain('LT-2024-088');
    expect(html).toContain('₹1,00,000.00');
    expect(html).toContain('₹1,715.16');
    expect(html).toContain('₹1,01,715.16');

    // 2. Section 16 Interest Formula & Rate Row
    expect(html).toContain('Section 16 of Micro, Small and Medium Enterprises Development Act, 2006');
    expect(html).toContain('Monthly Compound Interest = Balance × (3 × RBI Bank Rate / 100)');
    expect(html).toContain(`${rateRow.bankRatePct}% per annum`);
    expect(html).toContain(rateRow.source);

    // 3. Timeline from caseEvents
    expect(html).toContain('CASE_CREATED');
    expect(html).toContain('START &rarr; DRAFT');
    expect(html).toContain('DRAFT &rarr; TRACKING');

    // 4. Mandatory legal disclaimer
    expect(html).toContain('Draft only. Review with a CA/lawyer before sending.');
  });

  it('builds comprehensive field-by-field MSME Samadhaan Copy Kit', () => {
    const kit = buildSamadhaanCopyKit(mockCase);

    expect(kit.portalUrl).toBe('https://samadhaan.msme.gov.in');
    expect(kit.statutoryWarning).toContain('Manual Portal Submission Only');

    // Check specific fields
    const buyerField = kit.fields.find((f) => f.fieldName === 'buyer_name');
    expect(buyerField?.value).toBe('Larsen & Toubro Limited');

    const amountField = kit.fields.find((f) => f.fieldName === 'principal_amount');
    expect(amountField?.value).toBe('100000.00');

    // Check document checklist
    expect(kit.documentChecklist.length).toBeGreaterThanOrEqual(4);
    expect(kit.documentChecklist.some((d) => d.documentName.includes('Udyam'))).toBe(true);
    expect(kit.documentChecklist.some((d) => d.documentName.includes('Tax Invoice'))).toBe(true);
    expect(kit.documentChecklist.some((d) => d.documentName.includes('Delivery Proof'))).toBe(true);
  });
});
