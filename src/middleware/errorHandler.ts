import { Request, Response, NextFunction } from 'express';
import type { ApiError } from '../types/index.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err);

  const apiError: ApiError = {
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production'
      ? 'An internal error occurred.'
      : err.message,
  };

  res.status(500).json(apiError);
}

export function notFoundHandler(_req: Request, res: Response): void {
  const error: ApiError = {
    code: 'NOT_FOUND',
    message: 'Resource not found.',
  };
  res.status(404).json(error);
}
