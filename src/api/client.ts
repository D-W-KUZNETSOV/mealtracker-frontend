import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types/api';

// ============================================================
// Базовый URL бэкенда.
// Берём из переменной окружения Vite (VITE_API_URL), а если её нет —
// падаем на дефолт для локальной разработки.
// ============================================================
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

// ============================================================
// Ключ в localStorage, где храним JWT.
// Экспортируем, чтобы стор (zustand) использовал тот же ключ.
// ============================================================
export const TOKEN_STORAGE_KEY = 'mealtracker.token';

// ============================================================
// Основной экземпляр axios.
// ============================================================
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

// ============================================================
// REQUEST interceptor: подставляет JWT в каждый запрос.
// ============================================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ============================================================
// RESPONSE interceptor: централизованная обработка ошибок.
// ============================================================
apiClient.interceptors.response.use(
  // Успешный ответ — отдаём как есть.
  (response) => response,

  // Ошибка — разбираем формат ApiError от бэка.
  (error: AxiosError<ApiError>) => {
    // Если бэк вернул 401 — токен просрочен/невалиден.
    // Чистим localStorage, чтобы приложение "разлогинилось".
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      // Здесь позже можно дернуть редирект на /login через роутер.
    }

    // Приводим ошибку к нашему формату.
    const apiError: ApiError = error.response?.data ?? {
      timestamp: new Date().toISOString(),
      status: error.response?.status ?? 0,
      error: error.name,
      code: 'NETWORK_ERROR',
      message: error.message || 'Ошибка сети',
      path: error.config?.url ?? '',
    };

    return Promise.reject(apiError);
  },
);