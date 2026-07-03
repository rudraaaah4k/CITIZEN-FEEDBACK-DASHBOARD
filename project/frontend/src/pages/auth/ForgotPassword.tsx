import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, MessageSquareText, ArrowLeft } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { AnimatedBackground } from '../../components/shared/AnimatedBackground';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const { forgotPassword, isForgotLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

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
        <h1 className="text-2xl font-bold text-foreground text-center">Forgot password?</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">We&apos;ll email you a reset link</p>

        <form onSubmit={handleSubmit((data) => forgotPassword(data.email))} className="mt-8 space-y-4">
          <Input label="Email" type="email" placeholder="you@example.com" leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
          <Button type="submit" className="w-full" isLoading={isForgotLoading}>
            Send Reset Link
          </Button>
        </form>

        <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      </motion.div>
    </div>
  );
}
