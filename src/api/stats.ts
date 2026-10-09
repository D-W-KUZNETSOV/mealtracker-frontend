import { apiClient } from './client';
import type {
  AddPortionRequest,
  DailyStatsDto,
  AddFromPlanRequest,
  AddFromPlanResponse,
  CalendarResponse,
} from '../types/api';

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

  /** Удалить запись из дневника */
  deleteEntry: (entryId: number) =>
    apiClient.delete(`/api/stats/entries/${entryId}`),

    addFromPlan: (data: AddFromPlanRequest) =>
      apiClient.post<AddFromPlanResponse>('/api/stats/daily/add-from-plan', data),

    getCalendar: (month: string) =>
      apiClient.get<CalendarResponse>('/api/stats/calendar', {
        params: { month },
      }),
  };