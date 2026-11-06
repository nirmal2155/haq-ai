import { describe, it, expect } from 'vitest';
import { SaveCallRecordSchema } from '../call';

describe('Phase 5 - Gemini Live Voice Call & Consent Tests', () => {
  it('validates call record with explicit consent and transcript', () => {
    const validCall = {
      invoiceId: 'inv_12345',
      consentGiven: true,
      transcript: '[10:00:00] AI: Hello. [10:00:05] BUYER: Yes.',
      promisedDate: '2026-11-15',
    };

    const parsed = SaveCallRecordSchema.parse(validCall);
    expect(parsed.consentGiven).toBe(true);
    expect(parsed.promisedDate).toBe('2026-11-15');
    expect(parsed.transcript).toContain('BUYER: Yes.');
  });

  it('validates call record when consent is refused', () => {
    const refusedCall = {
      invoiceId: 'inv_99999',
      consentGiven: false,
    };

    const parsed = SaveCallRecordSchema.parse(refusedCall);
    expect(parsed.consentGiven).toBe(false);
    expect(parsed.transcript).toBeUndefined();
    expect(parsed.promisedDate).toBeUndefined();
  });

  it('rejects call records with invalid or missing invoiceId', () => {
    const invalid = {
      invoiceId: '',
      consentGiven: true,
    };

    expect(() => SaveCallRecordSchema.parse(invalid)).toThrow();
  });
});
