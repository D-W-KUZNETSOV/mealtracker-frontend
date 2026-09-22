import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export const TOKEN_STORAGE_KEY = 'mealtracker.token';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

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

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    const backendData = error.response?.data;

    const isBackendApiError =
      backendData != null &&
      typeof backendData === 'object' &&
      'status' in backendData &&
      'code' in backendData;

    const apiError: ApiError = isBackendApiError
      ? (backendData as ApiError)
      : {
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