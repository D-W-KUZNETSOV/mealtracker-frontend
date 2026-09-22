// ============================================================
// Утилита: превращает относительный URL картинки в полный.
// Бэк отдаёт "/images/uuid.jpg", а <img> хочет "http://localhost:8080/images/..."
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

/**
 * Возвращает полный URL для картинки.
 * - null / undefined / '' → null
 * - уже абсолютный (http/https) → как есть
 * - относительный (/images/...) → с префиксом API_BASE_URL
 */
export function getImageFullUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  // На случай, если бэк вернёт без ведущего слэша
  const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return `${API_BASE_URL}${path}`;
}