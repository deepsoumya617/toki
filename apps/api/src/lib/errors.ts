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
