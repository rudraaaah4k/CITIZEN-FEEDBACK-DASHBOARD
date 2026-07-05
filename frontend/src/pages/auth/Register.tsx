import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, MessageSquareText } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { AnimatedBackground } from '../../components/shared/AnimatedBackground';
import { GoogleLoginButton } from '../../components/auth/GoogleLoginButton';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include an uppercase letter, lowercase letter, and a number'),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const { register: registerUser, isRegisterLoading, googleAuth, isGoogleAuthLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => registerUser(data);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
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
        <h1 className="text-2xl font-bold text-foreground text-center">Create your account</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Start submitting and tracking feedback</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <Input label="Full Name" placeholder="Jane Doe" leftIcon={<User className="h-4 w-4" />} error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" placeholder="you@example.com" leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
          <Input label="Password" type="password" placeholder="••••••••" leftIcon={<Lock className="h-4 w-4" />} error={errors.password?.message} {...register('password')} />
          {!errors.password && <p className="-mt-2 text-xs text-muted-foreground">8+ characters with uppercase, lowercase, and a number</p>}
          <Input label="Phone (optional)" placeholder="+1 555 000 0000" leftIcon={<Phone className="h-4 w-4" />} {...register('phone')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" placeholder="City" {...register('city')} />
            <Input label="State" placeholder="State" {...register('state')} />
          </div>
          <Button type="submit" className="w-full" isLoading={isRegisterLoading}>
            Create Account
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <GoogleLoginButton onIdToken={(idToken) => googleAuth(idToken)} />
        {isGoogleAuthLoading && <p className="mt-2 text-center text-xs text-muted-foreground">Signing in…</p>}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
