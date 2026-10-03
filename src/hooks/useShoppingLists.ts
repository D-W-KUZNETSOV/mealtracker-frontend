import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shoppingApi } from '../api/shopping';
import type { GenerateShoppingListRequest } from '../types/api';

export const shoppingKeys = {
  all: ['shoppingLists'] as const,
  detail: (id: number) => [...shoppingKeys.all, 'detail', id] as const,
};

export function useShoppingLists() {
  return useQuery({
    queryKey: shoppingKeys.all,
    queryFn: async () => (await shoppingApi.getAll()).data,
  });
}

export function useShoppingList(id: number | null) {
  return useQuery({
    queryKey: shoppingKeys.detail(id ?? 0),
    queryFn: async () => (await shoppingApi.getById(id!)).data,
    enabled: !!id,
  });
}

export function useGenerateShoppingList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, data }: { planId: number; data?: GenerateShoppingListRequest }) =>
      shoppingApi.generate(planId, data ?? {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: shoppingKeys.all }),
  });
}

export function useToggleShoppingItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, itemId }: { listId: number; itemId: number }) =>
      shoppingApi.toggleItem(listId, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: shoppingKeys.all }),
  });
}

export function useArchiveShoppingList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => shoppingApi.archive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: shoppingKeys.all }),
  });
}

export function useDeleteShoppingList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => shoppingApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: shoppingKeys.all }),
  });
}

export function useRepeatShoppingList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => shoppingApi.repeat(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: shoppingKeys.all }),
  });
}
