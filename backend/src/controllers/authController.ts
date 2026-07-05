import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import Notification from '../models/Notification';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../config/jwt';
import { verifyGoogleIdToken } from '../config/googleAuth';
import { generateOtp, hashOtp, OTP_EXPIRE_MINUTES, OTP_RESEND_COOLDOWN_SECONDS, OTP_MAX_ATTEMPTS } from '../utils/otp';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/apiResponse';
import { sendWelcomeEmail, sendOtpEmail } from '../utils/emailService';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
});

const setTokenCookies = (res: Response, accessToken: string, refreshToken: string, refreshMaxAge = REFRESH_COOKIE_MAX_AGE): void => {
  res.cookie('accessToken', accessToken, { ...cookieOptions(), maxAge: ACCESS_COOKIE_MAX_AGE });
  res.cookie('refreshToken', refreshToken, { ...cookieOptions(), maxAge: refreshMaxAge });
};

const publicUser = (user: IUser) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  isVerified: user.isVerified,
  authProvider: user.authProvider,
  lastLogin: user.lastLogin,
  notificationPreferences: user.notificationPreferences,
  createdAt: user.createdAt,
});

/** Issues a new access/refresh token pair and appends a session entry for this device */
const issueSession = async (
  user: IUser,
  req: Request
): Promise<{ accessToken: string; refreshToken: string }> => {
  const payload = { id: user._id.toString(), role: user.role, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const tokenId = crypto.randomUUID();
  const session = {
    tokenId,
    refreshToken,
    userAgent: req.headers['user-agent']?.toString().slice(0, 200),
    ip: req.ip,
    createdAt: new Date(),
    lastActive: new Date(),
  };

  // Cap concurrent sessions at 10 per user (drop the oldest)
  const existing = await User.findById(user._id).select('+sessions');
  const sessions = [...(existing?.sessions || []), session].slice(-10);

  await User.findByIdAndUpdate(user._id, { sessions });

  return { accessToken, refreshToken };
};

// ============================================================
// REGISTER + EMAIL OTP VERIFICATION
// ============================================================

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, phone, city, state } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.isVerified) {
      return next(new AppError('Email already registered. Please log in instead.', 409));
    }
    // Unverified account re-registering: overwrite details & resend OTP
    existingUser.name = name;
    existingUser.password = password;
    existingUser.phone = phone;
    existingUser.city = city;
    existingUser.state = state;
    await issueOtp(existingUser, 'verify_email');
    return sendSuccess(res, { email }, 'Verification code sent to your email', 201);
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    city,
    state,
    role: 'citizen',
    authProvider: 'local',
    isVerified: false,
  });

  await issueOtp(user, 'verify_email');

  sendSuccess(res, { email: user.email }, 'Account created. A verification code has been sent to your email.', 201);
});

/** Generates, hashes, persists, and emails a fresh OTP for the given purpose */
async function issueOtp(user: IUser, purpose: 'verify_email' | 'reset_password') {
  const otp = generateOtp();
  user.otp = hashOtp(otp);
  user.otpExpire = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);
  user.otpPurpose = purpose;
  user.otpAttempts = 0;
  user.otpLastSentAt = new Date();
  await user.save({ validateBeforeSave: false });

  try {
    await sendOtpEmail(user.name, user.email, otp, purpose);
  } catch {
    logger.warn(`OTP email failed for ${user.email}`);
    throw new AppError('Failed to send verification email. Please try again.', 500);
  }
}

export const verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select('+otp +otpExpire +otpPurpose +otpAttempts');
  if (!user) return next(new AppError('Invalid email or verification code', 400));

  if (user.isVerified) {
    return sendSuccess(res, null, 'Email already verified. Please log in.');
  }

  if (!user.otp || user.otpPurpose !== 'verify_email' || !user.otpExpire || user.otpExpire < new Date()) {
    return next(new AppError('Verification code expired. Please request a new one.', 400));
  }

  if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
    return next(new AppError('Too many incorrect attempts. Please request a new code.', 429));
  }

  if (hashOtp(otp) !== user.otp) {
    user.otpAttempts += 1;
    await user.save({ validateBeforeSave: false });
    return next(new AppError(`Incorrect code. ${OTP_MAX_ATTEMPTS - user.otpAttempts} attempts remaining.`, 400));
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpire = undefined;
  user.otpPurpose = undefined;
  user.otpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  await Notification.create({
    recipient: user._id,
    type: 'welcome',
    title: 'Welcome to CitizenFeedback! 🏛️',
    message: `Hello ${user.name}! Your email is verified and your account is ready to go.`,
  });

  try {
    await sendWelcomeEmail(user.name, user.email);
  } catch {
    logger.warn(`Welcome email failed for ${user.email}`);
  }

  const { accessToken, refreshToken } = await issueSession(user, req);
  setTokenCookies(res, accessToken, refreshToken);

  sendSuccess(res, { user: publicUser(user), accessToken, refreshToken }, 'Email verified successfully');
});

