import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { measurementsApi } from '../api/measurements';
import type { CreateBodyMeasurementRequest } from '../types/api';

// ============================================================
// Ключи кеша
// ============================================================
export const measurementsKeys = {
  all: ['measurements'] as const,
  list: () => [...measurementsKeys.all, 'list'] as const,
};

// ---------- Список замеров ----------
export function useMeasurements() {
  return useQuery({
    queryKey: measurementsKeys.list(),
    queryFn: async () => (await measurementsApi.list()).data,
  });
}

// ---------- Добавить замер ----------
export function useCreateMeasurement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBodyMeasurementRequest) =>
      measurementsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: measurementsKeys.all });
    },
  });
}

// ---------- Удалить замер ----------
export function useDeleteMeasurement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => measurementsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: measurementsKeys.all });
    },
  });
}