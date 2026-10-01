import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { recipesApi } from '../api/recipes';
import type { RecipeRequest } from '../types/api';

// ============================================================
// Ключи кеша
// ============================================================
export const recipesKeys = {
  all: ['recipes'] as const,
  mine: (page: number, size: number) =>
    [...recipesKeys.all, 'mine', page, size] as const,
  public: () => [...recipesKeys.all, 'public'] as const,
  summary: (id: number) => [...recipesKeys.all, 'summary', id] as const,
  stats: (id: number) => [...recipesKeys.all, 'stats', id] as const,
};

// ---------- Мои рецепты (пагинация) ----------
export interface RecipeFilters {
  query?: string;
  minCalories?: number;
  maxCalories?: number;
  minProtein?: number;
  sort?: string;
}

export function useMyRecipes(
  page = 0,
  size = 10,
  filters: RecipeFilters = {},
) {
  return useQuery({
    queryKey: [...recipesKeys.mine(page, size), filters],
    queryFn: async () => (await recipesApi.listMine(page, size, filters)).data,
    placeholderData: keepPreviousData,
  });
}

// ---------- Публичные рецепты ----------
export function usePublicRecipes() {
  return useQuery({
    queryKey: recipesKeys.public(),
    queryFn: async () => (await recipesApi.listPublic()).data,
  });
}

// ---------- Детали рецепта ----------
export function useRecipeSummary(id: number | undefined) {
  return useQuery({
    queryKey: recipesKeys.summary(id ?? 0),
    queryFn: async () => (await recipesApi.getSummary(id!)).data,
    enabled: !!id,
  });
}

// ---------- Статистика ----------
export function useRecipeStats(id: number | undefined) {
  return useQuery({
    queryKey: recipesKeys.stats(id ?? 0),
    queryFn: async () => (await recipesApi.getStats(id!)).data,
    enabled: !!id,
  });
}

// ---------- Создание ----------
export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RecipeRequest) => recipesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipesKeys.all });
    },
  });
}

// ---------- Переключить видимость (toggle) ----------
export function useToggleRecipeVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => recipesApi.toggleVisibility(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: recipesKeys.all });
      queryClient.invalidateQueries({ queryKey: recipesKeys.summary(id) });
    },
  });
}

// ---------- Удаление ----------
export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => recipesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipesKeys.all });
    },
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RecipeRequest }) =>
      recipesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: recipesKeys.all });
      queryClient.invalidateQueries({ queryKey: recipesKeys.summary(id) });
    },
  });
}
