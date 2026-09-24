export class ApiError extends Error {
  public statusCode: number;
  public status: 'fail' | 'error';
  public isOperational: boolean;
  public errors?: unknown[];

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    errors?: unknown[],
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = 'Bad Request', errors?: unknown[]): ApiError {
    return new ApiError(400, message, true, errors);
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(401, message, true);
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(403, message, true);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, message, true);
  }

  static conflict(message = 'Conflict'): ApiError {
    return new ApiError(409, message, true);
  }

  static unprocessable(message = 'Unprocessable Entity', errors?: unknown[]): ApiError {
    return new ApiError(422, message, true, errors);
  }

  static tooManyRequests(message = 'Too many requests, please try again later.'): ApiError {
    return new ApiError(429, message, true);
  }

  static internal(message = 'Internal Server Error'): ApiError {
    return new ApiError(500, message, false);
  }
}
