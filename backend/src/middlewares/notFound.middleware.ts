import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Cannot find route ${req.method} ${req.originalUrl}`));
};
