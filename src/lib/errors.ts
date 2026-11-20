/**
 * Haq AI — Standardized Application Error Hierarchy
 * Strictly typed, clean HTTP mapping, zero PII leakage.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied: resource ownership check failed') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded. Please retry after some time.') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export class LegalComplianceError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 422, 'LEGAL_COMPLIANCE_ERROR', details);
  }
}

export class EngineError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 500, 'ENGINE_CALCULATION_ERROR', details);
  }
}
