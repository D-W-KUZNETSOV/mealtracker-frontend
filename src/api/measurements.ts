import { apiClient } from './client';
import type {
  BodyMeasurementDto,
  CreateBodyMeasurementRequest,
} from '../types/api';

// ============================================================
// Модуль API для замеров тела.
// ============================================================
export const measurementsApi = {
  /** Все замеры текущего пользователя */
  list: () =>
    apiClient.get<BodyMeasurementDto[]>('/api/measurements'),

  /** Добавить новый замер */
  create: (data: CreateBodyMeasurementRequest) =>
    apiClient.post<BodyMeasurementDto>('/api/measurements', data),

  /** Удалить замер */
  remove: (id: number) =>
    apiClient.delete<void>(`/api/measurements/${id}`),
};