import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';
import { User } from '../models/user.model';
import { IUserPayload } from '../types';

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(ApiError.unauthorized('Authentication required: Missing or invalid Bearer token'));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next(ApiError.unauthorized('Authentication token is required'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as IUserPayload;

      // If MongoDB is connected, verify user exists in database
      if (mongoose.connection.readyState === 1) {
        const currentUser = await User.findById(decoded._id);
        if (!currentUser) {
          return next(
            ApiError.unauthorized('The user belonging to this token no longer exists')
          );
        }

        req.user = {
          _id: currentUser._id.toString(),
          email: currentUser.email,
          role: currentUser.role,
        };
      } else {
        // High-performance / offline mode: trust cryptographically verified JWT payload
        req.user = {
          _id: decoded._id,
          email: decoded.email,
          role: decoded.role,
        };
      }

      next();
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return next(ApiError.unauthorized('Token has expired, please log in again'));
      }
      if (err instanceof jwt.JsonWebTokenError) {
        return next(ApiError.unauthorized('Invalid authentication token'));
      }
      return next(ApiError.unauthorized('Authentication failed'));
    }
  }
);

/**
 * Restrict access to specific roles (e.g. admin)
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden('You do not have permission to perform this action')
      );
    }
    next();
  };
};
