import { apiClient } from './client';
import type {
  MealPlanDto,
  MealPlanItemDto,
  CreateMealPlanRequest,
  CreateMealPlanItemRequest,
  ReplaceItemRequest,
} from '../types/api';

export const mealPlansApi = {
  /** Все планы */
  getAll: () => apiClient.get<MealPlanDto[]>('/api/meal-plans'),

  /** План по ID */
  getById: (id: number) =>
    apiClient.get<MealPlanDto>(`/api/meal-plans/${id}`),

  /** Создать план */
  create: (data: CreateMealPlanRequest) =>
    apiClient.post<MealPlanDto>('/api/meal-plans', data),

      /** Сгенерировать план */
      generate: (data: CreateMealPlanRequest) =>
        apiClient.post<MealPlanDto>('/api/meal-plans/generate', data),

  /** Обновить план */
  update: (id: number, data: CreateMealPlanRequest) =>
    apiClient.put<MealPlanDto>(`/api/meal-plans/${id}`, data),

  /** Удалить план */
  delete: (id: number) =>
    apiClient.delete(`/api/meal-plans/${id}`),

  /** Добавить приём */
  addItem: (planId: number, data: CreateMealPlanItemRequest) =>
    apiClient.post<MealPlanItemDto>(`/api/meal-plans/${planId}/items`, data),

  /** Удалить приём */
  deleteItem: (planId: number, itemId: number) =>
    apiClient.delete(`/api/meal-plans/${planId}/items/${itemId}`),

      /** Заменить блюдо в приёме */
      replaceItem: (planId: number, itemId: number, newRecipeId: number) =>
        apiClient.patch<MealPlanItemDto>(
          `/api/meal-plans/${planId}/items/${itemId}/replace`,
          { newRecipeId } as ReplaceItemRequest,
        ),
};