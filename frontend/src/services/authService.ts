import api from './api';
import { ApiResponse, Session, User } from '../types';

interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  state?: string;
}

interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

type OtpPurpose = 'verify_email' | 'reset_password';

export const authService = {
  login: (payload: LoginPayload) => api.post<ApiResponse<AuthData>>('/auth/login', payload),

  register: (payload: RegisterPayload) => api.post<ApiResponse<{ email: string }>>('/auth/register', payload),

  googleAuth: (idToken: string) => api.post<ApiResponse<AuthData>>('/auth/google', { idToken }),

  verifyEmail: (email: string, otp: string) =>
    api.post<ApiResponse<AuthData>>('/auth/verify-email', { email, otp }),

  resendOtp: (email: string, purpose: OtpPurpose) =>
    api.post<ApiResponse<null>>('/auth/resend-otp', { email, purpose }),

  logout: () => api.post<ApiResponse<null>>('/auth/logout'),

  logoutAll: () => api.post<ApiResponse<null>>('/auth/logout-all'),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<Omit<AuthData, 'user'>>>('/auth/refresh-token', { refreshToken }),

  getSessions: () => api.get<ApiResponse<{ sessions: Session[] }>>('/auth/sessions'),

  revokeSession: (tokenId: string) => api.delete<ApiResponse<null>>(`/auth/sessions/${tokenId}`),

  forgotPassword: (email: string) => api.post<ApiResponse<null>>('/auth/forgot-password', { email }),

  resetPassword: (email: string, otp: string, password: string) =>
    api.post<ApiResponse<null>>('/auth/reset-password', { email, otp, password }),

  getMe: () => api.get<ApiResponse<{ user: User }>>('/auth/me'),

  updateProfile: (data: Partial<User>) => api.patch<ApiResponse<{ user: User }>>('/auth/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch<ApiResponse<null>>('/auth/change-password', { currentPassword, newPassword }),
};
