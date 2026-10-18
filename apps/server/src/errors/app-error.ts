/**
 * Domain HTTP Error Hierarchy for Kirana Ledger Backend
 * Maps directly to the contract shape { error: { code, message } }
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', code = 'BAD_REQUEST') {
    super(400, code, message);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(401, code, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN') {
    super(403, code, message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(404, code, message);
    this.name = 'NotFoundError';
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = 'Payload exceeds maximum limit', code = 'PAYLOAD_TOO_LARGE') {
    super(413, code, message);
    this.name = 'PayloadTooLargeError';
  }
}

export class UpgradeRequiredError extends AppError {
  constructor(
    message = 'Client protocol version is outdated. Please update the application.',
    code = 'UPGRADE_REQUIRED',
  ) {
    super(426, code, message);
    this.name = 'UpgradeRequiredError';
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Rate limit exceeded. Please retry later.', code = 'TOO_MANY_REQUESTS') {
    super(429, code, message);
    this.name = 'TooManyRequestsError';
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'An internal server error occurred', code = 'INTERNAL_SERVER_ERROR') {
    super(500, code, message);
    this.name = 'InternalServerError';
  }
}
