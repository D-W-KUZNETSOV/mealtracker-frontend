import { apiClient } from './client';
import type {
  Page,
  RecipeDto,
  RecipeListItemDto,
  RecipeRequest,
  RecipeStatsDto,
  RecipeSummaryDto,
} from '../types/api';

export const recipesApi = {
  listMine: (
    page = 0,
    size = 10,
    filters: {
      query?: string;
      category?: string;
      minCalories?: number;
      maxCalories?: number;
      minProtein?: number;
      sort?: string;
    } = {},
  ) =>
    apiClient.get<Page<RecipeListItemDto>>('/api/recipes', {
      params: {
        page,
        size,
        ...(filters.query && { query: filters.query }),
        ...(filters.category && { category: filters.category }),
        ...(filters.minCalories != null && { minCalories: filters.minCalories }),
        ...(filters.maxCalories != null && { maxCalories: filters.maxCalories }),
        ...(filters.minProtein != null && { minProtein: filters.minProtein }),
        ...(filters.sort && { sort: filters.sort }),
      },
    }),

  listPublic: () =>
    apiClient.get<RecipeListItemDto[]>('/api/recipes/public'),

  getSummary: (id: number) =>
    apiClient.get<RecipeSummaryDto>(`/api/recipes/${id}/summary`),

  getStats: (id: number) =>
    apiClient.get<RecipeStatsDto>(`/api/recipes/${id}/stats`),

  create: (data: RecipeRequest) =>
    apiClient.post<RecipeDto>('/api/recipes', data),

  update: (id: number, data: RecipeRequest) =>
    apiClient.put<RecipeDto>(`/api/recipes/${id}`, data),

  toggleVisibility: (id: number) =>
    apiClient.patch<RecipeDto>(`/api/recipes/${id}/visibility`),

  remove: (id: number) => apiClient.delete(`/api/recipes/${id}`),
};