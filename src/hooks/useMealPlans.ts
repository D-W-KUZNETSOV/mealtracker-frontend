import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mealPlansApi } from '../api/mealPlans';
import type {
  CreateMealPlanRequest,
  CreateMealPlanItemRequest,
} from '../types/api';

export const mealPlanKeys = {
  all: ['mealPlans'] as const,
  detail: (id: number) => [...mealPlanKeys.all, 'detail', id] as const,
};

export function useMealPlans() {
  return useQuery({
    queryKey: mealPlanKeys.all,
    queryFn: async () => (await mealPlansApi.getAll()).data,
  });
}

export function useMealPlan(id: number | null) {
  return useQuery({
    queryKey: mealPlanKeys.detail(id ?? 0),
    queryFn: async () => (await mealPlansApi.getById(id!)).data,
    enabled: !!id,
  });
}

export function useCreateMealPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMealPlanRequest) => mealPlansApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: mealPlanKeys.all }),
  });
}

export function useUpdateMealPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateMealPlanRequest }) =>
      mealPlansApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: mealPlanKeys.all }),
  });
}

export function useDeleteMealPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => mealPlansApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: mealPlanKeys.all }),
  });
}

export function useAddMealPlanItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, data }: { planId: number; data: CreateMealPlanItemRequest }) =>
      mealPlansApi.addItem(planId, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: mealPlanKeys.all });
      qc.invalidateQueries({ queryKey: mealPlanKeys.detail(vars.planId) });
    },
  });
}

export function useDeleteMealPlanItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, itemId }: { planId: number; itemId: number }) =>
      mealPlansApi.deleteItem(planId, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: mealPlanKeys.all }),
  });
}