import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  register,
  verifyEmail,
  resendOtp,
  login,
  googleAuth,
  logout,
  logoutAll,
  refreshToken,
  getSessions,
  revokeSession,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter';

const router = Router();

const strongPasswordRule = (field: string) =>
  body(field)
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(`${field === 'password' ? 'Password' : 'New password'} must be 8+ chars with uppercase, lowercase, and number`);

const strongPassword = strongPasswordRule('password');

const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  strongPassword,
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

const otpValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('A 6-digit code is required'),
];

// --- Registration + email verification ---
router.post('/register', authLimiter, validate(registerValidation), register);
router.post('/verify-email', otpLimiter, validate(otpValidation), verifyEmail);
router.post(
  '/resend-otp',
  otpLimiter,
  validate([body('email').isEmail().normalizeEmail(), body('purpose').isIn(['verify_email', 'reset_password'])]),
  resendOtp
);

// --- Login ---
router.post('/login', authLimiter, validate(loginValidation), login);
router.post('/google', authLimiter, validate([body('idToken').notEmpty().withMessage('Google ID token required')]), googleAuth);

// --- Session lifecycle ---
router.post('/logout', authenticate, logout);
router.post('/logout-all', authenticate, logoutAll);
router.post('/refresh-token', refreshToken);
router.get('/sessions', authenticate, getSessions);
router.delete('/sessions/:tokenId', authenticate, validate([param('tokenId').notEmpty()]), revokeSession);

// --- Forgot / reset password (OTP-based) ---
router.post('/forgot-password', otpLimiter, validate([body('email').isEmail().normalizeEmail()]), forgotPassword);
router.post(
  '/reset-password',
  otpLimiter,
  validate([...otpValidation, strongPassword]),
  resetPassword
);

// --- Profile ---
router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, updateProfile);
router.patch(
  '/change-password',
  authenticate,
  validate([body('currentPassword').notEmpty(), strongPasswordRule('newPassword')]),
  changePassword
);

export default router;
