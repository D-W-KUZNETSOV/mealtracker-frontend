import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profile';
import type { ProfileUpdateRequest } from '../types/api';

// ============================================================
// Ключи кеша
// ============================================================
export const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
  dailyCalories: () => [...profileKeys.all, 'dailyCalories'] as const,
};

// ---------- Профиль ----------
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: async () => (await profileApi.getProfile()).data,
  });
}

// ---------- Дневная норма ккал ----------
export function useDailyCalories() {
  return useQuery({
    queryKey: profileKeys.dailyCalories(),
    queryFn: async () => (await profileApi.getDailyCalories()).data,
  });
}

// ---------- Обновить профиль ----------
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProfileUpdateRequest) => profileApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      // После изменения профиля может поменяться целевой белок
      queryClient.invalidateQueries({ queryKey: ['nutrition'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}