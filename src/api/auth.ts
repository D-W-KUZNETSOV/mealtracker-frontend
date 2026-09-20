import { apiClient } from './client';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
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
};