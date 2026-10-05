import { apiClient } from './client';
import type { FeedbackRequest } from '../types/api';

// ============================================================
// Модуль API для обратной связи.
// ============================================================
export const feedbackApi = {
  /** Отправить фидбек (требует JWT) */
  send: (data: FeedbackRequest) =>
    apiClient.post<void>('/api/feedback', data),
};