import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nutritionApi } from '../api/nutrition';
import type { GoalsRequest } from '../types/api';

// ============================================================
// Ключи кеша
// ============================================================
export const nutritionKeys = {
  all: ['nutrition'] as const,
  goals: () => [...nutritionKeys.all, 'goals'] as const,
  targetProtein: () => [...nutritionKeys.all, 'targetProtein'] as const,
};

// ---------- Текущие цели ----------
export function useGoals() {
  return useQuery({
    queryKey: nutritionKeys.goals(),
    queryFn: async () => (await nutritionApi.getGoals()).data,
  });
}

// ---------- Целевой белок ----------
export function useTargetProtein() {
  return useQuery({
    queryKey: nutritionKeys.targetProtein(),
    queryFn: async () => (await nutritionApi.getTargetProtein()).data,
  });
}

// ---------- Сохранить цели ----------
export function useSaveGoals() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GoalsRequest) => nutritionApi.saveGoals(data),
    onSuccess: () => {
      // После сохранения целей — инвалидируем цели и целевой белок
      queryClient.invalidateQueries({ queryKey: nutritionKeys.all });
      // И статистику дневника — потому что targetProtein поменяется
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}