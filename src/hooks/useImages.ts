import { useMutation } from '@tanstack/react-query';
import { imagesApi } from '../api/images';
import type { ImageUploadResponse } from '../types/api';

// ============================================================
// Хук для загрузки картинок.
// Возвращает { mutateAsync, isPending, error } — как useMutation.
// После успеха: response.data = { imageUrl: "/images/uuid.jpg" }
// ============================================================
export function useImageUpload() {
  return useMutation<ImageUploadResponse, Error, File>({
    mutationFn: async (file: File) => {
      const response = await imagesApi.upload(file);
      return response.data;
    },
  });
}