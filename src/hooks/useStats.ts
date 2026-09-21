import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { statsApi } from '../api/stats';
import type { AddPortionRequest } from '../types/api';

// ============================================================
// Ключи кеша
// ============================================================
export const statsKeys = {
  all: ['stats'] as const,
  today: () => [...statsKeys.all, 'today'] as const,
  byDate: (date: string) => [...statsKeys.all, 'byDate', date] as const,
};

// ---------- Сводка за сегодня ----------
export function useTodayStats() {
  return useQuery({
    queryKey: statsKeys.today(),
    queryFn: async () => (await statsApi.getToday()).data,
  });
}

// ---------- Сводка за конкретную дату ----------
export function useStatsByDate(date: string | null) {
  return useQuery({
    queryKey: statsKeys.byDate(date ?? ''),
    queryFn: async () => (await statsApi.getByDate(date!)).data,
    enabled: !!date,
  });
}

// ---------- Добавить порцию ----------
export function useAddPortion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddPortionRequest) => statsApi.addPortion(data),
    onSuccess: () => {
      // Инвалидируем все запросы статистики
      queryClient.invalidateQueries({ queryKey: statsKeys.all });
    },
  });
}