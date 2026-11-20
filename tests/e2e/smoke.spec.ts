import { test, expect } from '@playwright/test';

test.describe('Haq AI E2E Smoke Tests', () => {
  test('liveness probe responds with 200 OK', async ({ request }) => {
    const response = await request.get('/api/healthz');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('haq-ai');
  });
});
