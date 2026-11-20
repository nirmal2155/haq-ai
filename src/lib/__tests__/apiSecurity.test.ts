import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { secureRoute, testResourceStore } from '../apiSecurity';
import { validateMagicBytes } from '../storage';

describe('API Security Layer & Route Pipeline', () => {
  beforeEach(() => {
    testResourceStore.clear();
    // Seed mock resource in test store for ownership test
    testResourceStore.set('invoices/inv_alice_1', {
      id: 'inv_alice_1',
      ownerUid: 'user_alice',
      amountPaise: 500000,
    });
  });

  const sampleBodySchema = z.object({
    invoiceNumber: z.string().min(1),
    amountPaise: z.number().int().positive(),
  });

  const testHandler = secureRoute(
    {
      action: 'TEST_ROUTE_ACTION',
      rateLimitPerMinute: 5,
      bodySchema: sampleBodySchema,
      requireOwnership: {
        collection: 'invoices',
        extractId: (ctx) => (ctx.body ? 'inv_alice_1' : null),
      },
    },
    async ({ auth, body }) => {
      return new Response(JSON.stringify({ success: true, user: auth.uid, data: body }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  );

  it('Pipeline Step 1: Rejects unauthorized requests with 401', async () => {
    // Missing Authorization header
    const reqNoAuth = new Request('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceNumber: 'INV-1', amountPaise: 1000 }),
    });

    const res = await testHandler(reqNoAuth);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.error.code).toBe('UNAUTHORIZED');
    expect(json.error.message).toContain('Authorization');
  });

  it('Pipeline Step 3: Rejects malformed JSON and invalid Zod schema with 400', async () => {
    // Missing required fields
    const reqBadBody = new Request('http://localhost:3000/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token-user_alice',
      },
      body: JSON.stringify({ amountPaise: -500 }), // missing invoiceNumber, negative amount
    });

    const res = await testHandler(reqBadBody);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error.code).toBe('VALIDATION_ERROR');
    expect(json.error.details).toBeDefined();
  });

  it('Pipeline Step 4: Rejects cross-tenant access attempts with 403 Forbidden', async () => {
    // user_bob attempts to access or modify user_alice's invoice
    const reqCrossTenant = new Request('http://localhost:3000/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token-user_bob', // User is Bob, but invoice belongs to Alice
      },
      body: JSON.stringify({ invoiceNumber: 'INV-1', amountPaise: 1000 }),
    });

    const res = await testHandler(reqCrossTenant);
    expect(res.status).toBe(403);

    const json = await res.json();
    expect(json.error.code).toBe('FORBIDDEN');
    expect(json.error.message).toContain('Access denied');
  });

  it('Pipeline Step 2: Rate limit enforcement returns 429 when exceeded', async () => {
    const rateLimitedHandler = secureRoute(
      {
        action: 'RATE_LIMIT_TEST',
        rateLimitPerMinute: 2, // Low cap for test
      },
      async () => {
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }
    );

    const makeReq = () =>
      new Request('http://localhost:3000/api/test-rate', {
        headers: { Authorization: 'Bearer test-token-user_rate_tester' },
      });

    // 1st request -> OK
    const res1 = await rateLimitedHandler(makeReq());
    expect(res1.status).toBe(200);

    // 2nd request -> OK
    const res2 = await rateLimitedHandler(makeReq());
    expect(res2.status).toBe(200);

    // 3rd request -> 429
    const res3 = await rateLimitedHandler(makeReq());
    expect(res3.status).toBe(429);

    const json = await res3.json();
    expect(json.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('Attaches mandatory HTTP security headers to responses', async () => {
    const simpleHandler = secureRoute(
      { action: 'HEADER_CHECK' },
      async () => new Response(JSON.stringify({ ok: true }))
    );

    const req = new Request('http://localhost:3000/api/test', {
      headers: { Authorization: 'Bearer test-token-user_alice' },
    });

    const res = await simpleHandler(req);
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('Strict-Transport-Security')).toBe('max-age=63072000; includeSubDomains; preload');
    expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  describe('Magic-Byte File Security & Upload Bounds', () => {
    it('accepts valid PDF magic bytes (%PDF)', () => {
      const validPdf = Buffer.from('%PDF-1.4 header content here');
      const res = validateMagicBytes(validPdf);
      expect(res.valid).toBe(true);
      expect(res.mime).toBe('application/pdf');
    });

    it('accepts valid PNG magic bytes', () => {
      const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
      const res = validateMagicBytes(validPng);
      expect(res.valid).toBe(true);
      expect(res.mime).toBe('image/png');
    });

    it('accepts valid JPEG magic bytes', () => {
      const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]);
      const res = validateMagicBytes(validJpeg);
      expect(res.valid).toBe(true);
      expect(res.mime).toBe('image/jpeg');
    });

    it('rejects disguised malicious files (e.g. text/exe disguised with fake extension)', () => {
      const disguisedFile = Buffer.from('MZ... executable content or plain text script');
      const res = validateMagicBytes(disguisedFile);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Invalid file format');
    });

    it('rejects oversized files exceeding 8 MB cap', () => {
      const oversizedBuffer = Buffer.alloc(8 * 1024 * 1024 + 1); // 8 MB + 1 byte
      // set valid PDF header
      oversizedBuffer[0] = 0x25;
      oversizedBuffer[1] = 0x50;
      oversizedBuffer[2] = 0x44;
      oversizedBuffer[3] = 0x46;

      const res = validateMagicBytes(oversizedBuffer);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('exceeds maximum size of 8 MB');
    });
  });
});
