import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ingredientsApi } from '../api/ingredients';
import type { IngredientRequest } from '../types/api';

// ============================================================
// Ключи кеша TanStack Query.
// Централизованно, чтобы легко инвалидировать.
// ============================================================
export const ingredientsKeys = {
  all: ['ingredients'] as const,
  my: () => [...ingredientsKeys.all, 'my'] as const,
  base: () => [...ingredientsKeys.all, 'base'] as const,
  searchBase: (q: string) =>
    [...ingredientsKeys.all, 'base', 'search', q] as const,
};

// ---------- Мои ингредиенты ----------
export function useMyIngredients() {
  return useQuery({
    queryKey: ingredientsKeys.my(),
    queryFn: async () => (await ingredientsApi.list()).data,
  });
}

// ---------- Базовые ингредиенты ----------
export function useBaseIngredients() {
  return useQuery({
    queryKey: ingredientsKeys.base(),
    queryFn: async () => (await ingredientsApi.listBase()).data,
  });
}

// ---------- Поиск базовых ----------
export function useSearchBaseIngredients(query: string) {
  return useQuery({
    queryKey: ingredientsKeys.searchBase(query),
    queryFn: async () => (await ingredientsApi.searchBase(query)).data,
    enabled: query.trim().length > 0, // не ищем по пустой строке
  });
}

// ---------- Создание ----------
export function useCreateIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IngredientRequest) => ingredientsApi.create(data),
    onSuccess: () => {
      // После создания обновляем список «мои»
      queryClient.invalidateQueries({ queryKey: ingredientsKeys.my() });
    },
  });
}

// ---------- Обновление ----------
export function useUpdateIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IngredientRequest }) =>
      ingredientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ingredientsKeys.my() });
    },
  });
}

// ---------- Удаление ----------
export function useDeleteIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ingredientsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ingredientsKeys.my() });
    },
  });
}