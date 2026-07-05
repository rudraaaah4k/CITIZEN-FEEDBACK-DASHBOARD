import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquareText, ShieldCheck, RotateCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { AnimatedBackground } from '../../components/shared/AnimatedBackground';

const RESEND_COOLDOWN = 60;

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyEmail, resendOtp, isVerifyEmailLoading, isResendOtpLoading } = useAuth();

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    setDigits(Array.from({ length: 6 }, (_, i) => pasted[i] || ''));
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const otp = digits.join('');
  const canSubmit = otp.length === 6 && !!email;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) verifyEmail({ email, otp });
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    resendOtp({ email, purpose: 'verify_email' });
    setCooldown(RESEND_COOLDOWN);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <AnimatedBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl"
      >
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 text-lg font-bold text-foreground">
          <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5">
            <MessageSquareText className="h-5 w-5 text-white" />
          </div>
          CivicPulse
        </Link>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15">
          <ShieldCheck className="h-6 w-6 text-indigo-400" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-foreground text-center">Verify your email</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          We sent a 6-digit code to <span className="text-foreground">{email || 'your email'}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                inputMode="numeric"
                maxLength={1}
                className="h-14 w-11 rounded-xl border border-white/10 bg-white/5 text-center text-xl font-bold text-foreground focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            ))}
          </div>

          <Button type="submit" className="w-full" isLoading={isVerifyEmailLoading} disabled={!canSubmit}>
            Verify Email
          </Button>
        </form>

        <button
          onClick={handleResend}
          disabled={cooldown > 0 || isResendOtpLoading}
          className="mt-6 flex w-full items-center justify-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 disabled:cursor-not-allowed disabled:text-muted-foreground"
        >
          <RotateCw className="h-3.5 w-3.5" />
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Wrong email?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300">
            Register again
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
