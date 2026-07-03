import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../config/jwt';
import User from '../models/User';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

export interface AuthRequest extends Request {
  user?: JWTPayload & {
    _id: string;
    name: string;
    isActive: boolean;
  };
}

export const authenticate = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new AppError('Authentication required. Please log in.', 401));
  }

  const decoded = verifyAccessToken(token);

  const user = await User.findById(decoded.id).select('+isActive');
  
  if (!user) {
    return next(new AppError('User not found. Please log in again.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Contact support.', 403));
  }

  req.user = {
    ...decoded,
    _id: user._id.toString(),
    name: user.name,
    isActive: user.isActive,
  };

  next();
});

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(`Access denied. Required role: ${roles.join(' or ')}`, 403));
      return;
    }

    next();
  };
};

export const optionalAuth = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = {
          ...decoded,
          _id: user._id.toString(),
          name: user.name,
          isActive: user.isActive,
        };
      }
    } catch {
      // Silent fail for optional auth
    }
  }

  next();
});
