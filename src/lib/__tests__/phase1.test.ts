import { describe, it, expect } from 'vitest';
import { validateMagicBytes, computeSha256 } from '../storage';
import { checkRateLimit } from '../ratelimit';
import { sanitizeText, stripHtml } from '../sanitize';
import { verifyTokenAndGetContext, AuthError } from '../auth';

describe('Phase 1 - Security, Storage & Auth Tests', () => {
  describe('Storage Magic Bytes Validation', () => {
    it('accepts valid PDF magic bytes', () => {
      const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35]);
      const res = validateMagicBytes(pdfBuffer);
      expect(res.valid).toBe(true);
      expect(res.mime).toBe('application/pdf');
    });

    it('accepts valid JPEG magic bytes', () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
      const res = validateMagicBytes(jpegBuffer);
      expect(res.valid).toBe(true);
      expect(res.mime).toBe('image/jpeg');
    });

    it('accepts valid PNG magic bytes', () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const res = validateMagicBytes(pngBuffer);
      expect(res.valid).toBe(true);
      expect(res.mime).toBe('image/png');
    });

    it('rejects HTML disguised as PDF (prevent malicious uploads)', () => {
      const fakePdfBuffer = Buffer.from('<html><script>alert("xss")</script></html>');
      const res = validateMagicBytes(fakePdfBuffer);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Invalid file format');
    });

    it('rejects oversized files (> 8 MB)', () => {
      const largeBuffer = Buffer.alloc(8 * 1024 * 1024 + 1);
      const res = validateMagicBytes(largeBuffer);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('exceeds maximum size');
    });

    it('computes deterministic SHA256 checksums', () => {
      const data = Buffer.from('Haq AI MSMED Act Payment Engine');
      const hash1 = computeSha256(data);
      const hash2 = computeSha256(data);
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64);
    });
  });

  describe('Rate Limiter (30 req/min default per UID)', () => {
    it('permits requests within 30 req/min limit', async () => {
      const testUid = `user_rate_${Date.now()}`;
      const firstCheck = await checkRateLimit(testUid, 30);
      expect(firstCheck.allowed).toBe(true);
      expect(firstCheck.remaining).toBe(29);
    });

    it('blocks requests when exceeding quota', async () => {
      const testUid = `burst_user_${Date.now()}`;
      // Simulate 5 requests with limit of 5
      for (let i = 0; i < 5; i++) {
        const check = await checkRateLimit(testUid, 5);
        expect(check.allowed).toBe(true);
      }
      const blocked = await checkRateLimit(testUid, 5);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
    });
  });

  describe('Sanitizer Utilities', () => {
    it('escapes HTML tags and characters', () => {
      const input = '<script>alert("hack")</script>&"test"';
      const output = sanitizeText(input);
      expect(output).not.toContain('<script>');
      expect(output).toContain('&lt;script&gt;');
      expect(output).toContain('&amp;');
    });

    it('strips HTML cleanly without executing', () => {
      const input = '<p>Supplier Name: <b>ABC Steel Corp</b></p>';
      const cleaned = stripHtml(input);
      expect(cleaned).toBe('Supplier Name: ABC Steel Corp');
    });
  });

  describe('Server Auth Verification', () => {
    it('rejects requests without Authorization header', async () => {
      const req = new Request('http://localhost/api/invoices');
      await expect(verifyTokenAndGetContext(req)).rejects.toThrow(AuthError);
    });

    it('rejects malformed Bearer tokens', async () => {
      const req = new Request('http://localhost/api/invoices', {
        headers: { authorization: 'Basic 12345' },
      });
      await expect(verifyTokenAndGetContext(req)).rejects.toThrow(AuthError);
    });

    it('resolves test bearer tokens in test mode', async () => {
      const req = new Request('http://localhost/api/invoices', {
        headers: { authorization: 'Bearer test-token-supplier_123' },
      });
      const auth = await verifyTokenAndGetContext(req);
      expect(auth.uid).toBe('supplier_123');
      expect(auth.orgId).toBe('org_supplier_123');
    });
  });
});
