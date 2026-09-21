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

  /** Дневная норма калорий (просто число) */
  getDailyCalories: () =>
    apiClient.get<DailyCaloriesDto>('/api/profile/calories/daily'),
};