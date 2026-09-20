import { apiClient } from './client';
import type { IngredientDto, IngredientRequest } from '../types/api';

// ============================================================
// Модуль API для ингредиентов.
// Все методы возвращают Promise от axios-ответа,
// но мы обычно берём .data в хуках.
// ============================================================
export const ingredientsApi = {
  /** Мои ингредиенты */
  list: () => apiClient.get<IngredientDto[]>('/api/ingredients'),

  /** Базовые (системные) ингредиенты */
  listBase: () => apiClient.get<IngredientDto[]>('/api/ingredients/base'),

  /** Поиск по базовым (позже уточним имя параметра) */
  searchBase: (query: string) =>
    apiClient.get<IngredientDto[]>('/api/ingredients/base/search', {
      params: { query },
    }),

  /** Создать ингредиент */
  create: (data: IngredientRequest) =>
    apiClient.post<IngredientDto>('/api/ingredients', data),

  /** Обновить ингредиент */
  update: (id: number, data: IngredientRequest) =>
    apiClient.put<IngredientDto>(`/api/ingredients/${id}`, data),

  /** Удалить ингредиент */
  remove: (id: number) => apiClient.delete(`/api/ingredients/${id}`),
};