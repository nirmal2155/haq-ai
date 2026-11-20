import { describe, it, expect } from 'vitest';
import { extractInvoice } from '../extractInvoice';
import {
  askHaqAssistant,
  verifyToolNumberIntegrity,
  AssistantToolCall,
} from '../assistant';
import {
  translateNoticeWithIntegrity,
  verifyExactMultisetMatch,
  extractCriticalTokens,
} from '../translate';
import {
  issueLiveVoiceSessionToken,
  handleVoiceCreateCase,
} from '../liveVoice';
import { InMemoryCaseRepository, InMemoryCaseEventRepository } from '@/repositories/inMemory';
import { CaseService } from '@/services/cases';

describe('Prompt 5: Gemini AI Layer & Statutory Guardrails', () => {
  describe('1. extractInvoice', () => {
    it('extracts metadata and flags missing acceptance date for human review', async () => {
      const dummyPdf = Buffer.from('%PDF-1.4 sample invoice content');
      const result = await extractInvoice(dummyPdf, 'application/pdf');

      expect(result.buyerName).toBe('Tata Motors Limited');
      expect(result.invoiceNo).toBe('INV-2024-001');
      expect(result.amountPaise).toBe(85000000); // ₹8,50,000 in integer paise
      expect(result.acceptanceDate).toBeNull();
      expect(result.requiresHumanReview).toBe(true);
      expect(result.fieldsNeedingReview).toContain('acceptanceDate');
    });
  });

  describe('2. Assistant with Engine Tools & Number Whitelist Guard', () => {
    it('executes tool calling and produces verified answers', async () => {
      const res = await askHaqAssistant('What is my statutory interest on 100000 invoice?');
      expect(res.verifiedNumbersOnly).toBe(true);
      expect(res.toolCalls.length).toBeGreaterThan(0);
      expect(res.disclaimer).toContain('Draft only');
    });

    it('rejects LLM text containing unauthorized hallucinated numbers', () => {
      const mockToolCalls: AssistantToolCall[] = [
        {
          name: 'calculateInterest',
          args: { principalPaise: 10000000, dueDate: '2024-02-15', asOfDate: '2024-03-15' },
          result: { interestRupees: '1715.16', totalRupees: '101715.16' },
        },
      ];

      // Safe answer: all numbers are in the tool results
      const validText = 'Statutory interest is 1715.16 and total is 101715.16 under Section 16.';
      const resValid = verifyToolNumberIntegrity(validText, mockToolCalls, 'Invoice 2024-02-15');
      expect(resValid.valid).toBe(true);

      // Hallucinated answer: contains unauthorized number "99999"
      const maliciousText = 'You must pay a penalty of 99999 rupees.';
      const resInvalid = verifyToolNumberIntegrity(maliciousText, mockToolCalls, 'Invoice 2024-02-15');
      expect(resInvalid.valid).toBe(false);
      expect(resInvalid.unauthorizedNumbers).toContain('99999');
    });
  });

  describe('3. Notice Translation with Multiset Integrity Verifier', () => {
    it('extracts critical tokens (GSTIN, dates, amounts) consistently', () => {
      const text = 'Notice to 27AAACT2727Q1ZW for invoice INV-101 dated 2024-01-15 amount ₹100000.00 interest 20.25%.';
      const tokens = extractCriticalTokens(text);
      expect(tokens).toContain('27AAACT2727Q1ZW');
      expect(tokens).toContain('2024-01-15');
      expect(tokens).toContain('100000.00');
      expect(tokens).toContain('20.25');
    });

    it('accepts exact multiset match between source and translation', () => {
      const source = ['2024-01-15', '100000', '20.25'];
      const target = ['2024-01-15', '100000', '20.25'];
      const check = verifyExactMultisetMatch(source, target);
      expect(check.matches).toBe(true);
    });

    it('rejects translations where an LLM omitted or changed an amount', () => {
      const source = ['2024-01-15', '100000', '20.25'];
      // LLM changed 100000 to 10000
      const target = ['2024-01-15', '10000', '20.25'];
      const check = verifyExactMultisetMatch(source, target);
      expect(check.matches).toBe(false);
      expect(check.missingInTarget).toContain('100000');
      expect(check.extraInTarget).toContain('10000');
    });

    it('verifies translated notice preserving exact tokens', async () => {
      const sampleNotice = 'Statutory notice for amount 500000 due on 2024-02-15.';
      const res = await translateNoticeWithIntegrity(sampleNotice, 'hi');
      expect(res.translatedText).toBeDefined();
      expect(res.integrityVerified).toBe(true);
    });

    it('falls back to English template when multiset does not match', () => {
      const source = extractCriticalTokens('Invoice INV-1 for 50000 on 2024-01-01');
      const altered = extractCriticalTokens('Invoice INV-1 for 40000 on 2024-01-01');
      const check = verifyExactMultisetMatch(source, altered);
      expect(check.matches).toBe(false);
      expect(check.missingInTarget).toContain('50000');
    });

    it('extracts and normalizes Hindi (Devanagari) and Gujarati digits accurately', () => {
      const englishNotice = 'Notice: Invoice 101 for Rs 50000 due in 15 days on 2024-01-20.';
      // Hindi translation using Devanagari digits: १०१, ५००००, १५, २०२४-०१-२०
      const hindiNoticeWithIndicDigits = 'सूचना: बिल १०१ राशि ५०००० देय १५ दिनों में २०२४-०१-२०.';
      // Gujarati translation using Gujarati digits: ૧૦૧, ૫૦૦૦૦, ૧૫, ૨૦૨૪-૦૧-૨૦
      const gujaratiNoticeWithIndicDigits = 'નોટિસ: બિલ ૧૦૧ રકમ ૫૦૦૦૦ ચૂકવવાપાત્ર ૧૫ દિવસમાં ૨૦૨૪-૦૧-૨૦.';

      const sourceTokens = extractCriticalTokens(englishNotice);
      const hindiTokens = extractCriticalTokens(hindiNoticeWithIndicDigits);
      const gujaratiTokens = extractCriticalTokens(gujaratiNoticeWithIndicDigits);

      expect(hindiTokens).toEqual(sourceTokens);
      expect(gujaratiTokens).toEqual(sourceTokens);

      const hindiMatch = verifyExactMultisetMatch(sourceTokens, hindiTokens);
      const gujaratiMatch = verifyExactMultisetMatch(sourceTokens, gujaratiTokens);

      expect(hindiMatch.matches).toBe(true);
      expect(gujaratiMatch.matches).toBe(true);
    });
  });

  describe('4. Live Voice with Ephemeral Token & Consent Gate', () => {
    it('blocks session creation if user consent is not granted', async () => {
      await expect(
        issueLiveVoiceSessionToken({
          userId: 'user_123',
          consentGranted: false, // NO consent
        })
      ).rejects.toThrowError(/MANDATORY_CONSENT_REQUIRED/);
    });

    it('issues valid ephemeral session config when consent is granted', async () => {
      const session = await issueLiveVoiceSessionToken({
        userId: 'user_123',
        consentGranted: true,
      });

      expect(session.sessionToken).toBeDefined();
      expect(session.wsEndpoint).toContain('wss://');
      expect(session.consentGranted).toBe(true);
    });

    it('blocks create_case tool if user did not provide explicit confirmation', async () => {
      await expect(
        handleVoiceCreateCase({
          ownerUid: 'user_123',
          buyerName: 'Tata Motors',
          invoiceNumber: 'INV-099',
          invoiceDate: '2024-01-10',
          amountRupees: '50000.00',
          userConfirmed: false, // NO confirmation
        })
      ).rejects.toThrowError(/Human in the loop/);
    });

    it('creates DRAFT case when user explicitly confirms', async () => {
      const eventRepo = new InMemoryCaseEventRepository();
      const caseRepo = new InMemoryCaseRepository(eventRepo);
      const caseService = new CaseService(caseRepo);

      const res = await handleVoiceCreateCase({
        ownerUid: 'user_123',
        buyerName: 'Tata Motors',
        invoiceNumber: 'INV-099',
        invoiceDate: '2024-01-10',
        amountRupees: '50000.00',
        userConfirmed: true,
        caseService,
      });

      expect(res.success).toBe(true);
      expect(res.state).toBe('DRAFT');
    });
  });
});
