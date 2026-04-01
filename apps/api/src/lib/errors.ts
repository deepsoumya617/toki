import type { ContentfulStatusCode } from 'hono/utils/http-status';

export class ApiError extends Error {
  // hono's http status code type, its not a number
  public readonly statusCode: ContentfulStatusCode;
  public readonly code: string;

  constructor(statusCode: ContentfulStatusCode, code: string, message: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;

    // fixes the prototype chain for instanceof checks
    // not needed in ESNext
    // Object.setPrototypeOf(this, new.target.prototype)

    // capture stack trace
    Error.captureStackTrace(this);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not Found') {
    super(404, 'NOT_FOUND', message);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Conflict') {
    super(409, 'CONFLICT', message);
  }
}

export class GoneError extends ApiError {
  constructor(message = 'Resource is no longer available') {
    super(410, 'GONE', message);
  }
}
