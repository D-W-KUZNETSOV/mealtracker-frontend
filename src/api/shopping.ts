import { apiClient } from './client';
import type {
  ShoppingListDto,
  ShoppingListItemDto,
  GenerateShoppingListRequest,
} from '../types/api';

export const shoppingApi = {
  /** Активные списки */
  getAll: () => apiClient.get<ShoppingListDto[]>('/api/shopping-lists'),

  /** Список по ID */
  getById: (id: number) =>
    apiClient.get<ShoppingListDto>(`/api/shopping-lists/${id}`),

  /** Сгенерировать из плана */
  generate: (planId: number, data: GenerateShoppingListRequest = {}) =>
    apiClient.post<ShoppingListDto>(`/api/shopping-lists/generate/${planId}`, data),

  /** Toggle галочки */
  toggleItem: (listId: number, itemId: number) =>
    apiClient.put<ShoppingListItemDto>(`/api/shopping-lists/${listId}/items/${itemId}/toggle`),

  /** В архив */
  archive: (id: number) =>
    apiClient.post(`/api/shopping-lists/${id}/archive`),

  /** Удалить */
  delete: (id: number) =>
    apiClient.delete(`/api/shopping-lists/${id}`),

    repeat: (id: number) =>
      apiClient.post<ShoppingListDto>(`/api/shopping-lists/${id}/repeat`),
};