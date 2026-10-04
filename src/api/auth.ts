import { apiClient } from './client';
import type {
  AuthResponse,
  ForgotPasswordRequest,      // ← 🆕
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,       // ← 🆕
  UserResponse,
} from '../types/api';

// ============================================================
// Модуль auth API. Тонкая обёртка над apiClient.
// Может пригодиться, если где-то захотим вызывать напрямую,
// а не через zustand-стор.
// ============================================================
export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/api/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/api/auth/register', data),

  me: () => apiClient.get<UserResponse>('/api/auth/me'),

  // 🆕 Восстановление пароля
    forgotPassword: (data: ForgotPasswordRequest) =>
      apiClient.post<void>('/api/auth/forgot-password', data),

    resetPassword: (data: ResetPasswordRequest) =>
      apiClient.post<void>('/api/auth/reset-password', data),
  };
