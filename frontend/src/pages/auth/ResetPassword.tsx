import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Lock, Mail, MessageSquareText, KeyRound } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { AnimatedBackground } from '../../components/shared/AnimatedBackground';

const schema = z
  .object({
    email: z.string().email('Enter a valid email'),
    otp: z.string().length(6, 'Enter the 6-digit code').regex(/^\d+$/, 'Code must be numeric'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include uppercase, lowercase, and a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const { resetPassword, isResetLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { email: searchParams.get('email') || '' } });

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
        <h1 className="text-2xl font-bold text-foreground text-center">Reset your password</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Enter the code we emailed you along with a new password
        </p>

        <form
          onSubmit={handleSubmit((data) => resetPassword({ email: data.email, otp: data.otp, password: data.password }))}
          className="mt-8 space-y-4"
        >
          <Input label="Email" type="email" leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
          <Input
            label="Verification Code"
            placeholder="6-digit code"
            maxLength={6}
            leftIcon={<KeyRound className="h-4 w-4" />}
            error={errors.otp?.message}
            {...register('otp')}
          />
          <Input label="New Password" type="password" leftIcon={<Lock className="h-4 w-4" />} error={errors.password?.message} {...register('password')} />
          <Input label="Confirm Password" type="password" leftIcon={<Lock className="h-4 w-4" />} error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          <Button type="submit" className="w-full" isLoading={isResetLoading}>
            Reset Password
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Didn&apos;t get a code?{' '}
          <Link to="/forgot-password" className="font-medium text-indigo-400 hover:text-indigo-300">
            Request a new one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
