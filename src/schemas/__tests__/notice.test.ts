import { describe, it, expect } from 'vitest';
import { renderNoticeTemplate, verifyNumberIntegrity, NoticeData } from '../notice';

describe('Phase 4 - Notice Templating & Number Integrity Tests', () => {
  const sampleNoticeData: NoticeData = {
    supplierName: 'Gujarat Precision Tools',
    supplierUdyam: 'UDYAM-GJ-01-0098765',
    buyerName: 'Mega Auto Industries Ltd',
    buyerGstin: '27AAACT2727Q1ZW',
    invoiceNo: 'INV/2026/554',
    invoiceDate: '2026-01-10',
    acceptanceDate: '2026-01-15',
    statutoryDueDate: '2026-02-14',
    amountPaise: 85000000, // ₹8,50,000
    paidPaise: 0,
    unpaidPaise: 85000000,
    daysOverdue: 60,
    bankRatePercent: 6.5,
    effectiveRatePercent: 19.5,
    interestPaise: 2724657,
    totalPaise: 87724657,
    noticeDate: '2026-04-15',
  };

  it('renders all template placeholders deterministically with zero unresolved tokens', () => {
    const rendered = renderNoticeTemplate(sampleNoticeData);

    expect(rendered).toContain('Mega Auto Industries Ltd');
    expect(rendered).toContain('INV/2026/554');
    expect(rendered).toContain('2026-01-10');
    expect(rendered).toContain('2026-02-14');
    expect(rendered).toContain('60 days');
    expect(rendered).toContain('19.50%');
    expect(rendered).toContain('85000000');
    expect(rendered).toContain('DRAFT ONLY. REVIEW WITH A CA/LAWYER BEFORE SENDING');

    // Ensure no unreplaced handlebars remain
    expect(rendered).not.toContain('{{');
    expect(rendered).not.toContain('}}');
  });

  describe('verifyNumberIntegrity', () => {
    const criticalTokens = [
      sampleNoticeData.invoiceNo,
      sampleNoticeData.invoiceDate,
      sampleNoticeData.statutoryDueDate,
      String(sampleNoticeData.amountPaise),
      String(sampleNoticeData.daysOverdue),
      String(sampleNoticeData.totalPaise),
    ];

    it('passes integrity verification when LLM translation preserves all numbers and dates', () => {
      // Mock translated text containing all critical numeric identifiers intact
      const translated = `
        यह सांविधिक कानूनी नोटिस INV/2026/554 दिनांक 2026-01-10 के लिए है।
        स्वीकृति तिथि के अनुसार देय तिथि 2026-02-14 थी।
        कुल बकाया 85000000 पैसे और 60 दिन की देरी है।
        कुल सांविधिक दावा 87724657 पैसे है।
      `;

      const result = verifyNumberIntegrity('Original Template', translated, criticalTokens);
      expect(result.intact).toBe(true);
      expect(result.missingTokens).toHaveLength(0);
    });

    it('detects when an LLM hallucination or omission alters any number or date', () => {
      // LLM mistakenly changed invoice number or rounded paise amount
      const alteredTranslated = `
        यह सांविधिक कानूनी नोटिस दिनांक 2026-01-10 के लिए है।
        देय तिथि 2026-02-14 थी।
        कुल बकाया राशि बदल कर 80000000 पैसे हो गई है।
        60 दिन की देरी।
      `;

      const result = verifyNumberIntegrity('Original Template', alteredTranslated, criticalTokens);
      expect(result.intact).toBe(false);
      // Missing original invoice number and total amount
      expect(result.missingTokens).toContain(sampleNoticeData.invoiceNo);
      expect(result.missingTokens).toContain(String(sampleNoticeData.totalPaise));
    });

    it('flags missing days overdue if LLM omitted it', () => {
      const missingDaysTranslated = `
        Notice for INV/2026/554 dated 2026-01-10 due on 2026-02-14.
        Amount 85000000, Total 87724657.
      `;

      const result = verifyNumberIntegrity('Original', missingDaysTranslated, [
        String(sampleNoticeData.daysOverdue),
      ]);
      expect(result.intact).toBe(false);
      expect(result.missingTokens).toContain('60');
    });
  });
});
