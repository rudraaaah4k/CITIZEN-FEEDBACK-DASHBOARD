import api from './api';
import { ApiResponse, User } from '../types';

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

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<AuthData>>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<AuthData>>('/auth/register', payload),

  logout: () =>
    api.post<ApiResponse<null>>('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<AuthData>>('/auth/refresh-token', { refreshToken }),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<null>>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<ApiResponse<null>>(`/auth/reset-password/${token}`, { password }),

  getMe: () =>
    api.get<ApiResponse<{ user: User }>>('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    api.patch<ApiResponse<{ user: User }>>('/auth/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch<ApiResponse<null>>('/auth/change-password', { currentPassword, newPassword }),
};
