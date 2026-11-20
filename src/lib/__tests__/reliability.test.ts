import { describe, it, expect, vi } from 'vitest';
import { Logger, sanitizeLogValue } from '../logger';
import { CircuitBreaker, CircuitBreakerOpenError, executeWithRetry } from '../circuitBreaker';

describe('Reliability Layer — Structured Logger & Zero-PII', () => {
  it('redacts sensitive Indian business PII (GSTIN, PAN, Phone, Email, Amounts)', () => {
    const rawGstin = '27ABCDE1234F1Z5';
    const rawPan = 'ABCDE1234F';
    const rawPhone = '+919876543210';
    const rawEmail = 'vendor@business.in';
    const rawAmount = '₹1,50,000.00';

    const testString = `Invoice for ${rawGstin} with PAN ${rawPan}, contact ${rawPhone} or ${rawEmail}, amount due: ${rawAmount}`;
    const sanitized = sanitizeLogValue(testString) as string;

    expect(sanitized).not.toContain(rawGstin);
    expect(sanitized).not.toContain(rawPan);
    expect(sanitized).not.toContain(rawPhone);
    expect(sanitized).not.toContain(rawEmail);
    expect(sanitized).not.toContain(rawAmount);

    expect(sanitized).toContain('[REDACTED_GSTIN]');
    expect(sanitized).toContain('[REDACTED_PAN]');
    expect(sanitized).toContain('[REDACTED_EMAIL]');
    expect(sanitized).toContain('[REDACTED_PHONE]');
    expect(sanitized).toContain('[REDACTED_AMOUNT]');
  });

  it('redacts blacklisted object keys completely', () => {
    const payload = {
      buyerName: 'Acme Mega Corp',
      sellerName: 'Small MSME Enterprises',
      gstin: '29ABCDE1234F1Z5',
      invoiceAmount: 500000,
      safeMetric: 'latency_ms',
      count: 42,
    };

    const sanitized = sanitizeLogValue(payload) as Record<string, unknown>;

    expect(sanitized.buyerName).toBe('[REDACTED_PII]');
    expect(sanitized.sellerName).toBe('[REDACTED_PII]');
    expect(sanitized.gstin).toBe('[REDACTED_PII]');
    expect(sanitized.invoiceAmount).toBe('[REDACTED_PII]');
    expect(sanitized.safeMetric).toBe('latency_ms');
    expect(sanitized.count).toBe(42);
  });

  it('formats structured Cloud Logging JSON entry', () => {
    const logger = new Logger('TestComponent');
    const entry = logger.info('Test operational event', {
      traceId: 'trace-12345',
      action: 'CALC_INTEREST',
      uid: 'user_xyz',
      safeKey: 'abc',
    });

    expect(entry.severity).toBe('INFO');
    expect(entry.component).toBe('TestComponent');
    expect(entry.action).toBe('CALC_INTEREST');
    expect(entry['logging.googleapis.com/trace']).toContain('trace-12345');
    expect(entry.metadata?.safeKey).toBe('abc');
  });
});

describe('Reliability Layer — Circuit Breaker & Retry', () => {
  it('starts CLOSED and succeeds for normal calls', async () => {
    const cb = new CircuitBreaker({ name: 'TestService', failureThreshold: 2 });
    expect(cb.getState()).toBe('CLOSED');

    const result = await cb.execute(async () => 'OK');
    expect(result).toBe('OK');
    expect(cb.getState()).toBe('CLOSED');
  });

  it('opens circuit after failure threshold is reached and short-circuits', async () => {
    const cb = new CircuitBreaker({ name: 'FlakyService', failureThreshold: 2, resetTimeoutMs: 100 });

    const failingCall = async () => {
      throw new Error('Service down');
    };

    // First failure
    await expect(cb.execute(failingCall)).rejects.toThrow('Service down');
    expect(cb.getState()).toBe('CLOSED');

    // Second failure -> Trips circuit
    await expect(cb.execute(failingCall)).rejects.toThrow('Service down');
    expect(cb.getState()).toBe('OPEN');

    // Third call -> Short-circuited immediately
    await expect(cb.execute(async () => 'Should not run')).rejects.toThrow(CircuitBreakerOpenError);
  });

  it('transitions to HALF_OPEN after timeout and closes on recovery', async () => {
    const cb = new CircuitBreaker({
      name: 'RecoverableService',
      failureThreshold: 2,
      resetTimeoutMs: 50,
      halfOpenSuccessThreshold: 2,
    });

    const failingCall = async () => {
      throw new Error('Fail');
    };

    await expect(cb.execute(failingCall)).rejects.toThrow();
    await expect(cb.execute(failingCall)).rejects.toThrow();
    expect(cb.getState()).toBe('OPEN');

    // Wait for reset timeout
    await new Promise((r) => setTimeout(r, 60));
    expect(cb.getState()).toBe('HALF_OPEN');

    // First recovery success
    await cb.execute(async () => 'Recovery 1');
    expect(cb.getState()).toBe('HALF_OPEN');

    // Second recovery success -> should close
    await cb.execute(async () => 'Recovery 2');
    expect(cb.getState()).toBe('CLOSED');
  });

  it('executeWithRetry retries on intermittent failures and succeeds', async () => {
    let attempts = 0;
    const flake = async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Transient error');
      }
      return 'Success on retry';
    };

    const res = await executeWithRetry(flake, {
      maxRetries: 3,
      initialDelayMs: 10,
      maxDelayMs: 50,
      jitter: false,
    });

    expect(res).toBe('Success on retry');
    expect(attempts).toBe(3);
  });

  it('executeWithRetry fails when max retries exceeded', async () => {
    const alwaysFail = async () => {
      throw new Error('Permanent error');
    };

    await expect(
      executeWithRetry(alwaysFail, {
        maxRetries: 2,
        initialDelayMs: 10,
        maxDelayMs: 50,
        jitter: false,
      })
    ).rejects.toThrow('Permanent error');
  });
});
