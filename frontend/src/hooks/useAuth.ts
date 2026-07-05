import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { authService } from '../services/authService';

type ApiError = { response?: { data?: { message?: string; code?: string } } };
const errMsg = (e: ApiError, fallback: string) => e.response?.data?.message || fallback;

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setAuth, logout: storeLogout, updateUser } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      addToast({ type: 'success', title: `Welcome back, ${user.name}! 👋` });
      navigate(user.role === 'citizen' ? '/dashboard' : '/admin/dashboard');
    },
    onError: (error: ApiError, variables) => {
      if (error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        addToast({ type: 'warning', title: 'Please verify your email first' });
        navigate(`/verify-email?email=${encodeURIComponent(variables.email)}`);
        return;
      }
      addToast({ type: 'error', title: 'Login Failed', message: errMsg(error, 'Invalid credentials') });
    },
  });

  const googleAuthMutation = useMutation({
    mutationFn: authService.googleAuth,
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      addToast({ type: 'success', title: `Welcome, ${user.name}! 👋` });
      navigate(user.role === 'citizen' ? '/dashboard' : '/admin/dashboard');
    },
    onError: (error: ApiError) => {
      addToast({ type: 'error', title: 'Google Sign-In Failed', message: errMsg(error, 'Please try again') });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (response, variables) => {
      addToast({ type: 'success', title: 'Almost there!', message: 'Check your email for a verification code.' });
      navigate(`/verify-email?email=${encodeURIComponent(response.data.data.email || variables.email)}`);
    },
    onError: (error: ApiError) => {
      addToast({ type: 'error', title: 'Registration Failed', message: errMsg(error, 'Registration failed. Please try again.') });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) => authService.verifyEmail(email, otp),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      addToast({ type: 'success', title: 'Email verified! Welcome aboard 🎉' });
      navigate('/dashboard');
    },
    onError: (error: ApiError) => {
      addToast({ type: 'error', title: 'Verification Failed', message: errMsg(error, 'Invalid or expired code') });
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: ({ email, purpose }: { email: string; purpose: 'verify_email' | 'reset_password' }) =>
      authService.resendOtp(email, purpose),
    onSuccess: () => addToast({ type: 'success', title: 'A new code has been sent' }),
    onError: (error: ApiError) => addToast({ type: 'error', title: 'Error', message: errMsg(error, 'Failed to resend code') }),
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      storeLogout();
      queryClient.clear();
      navigate('/');
      addToast({ type: 'success', title: 'Logged out successfully' });
    },
  });

  const logoutAllMutation = useMutation({
    mutationFn: authService.logoutAll,
    onSettled: () => {
      storeLogout();
      queryClient.clear();
      navigate('/');
      addToast({ type: 'success', title: 'Logged out of all devices' });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      addToast({ type: 'success', title: 'Code sent!', message: 'Check your email for the reset code.' });
    },
    onError: (error: ApiError) => {
      addToast({ type: 'error', title: 'Error', message: errMsg(error, 'Failed to send reset code') });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ email, otp, password }: { email: string; otp: string; password: string }) =>
      authService.resetPassword(email, otp, password),
    onSuccess: () => {
      addToast({ type: 'success', title: 'Password reset successfully! Please log in.' });
      navigate('/login');
    },
    onError: (error: ApiError) => {
      addToast({ type: 'error', title: 'Reset Failed', message: errMsg(error, 'Invalid or expired code') });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (response) => {
      updateUser(response.data.data.user);
      addToast({ type: 'success', title: 'Profile updated successfully' });
    },
    onError: () => {
      addToast({ type: 'error', title: 'Failed to update profile' });
    },
  });

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    googleAuth: googleAuthMutation.mutate,
    register: registerMutation.mutate,
    verifyEmail: verifyEmailMutation.mutate,
    resendOtp: resendOtpMutation.mutate,
    logout: logoutMutation.mutate,
    logoutAll: logoutAllMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    isGoogleAuthLoading: googleAuthMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isVerifyEmailLoading: verifyEmailMutation.isPending,
    isResendOtpLoading: resendOtpMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    isForgotLoading: forgotPasswordMutation.isPending,
    isResetLoading: resetPasswordMutation.isPending,
    isUpdateLoading: updateProfileMutation.isPending,
  };
};

export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: authService.getSessions,
    select: (data) => data.data.data.sessions,
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  return useMutation({
    mutationFn: authService.revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      addToast({ type: 'success', title: 'Session revoked' });
    },
    onError: () => addToast({ type: 'error', title: 'Failed to revoke session' }),
  });
};
