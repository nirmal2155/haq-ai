/**
 * Haq AI — Circuit Breaker & Exponential Backoff Resilience Utility.
 *
 * Protects downstream services (Gemini API, Mailers, WhatsApp) from cascading
 * failures and implements exponential backoff with full jitter.
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  name: string;
  failureThreshold?: number; // Number of consecutive failures before opening (default: 5)
  resetTimeoutMs?: number; // Wait duration before trying HALF_OPEN (default: 15000ms)
  halfOpenSuccessThreshold?: number; // Consecutive successes needed to reclose (default: 2)
}

export interface RetryOptions {
  maxRetries?: number; // default: 3
  initialDelayMs?: number; // default: 200ms
  maxDelayMs?: number; // default: 3000ms
  backoffFactor?: number; // default: 2
  jitter?: boolean; // default: true
}

export class CircuitBreakerOpenError extends Error {
  constructor(name: string, retryAfterMs: number) {
    super(`Circuit breaker '${name}' is OPEN. Requests are temporarily short-circuited. Retry after ${Math.ceil(retryAfterMs / 1000)}s.`);
    this.name = 'CircuitBreakerOpenError';
  }
}

export class CircuitBreaker {
  readonly name: string;
  private state: CircuitState = 'CLOSED';
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastStateChange: number = Date.now();
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly halfOpenSuccessThreshold: number;

  constructor(options: CircuitBreakerOptions) {
    this.name = options.name;
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeoutMs = options.resetTimeoutMs ?? 15000;
    this.halfOpenSuccessThreshold = options.halfOpenSuccessThreshold ?? 2;
  }

  getState(): CircuitState {
    if (this.state === 'OPEN') {
      const elapsed = Date.now() - this.lastStateChange;
      if (elapsed >= this.resetTimeoutMs) {
        this.transitionTo('HALF_OPEN');
      }
    }
    return this.state;
  }

  private transitionTo(newState: CircuitState) {
    this.state = newState;
    this.lastStateChange = Date.now();
    if (newState === 'HALF_OPEN') {
      this.successCount = 0;
    } else if (newState === 'CLOSED') {
      this.failureCount = 0;
      this.successCount = 0;
    }
  }

  /**
   * Execute protected operation through circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    if (currentState === 'OPEN') {
      const retryAfterMs = Math.max(0, this.resetTimeoutMs - (Date.now() - this.lastStateChange));
      throw new CircuitBreakerOpenError(this.name, retryAfterMs);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.halfOpenSuccessThreshold) {
        this.transitionTo('CLOSED');
      }
    } else if (this.state === 'CLOSED') {
      this.failureCount = 0;
    }
  }

  private onFailure() {
    if (this.state === 'HALF_OPEN') {
      this.transitionTo('OPEN');
    } else if (this.state === 'CLOSED') {
      this.failureCount++;
      if (this.failureCount >= this.failureThreshold) {
        this.transitionTo('OPEN');
      }
    }
  }

  /**
   * Manual reset for test or ops administration
   */
  reset() {
    this.transitionTo('CLOSED');
  }

  getMetrics() {
    return {
      name: this.name,
      state: this.getState(),
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastStateChange: this.lastStateChange,
    };
  }
}

/**
 * Execute an async operation with exponential backoff and jitter
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelay = options.initialDelayMs ?? 200;
  const maxDelay = options.maxDelayMs ?? 3000;
  const factor = options.backoffFactor ?? 2;
  const jitter = options.jitter ?? true;

  let attempt = 0;
  let delay = initialDelay;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt > maxRetries) {
        throw error;
      }

      // Calculate jittered delay
      let waitMs = Math.min(delay, maxDelay);
      if (jitter) {
        waitMs = waitMs * (0.75 + Math.random() * 0.5); // +/- 25% jitter
      }

      await new Promise((resolve) => setTimeout(resolve, waitMs));
      delay *= factor;
    }
  }
}

// Global pre-configured circuit breakers for external third-party calls
export const geminiCircuitBreaker = new CircuitBreaker({
  name: 'GeminiAPI',
  failureThreshold: 3,
  resetTimeoutMs: 10000,
  halfOpenSuccessThreshold: 2,
});

export const mailerCircuitBreaker = new CircuitBreaker({
  name: 'MailerService',
  failureThreshold: 4,
  resetTimeoutMs: 15000,
  halfOpenSuccessThreshold: 2,
});
