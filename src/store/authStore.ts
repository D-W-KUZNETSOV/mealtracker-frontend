import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient, TOKEN_STORAGE_KEY } from '../api/client';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from '../types/api';

// ============================================================
// Форма стора
// ============================================================
interface AuthState {
  token: string | null;
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

// ============================================================
// Стор
// ============================================================
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (data) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post<AuthResponse>(
            '/api/auth/login',
            data,
          );
          const { token, username } = response.data;

          localStorage.setItem(TOKEN_STORAGE_KEY, token);

          set({
            token,
            user: { id: 0, username, email: '', role: 'USER', avatarUrl: null },
            isAuthenticated: true,
            isLoading: false,
          });

          await get().fetchMe();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post<AuthResponse>(
            '/api/auth/register',
            data,
          );
          const { token, username } = response.data;

          localStorage.setItem(TOKEN_STORAGE_KEY, token);

          set({
            token,
           user: { id: 0, username, email: '', role: 'USER', avatarUrl: null },
            isAuthenticated: true,
            isLoading: false,
          });

          await get().fetchMe();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        set({ token: null, user: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const response = await apiClient.get<UserResponse>('/api/auth/me');
          set({ user: response.data, isAuthenticated: true });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'mealtracker.auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);