export const resendOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, purpose } = req.body as { email: string; purpose: 'verify_email' | 'reset_password' };

  const user = await User.findOne({ email }).select('+otpLastSentAt');
  if (!user) {
    // Don't leak whether the email exists
    return sendSuccess(res, null, 'If this email is registered, a new code has been sent.');
  }

  if (purpose === 'verify_email' && user.isVerified) {
    return next(new AppError('Email already verified. Please log in.', 400));
  }

  if (user.otpLastSentAt && Date.now() - user.otpLastSentAt.getTime() < OTP_RESEND_COOLDOWN_SECONDS * 1000) {
    const wait = Math.ceil((OTP_RESEND_COOLDOWN_SECONDS * 1000 - (Date.now() - user.otpLastSentAt.getTime())) / 1000);
    return next(new AppError(`Please wait ${wait}s before requesting another code.`, 429));
  }

  await issueOtp(user, purpose);
  sendSuccess(res, null, 'A new verification code has been sent to your email.');
});

// ============================================================
// LOGIN / LOGOUT / REFRESH
// ============================================================

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, rememberMe } = req.body;

  const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

  if (!user || user.authProvider !== 'local') {
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

  if (!user.isVerified) {
    return next(new AppError('Please verify your email before logging in.', 403, 'EMAIL_NOT_VERIFIED'));
  }

  await User.findByIdAndUpdate(user._id, { loginAttempts: 0, lockUntil: undefined, lastLogin: new Date() });

  const { accessToken, refreshToken } = await issueSession(user, req);
  const cookieExpiry = rememberMe ? 30 * 24 * 60 * 60 * 1000 : REFRESH_COOKIE_MAX_AGE;
  setTokenCookies(res, accessToken, refreshToken, cookieExpiry);

  sendSuccess(res, { user: publicUser(user), accessToken, refreshToken }, 'Login successful');
});

export const googleAuth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { idToken } = req.body;
  if (!idToken) return next(new AppError('Google ID token is required', 400));

  if (!process.env.GOOGLE_CLIENT_ID) {
    return next(new AppError('Google login is not configured on this server.', 501));
  }

  let profile;
  try {
    profile = await verifyGoogleIdToken(idToken);
  } catch {
    return next(new AppError('Invalid or expired Google token. Please try again.', 401));
  }

  if (!profile.emailVerified) {
    return next(new AppError('Your Google account email is not verified.', 401));
  }

  let user = await User.findOne({ $or: [{ googleId: profile.googleId }, { email: profile.email }] });

  if (!user) {
    user = await User.create({
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
      googleId: profile.googleId,
      authProvider: 'google',
      role: 'citizen',
      isVerified: true,
    });

    await Notification.create({
      recipient: user._id,
      type: 'welcome',
      title: 'Welcome to CitizenFeedback! 🏛️',
      message: `Hello ${user.name}! Your account was created via Google Sign-In.`,
    });

    try {
      await sendWelcomeEmail(user.name, user.email);
    } catch {
      logger.warn(`Welcome email failed for ${user.email}`);
    }
  } else if (!user.googleId) {
    // Existing local account signing in with Google for the first time — link it
    user.googleId = profile.googleId;
    user.isVerified = true;
    if (!user.avatar) user.avatar = profile.avatar;
    await user.save({ validateBeforeSave: false });
  }

  if (!user.isActive) {
    return next(new AppError('Account deactivated. Contact support.', 403));
  }

  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

  const { accessToken, refreshToken } = await issueSession(user, req);
  setTokenCookies(res, accessToken, refreshToken);

  sendSuccess(res, { user: publicUser(user), accessToken, refreshToken }, 'Signed in with Google successfully');
});

export const logout = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (req.user?.id && token) {
    const user = await User.findById(req.user.id).select('+sessions');
    if (user) {
      user.sessions = user.sessions.filter((s) => s.refreshToken !== token);
      await user.save({ validateBeforeSave: false });
    }
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  sendSuccess(res, null, 'Logged out successfully');
});

