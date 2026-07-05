import crypto from 'crypto';

/** Generates a 6-digit numeric OTP string, e.g. "042817" */
export const generateOtp = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

/** Hashes an OTP with SHA-256 so raw OTPs are never stored in the DB */
export const hashOtp = (otp: string): string => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

export const OTP_EXPIRE_MINUTES = 10;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_MAX_ATTEMPTS = 5;
