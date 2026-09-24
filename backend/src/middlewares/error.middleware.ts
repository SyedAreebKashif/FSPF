import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { env } from '../config/env';
import { ApiError } from '../utils/apiError';

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
  path?: string;
  value?: unknown;
}

export const errorHandler: ErrorRequestHandler = (
  err: Error | ApiError | MongoError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error: ApiError;

  if (err instanceof ApiError) {
    error = err;
  } else if ((err as MongoError).name === 'CastError') {
    // Handling invalid MongoDB ObjectId cast error
    const mongoErr = err as MongoError;
    const message = `Invalid resource identifier: ${mongoErr.value}`;
    error = ApiError.badRequest(message);
  } else if ((err as MongoError).code === 11000) {
    // Handling duplicate key error in MongoDB (e.g., duplicate email)
    const mongoErr = err as MongoError;
    const field = mongoErr.keyValue ? Object.keys(mongoErr.keyValue)[0] : 'field';
    const value = mongoErr.keyValue ? mongoErr.keyValue[field] : '';
    const message = `Duplicate value '${value}' for field '${field}'. Please use another value.`;
    error = ApiError.conflict(message);
  } else if ((err as MongoError).name === 'ValidationError') {
    // Handling Mongoose schema validation errors
    const mongoErr = err as MongoError;
    const errors = mongoErr.errors
      ? Object.values(mongoErr.errors).map((el) => el.message)
      : [mongoErr.message];
    error = ApiError.badRequest('Validation Error', errors);
  } else if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid authentication token');
  } else if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Authentication token has expired');
  } else if ('type' in err && (err as { type: string }).type === 'entity.parse.failed') {
    // Malformed JSON body in request
    error = ApiError.badRequest('Malformed JSON body in request');
  } else {
    // Unhandled / system errors
    const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
    error = ApiError.internal(message);
    // Preserve stack if available
    if (err.stack) {
      error.stack = err.stack;
    }
  }

  // Response payload
  const responsePayload: {
    success: boolean;
    message: string;
    statusCode: number;
    errors?: unknown[];
    stack?: string;
  } = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
  };

  if (error.errors && error.errors.length > 0) {
    responsePayload.errors = error.errors;
  }

  // Include stack trace only in development
  if (env.NODE_ENV === 'development') {
    responsePayload.stack = error.stack;
  }

  res.status(error.statusCode).json(responsePayload);
};
