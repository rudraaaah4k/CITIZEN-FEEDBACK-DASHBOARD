import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, MessageSquareText } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { AnimatedBackground } from '../../components/shared/AnimatedBackground';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoginLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { rememberMe: true } });

  const onSubmit = (data: FormData) => login(data);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <AnimatedBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl"
      >
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 text-lg font-bold text-foreground">
          <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5">
            <MessageSquareText className="h-5 w-5 text-white" />
          </div>
          CivicPulse
        </Link>
        <h1 className="text-2xl font-bold text-foreground text-center">Welcome back</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Sign in to continue to your dashboard</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-muted-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" className="rounded border-white/20 bg-white/5" {...register('rememberMe')} />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full" isLoading={isLoginLoading}>
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
