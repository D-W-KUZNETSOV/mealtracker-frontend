import { apiClient } from './client';
import type { ImageUploadResponse } from '../types/api';

// ============================================================
// Модуль API для загрузки картинок.
// Бэк: POST /api/images (multipart/form-data, поле "file")
// Ответ: { imageUrl: "/images/uuid.jpg" } (относительный URL)
// ============================================================
export const imagesApi = {
  /**
   * Загрузить картинку.
   * @param file — File из <input type="file">
   */
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

   return apiClient.post<ImageUploadResponse>('/api/images/upload', formData);
  },
};