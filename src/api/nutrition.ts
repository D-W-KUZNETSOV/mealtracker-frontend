import { apiClient } from './client';
import type {
  GoalsRequest,
  TargetProteinDto,
  UserGoalsDto,
} from '../types/api';

// ============================================================
// Модуль API для целей КБЖУ.
// ============================================================
export const nutritionApi = {
  /** Текущие цели */
  getGoals: () => apiClient.get<UserGoalsDto>('/api/nutrition/goals'),

  /** Установить / обновить цели */
  saveGoals: (data: GoalsRequest) =>
    apiClient.post<UserGoalsDto>('/api/nutrition/goals', data),

  /** Целевой белок в день */
  getTargetProtein: () =>
    apiClient.get<TargetProteinDto>('/api/nutrition/target-protein'),
};