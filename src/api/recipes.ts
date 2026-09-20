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
  listMine: (page = 0, size = 10) =>
    apiClient.get<Page<RecipeListItemDto>>('/api/recipes', {
      params: { page, size },
    }),

  listPublic: () =>
    apiClient.get<RecipeListItemDto[]>('/api/recipes/public'),

  getSummary: (id: number) =>
    apiClient.get<RecipeSummaryDto>(`/api/recipes/${id}/summary`),

  getStats: (id: number) =>
    apiClient.get<RecipeStatsDto>(`/api/recipes/${id}/stats`),

  create: (data: RecipeRequest) =>
    apiClient.post<RecipeDto>('/api/recipes', data),

  toggleVisibility: (id: number) =>
    apiClient.patch<RecipeDto>(`/api/recipes/${id}/visibility`),

  remove: (id: number) => apiClient.delete(`/api/recipes/${id}`),
};