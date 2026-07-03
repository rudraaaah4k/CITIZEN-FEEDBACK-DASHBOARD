import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { authService } from '../services/authService';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setAuth, setLoading, logout: storeLogout, updateUser } = useAuthStore();
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
    onError: (error: { response?: { data?: { message?: string } } }) => {
      addToast({
        type: 'error',
        title: 'Login Failed',
        message: error.response?.data?.message || 'Invalid credentials',
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      addToast({ type: 'success', title: 'Account created successfully! 🎉' });
      navigate('/dashboard');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      addToast({
        type: 'error',
        title: 'Registration Failed',
        message: error.response?.data?.message || 'Registration failed. Please try again.',
      });
    },
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

  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      addToast({ type: 'success', title: 'Reset link sent! Check your email.' });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to send reset email',
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
    onSuccess: () => {
      addToast({ type: 'success', title: 'Password reset successfully! Please log in.' });
      navigate('/login');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      addToast({
        type: 'error',
        title: 'Reset Failed',
        message: error.response?.data?.message || 'Invalid or expired reset token',
      });
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
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    isForgotLoading: forgotPasswordMutation.isPending,
    isResetLoading: resetPasswordMutation.isPending,
    isUpdateLoading: updateProfileMutation.isPending,
  };
};
