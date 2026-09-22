import { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';

import { useImageUpload } from '../hooks/useImages';
import { getImageFullUrl } from '../utils/imageUrl';
import type { ApiError } from '../types/api';

interface ImageUploadProps {
  /** Текущий URL картинки (относительный) — из бэка */
  value: string | null;
  /** Колбэк при успешной загрузке — получает относительный URL */
  onChange: (imageUrl: string | null) => void;
  /** Подпись кнопки */
  label?: string;
  /** Максимальная высота превью */
  previewMaxHeight?: number;
}

// ============================================================
// Компонент загрузки картинки (JPG/PNG).
// Показывает превью, кнопку «Загрузить» и «Удалить».
// ============================================================
export default function ImageUpload({
  value,
  onChange,
  label = 'Загрузить изображение',
  previewMaxHeight = 240,
}: ImageUploadProps) {
  const { enqueueSnackbar } = useSnackbar();
  const uploadMutation = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const fullUrl = getImageFullUrl(value);

  const handleChooseFile = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    // Сброс input, чтобы повторный выбор того же файла сработал
    e.target.value = '';

    if (!file) return;

    // Проверка типа на фронте (JPG/PNG)
    const okTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!okTypes.includes(file.type)) {
      setError('Поддерживаются только JPG и PNG');
      return;
    }

    // Проверка размера (макс 5 МБ — на всякий случай; бэк может ограничивать меньше)
    if (file.size > 5 * 1024 * 1024) {
      setError('Файл слишком большой (макс 5 МБ)');
      return;
    }

    try {
      const result = await uploadMutation.mutateAsync(file);
      onChange(result.imageUrl);
      enqueueSnackbar('Изображение загружено', { variant: 'success' });
    } catch (err) {
      const apiError = err as ApiError;
      const message = apiError?.message || 'Ошибка загрузки изображения';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
  };

  return (
    <Stack spacing={2}>
      {fullUrl ? (
        <Box
          sx={{
            position: 'relative',
            display: 'inline-block',
            maxWidth: '100%',
          }}
        >
          <Box
            component="img"
            src={fullUrl}
            alt="Изображение"
            sx={{
              maxWidth: '100%',
              maxHeight: previewMaxHeight,
              borderRadius: 1,
              display: 'block',
            }}
          />
          <Button
            size="small"
            color="error"
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={handleRemove}
            sx={{ mt: 1 }}
          >
            Удалить
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 1,
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Нет изображения
          </Typography>
          <Button
            variant="outlined"
            startIcon={
              uploadMutation.isPending ? (
                <CircularProgress size={16} />
              ) : (
                <CloudUploadIcon />
              )
            }
            onClick={handleChooseFile}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Загрузка...' : label}
          </Button>
        </Box>
      )}

      {/* Скрытый input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {error && <Alert severity="error">{error}</Alert>}
    </Stack>
  );
}