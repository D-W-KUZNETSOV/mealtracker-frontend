import { apiClient } from './client';
import type { AddPortionRequest, DailyStatsDto } from '../types/api';

// ============================================================
// Модуль API для дневника питания.
// ============================================================
export const statsApi = {
  /** Сводка за сегодня */
  getToday: () => apiClient.get<DailyStatsDto>('/api/stats/daily'),

  /** Сводка за конкретную дату (формат YYYY-MM-DD) */
  getByDate: (date: string) =>
    apiClient.get<DailyStatsDto>(`/api/stats/daily/${date}`),

  /** Добавить порцию рецепта */
  addPortion: (data: AddPortionRequest) =>
    apiClient.post<DailyStatsDto>('/api/stats/daily/add', data),
};