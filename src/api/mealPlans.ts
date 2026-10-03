import { apiClient } from './client';
import type {
  MealPlanDto,
  MealPlanItemDto,
  CreateMealPlanRequest,
  CreateMealPlanItemRequest,
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
};