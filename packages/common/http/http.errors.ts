/**
 * The base class for all HTTP errors
 */
export abstract class HttpError extends Error {
  public statusCode: number;

  constructor(
    name: string,
    public message: string,
  ) {
    super(message);
    this.name = name;
  }
}

/**
 * HTTP 400 - Bad Request
 */
export class BadRequestError extends HttpError {
  constructor(message?: string) {
    super('BadRequestError', message || 'Bad Request');
    Object.setPrototypeOf(this, BadRequestError.prototype);
    this.statusCode = 400;
  }
}

/**
 * HTTP 401 - Unauthorized
 */
export class UnauthorizedError extends HttpError {
  constructor(message?: string) {
    super('UnauthorizedError', message || 'Unauthorized');
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
    this.statusCode = 401;
  }
}

/**
 * HTTP 403 - Forbidden
 */
export class ForbiddenError extends HttpError {
  constructor(message?: string) {
      super('ForbiddenError', message || 'Forbidden');
      Object.setPrototypeOf(this, ForbiddenError.prototype);
      this.statusCode = 403;
  }
}

/**
 * HTTP 404 - Not Found
 */
export class NotFoundError extends HttpError {
  constructor(message?: string) {
      super('NotFoundError', message || 'Not Found');
      Object.setPrototypeOf(this, NotFoundError.prototype);
      this.statusCode = 404;
  }
}

/**
 * HTTP 405 - Method Not Allowed
 */
export class MethodNotAllowedError extends HttpError {
  constructor(message?: string) {
      super('MethodNotAllowedError', message || 'Method Not Allowed');
      Object.setPrototypeOf(this, MethodNotAllowedError.prototype);
      this.statusCode = 405;
  }
}

/**
 * HTTP 406 - Not Acceptable
 */
export class NotAcceptableError extends HttpError {
  constructor(message?: string) {
      super('NotAcceptableError', message || 'Not Acceptable');
      Object.setPrototypeOf(this, NotAcceptableError.prototype);
      this.statusCode = 406;
  }
}

/**
 * HTTP 409 - Conflict
 */
export class ConflictError extends HttpError {
  constructor(message?: string) {
      super('ConflictError', message || 'Conflict');
      Object.setPrototypeOf(this, ConflictError.prototype);
      this.statusCode = 409;
  }
}

/**
 * HTTP 410 - Gone
 */
export class GoneError extends HttpError {
  constructor(message?: string) {
      super('GoneError', message || 'Gone');
      Object.setPrototypeOf(this, GoneError.prototype);
      this.statusCode = 410;
  }
}

/**
 * HTTP 415 - Unsupported Media Type
 */
export class UnsupportedMediaTypeError extends HttpError {
  constructor(message?: string) {
      super('UnsupportedMediaTypeError', message || 'Unsupported Media Type');
      Object.setPrototypeOf(this, UnsupportedMediaTypeError.prototype);
      this.statusCode = 415;
  }
}

/**
 * HTTP 500 - Internal Server Error
 */
export class InternalServerError extends HttpError {
  constructor(message?: string) {
      super('InternalServerError', message || 'Internal Server Error');
      Object.setPrototypeOf(this, InternalServerError.prototype);
      this.statusCode = 500;
  }
}

/**
 * HTTP 501 - Not Implemented
 */
export class NotImplementedError extends HttpError {
  constructor(message?: string) {
      super('NotImplementedError', message || 'Not Implemented');
      Object.setPrototypeOf(this, NotImplementedError.prototype);
      this.statusCode = 501;
  }
}
