import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

const handleCastError = (err: mongoose.Error.CastError): AppError => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleDuplicateKeyError = (err: Error & { code?: number; keyValue?: Record<string, string> }): AppError => {
  const field = Object.keys(err.keyValue || {})[0];
  const value = err.keyValue?.[field];
  return new AppError(`${field} '${value}' already exists. Please use a different value.`, 409);
};

const handleValidationError = (err: mongoose.Error.ValidationError): AppError => {
  const errors = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${errors.join('. ')}`, 400);
};

const handleJWTError = (): AppError => {
  return new AppError('Invalid token. Please log in again.', 401);
};

const handleJWTExpiredError = (): AppError => {
  return new AppError('Token expired. Please log in again.', 401);
};

export const errorHandler = (
err: Error & { statusCode?: number; code?: number | string; keyValue?: Record<string, string> },  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error: AppError | (Error & {
  statusCode?: number;
  code?: number | string;
  keyValue?: Record<string, string>;
}) = { ...err, message: err.message };

  if (err instanceof mongoose.Error.CastError) {
    error = handleCastError(err);
  }
if ((err as { code?: number | string }).code === 11000) {    error = handleDuplicateKeyError(
  err as Error & { code?: number; keyValue?: Record<string, string> }
);
  }
  if (err instanceof mongoose.Error.ValidationError) {
    error = handleValidationError(err);
  }
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }
  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  const appError = error as AppError;
  const statusCode = appError.statusCode || 500;
  const message = appError.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    logger.error(`${req.method} ${req.path} - ${statusCode}: ${message}`);
    logger.error(err.stack || '');
  } else {
    if (statusCode >= 500) {
      logger.error(`${req.method} ${req.path} - ${statusCode}: ${message}`);
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(appError.code && { code: appError.code }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};