export const logoutAll = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.id) {
    await User.findByIdAndUpdate(req.user.id, { sessions: [] });
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  sendSuccess(res, null, 'Logged out of all devices');
});

export const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) {
    return next(new AppError('Refresh token required', 401));
  }

  const decoded = verifyRefreshToken(token);

  const user = await User.findById(decoded.id).select('+sessions');

  const session = user?.sessions.find((s) => s.refreshToken === token);
  if (!user || !session) {
    return next(new AppError('Invalid refresh token. Please log in again.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Account deactivated', 403));
  }

  const payload = { id: user._id.toString(), role: user.role, email: user.email };
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  session.refreshToken = newRefreshToken;
  session.lastActive = new Date();
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, newAccessToken, newRefreshToken);

  sendSuccess(res, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Token refreshed');
});

// ============================================================
// SESSION MANAGEMENT
// ============================================================

export const getSessions = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const currentToken = req.cookies?.refreshToken || req.body?.refreshToken;
  const user = await User.findById(req.user?.id).select('+sessions');
  if (!user) return next(new AppError('User not found', 404));

  const sessions = user.sessions
    .sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime())
    .map((s) => ({
      tokenId: s.tokenId,
      userAgent: s.userAgent,
      ip: s.ip,
      createdAt: s.createdAt,
      lastActive: s.lastActive,
      isCurrent: s.refreshToken === currentToken,
    }));

  sendSuccess(res, { sessions }, 'Sessions retrieved');
});

export const revokeSession = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { tokenId } = req.params;
  const user = await User.findById(req.user?.id).select('+sessions');
  if (!user) return next(new AppError('User not found', 404));

  user.sessions = user.sessions.filter((s) => s.tokenId !== tokenId);
  await user.save({ validateBeforeSave: false });

  sendSuccess(res, null, 'Session revoked');
});

// ============================================================
// FORGOT / RESET PASSWORD (OTP-based)
// ============================================================

export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  const user = await User.findOne({ email }).select('+otpLastSentAt');

  if (!user || user.authProvider !== 'local') {
    // Don't leak account existence
    return sendSuccess(res, null, 'If this email is registered, a verification code has been sent.');
  }

  if (user.otpLastSentAt && Date.now() - user.otpLastSentAt.getTime() < OTP_RESEND_COOLDOWN_SECONDS * 1000) {
    const wait = Math.ceil((OTP_RESEND_COOLDOWN_SECONDS * 1000 - (Date.now() - user.otpLastSentAt.getTime())) / 1000);
    return next(new AppError(`Please wait ${wait}s before requesting another code.`, 429));
  }

  try {
    await issueOtp(user, 'reset_password');
    sendSuccess(res, null, 'A password reset code has been sent to your email.');
  } catch {
    return next(new AppError('Failed to send reset email. Please try again.', 500));
  }
});

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, otp, password } = req.body;

  const user = await User.findOne({ email }).select('+otp +otpExpire +otpPurpose +otpAttempts +password');
  if (!user) return next(new AppError('Invalid email or verification code', 400));

  if (!user.otp || user.otpPurpose !== 'reset_password' || !user.otpExpire || user.otpExpire < new Date()) {
    return next(new AppError('Verification code expired. Please request a new one.', 400));
  }

  if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
    return next(new AppError('Too many incorrect attempts. Please request a new code.', 429));
  }

  if (hashOtp(otp) !== user.otp) {
    user.otpAttempts += 1;
    await user.save({ validateBeforeSave: false });
    return next(new AppError(`Incorrect code. ${OTP_MAX_ATTEMPTS - user.otpAttempts} attempts remaining.`, 400));
  }

  user.password = password;
  user.otp = undefined;
  user.otpExpire = undefined;
  user.otpPurpose = undefined;
  user.otpAttempts = 0;
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.sessions = []; // force re-login everywhere after a password reset
  await user.save();

  sendSuccess(res, null, 'Password reset successful. Please log in with your new password.');
});

// ============================================================
// PROFILE
// ============================================================

export const getMe = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user?.id).populate('department', 'name code');

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

  if (user.authProvider !== 'local') {
    return next(new AppError('This account uses Google Sign-In and has no password to change.', 400));
  }

  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return next(new AppError('Current password is incorrect', 400));
  }

  user.password = newPassword;
  user.sessions = [];
  await user.save();

  sendSuccess(res, null, 'Password changed successfully. Please log in again.');
});
