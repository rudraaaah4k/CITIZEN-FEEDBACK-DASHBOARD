import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import Notification from '../models/Notification';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../config/jwt';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/apiResponse';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/emailService';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

const setTokenCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, phone, city, state } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already registered. Please use a different email or login.', 409));
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    city,
    state,
    role: 'citizen',
    isVerified: true,
  });

  await Notification.create({
    recipient: user._id,
    type: 'welcome',
    title: 'Welcome to CitizenFeedback! 🏛️',
    message: `Hello ${name}! Your account has been created successfully. Start submitting feedback to make your community better.`,
  });

  try {
    await sendWelcomeEmail(name, email);
  } catch {
    logger.warn(`Welcome email failed for ${email}`);
  }

  const payload = { id: user._id.toString(), role: user.role, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await User.findByIdAndUpdate(user._id, { refreshToken });

  setTokenCookies(res, accessToken, refreshToken);

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };

  sendSuccess(res, { user: userResponse, accessToken, refreshToken }, 'Account created successfully', 201);
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, rememberMe } = req.body;

  const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  if (user.isLocked()) {
    const lockTime = Math.ceil((user.lockUntil!.getTime() - Date.now()) / 60000);
    return next(new AppError(`Account locked. Try again in ${lockTime} minutes`, 423));
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    const maxAttempts = 5;
    const attempts = user.loginAttempts + 1;

    if (attempts >= maxAttempts) {
      await User.findByIdAndUpdate(user._id, {
        loginAttempts: attempts,
        lockUntil: new Date(Date.now() + 30 * 60 * 1000),
      });
      return next(new AppError('Too many failed attempts. Account locked for 30 minutes.', 423));
    }

    await User.findByIdAndUpdate(user._id, { loginAttempts: attempts });
    return next(new AppError(`Invalid email or password. ${maxAttempts - attempts} attempts remaining.`, 401));
  }

  if (!user.isActive) {
    return next(new AppError('Account deactivated. Contact support.', 403));
  }

  await User.findByIdAndUpdate(user._id, {
    loginAttempts: 0,
    lockUntil: undefined,
    lastLogin: new Date(),
  });

  const payload = { id: user._id.toString(), role: user.role, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await User.findByIdAndUpdate(user._id, { refreshToken });

  const cookieExpiry = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: cookieExpiry,
  });

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isVerified: user.isVerified,
    lastLogin: user.lastLogin,
    notificationPreferences: user.notificationPreferences,
  };

  sendSuccess(res, { user: userResponse, accessToken, refreshToken }, 'Login successful');
});

export const logout = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.id) {
    await User.findByIdAndUpdate(req.user.id, { refreshToken: undefined });
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  sendSuccess(res, null, 'Logged out successfully');
});

export const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) {
    return next(new AppError('Refresh token required', 401));
  }

  const decoded = verifyRefreshToken(token);

  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== token) {
    return next(new AppError('Invalid refresh token. Please log in again.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Account deactivated', 403));
  }

  const payload = { id: user._id.toString(), role: user.role, email: user.email };
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

  setTokenCookies(res, newAccessToken, newRefreshToken);

  sendSuccess(res, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Token refreshed');
});

export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return sendSuccess(res, null, 'If this email exists, a reset link has been sent.');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  await User.findByIdAndUpdate(user._id, {
    resetPasswordToken: hashedToken,
    resetPasswordExpire: new Date(Date.now() + 10 * 60 * 1000),
  });

  try {
    await sendPasswordResetEmail(user.name, user.email, resetToken);
    sendSuccess(res, null, 'Password reset link sent to your email');
  } catch {
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: undefined,
      resetPasswordExpire: undefined,
    });
    return next(new AppError('Failed to send reset email. Please try again.', 500));
  }
});

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: new Date() },
  }).select('+resetPasswordToken +resetPasswordExpire');

  if (!user) {
    return next(new AppError('Invalid or expired reset token. Please request a new one.', 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  await User.findByIdAndUpdate(user._id, { refreshToken: undefined });

  sendSuccess(res, null, 'Password reset successful. Please log in with your new password.');
});

export const getMe = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user?.id)
    .populate('department', 'name code');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  sendSuccess(res, { user }, 'Profile retrieved successfully');
});

export const updateProfile = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, phone, address, city, state, pincode, notificationPreferences } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user?.id,
    { name, phone, address, city, state, pincode, notificationPreferences },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  sendSuccess(res, { user }, 'Profile updated successfully');
});

export const changePassword = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user?.id).select('+password');
  if (!user) return next(new AppError('User not found', 404));

  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return next(new AppError('Current password is incorrect', 400));
  }

  user.password = newPassword;
  await user.save();

  await User.findByIdAndUpdate(user._id, { refreshToken: undefined });

  sendSuccess(res, null, 'Password changed successfully. Please log in again.');
});
