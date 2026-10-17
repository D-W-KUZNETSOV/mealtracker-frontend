import { apiClient } from './client';
import type {
  DailyCaloriesDto,
  ProfileUpdateRequest,
  UserProfileDto,
} from '../types/api';

// ============================================================
// Модуль API для профиля пользователя.
// ============================================================
export const profileApi = {
  /** Текущий профиль */
  getProfile: () => apiClient.get<UserProfileDto>('/api/profile'),

  /** Обновить профиль */
  updateProfile: (data: ProfileUpdateRequest) =>
    apiClient.put<UserProfileDto>('/api/profile', data),

    /** Обновить только отображаемое имя (для модалки) */
      updateDisplayName: (displayName: string) =>
        apiClient.patch<void>('/api/profile/display-name', { displayName }),

  /** Дневная норма калорий (просто число) */
  getDailyCalories: () =>
    apiClient.get<DailyCaloriesDto>('/api/profile/calories/daily'),

    // 🆕 Удаление аккаунта
      deleteAccount: (password: string) =>
        apiClient.delete('/api/account', { data: { password } }),
};