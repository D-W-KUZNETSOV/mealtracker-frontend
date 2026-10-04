import { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { authApi } from '../api/auth';
import type { ApiError } from '../types/api';

const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, 'Минимум 6 символов')
      .max(100, 'Максимум 100 символов'),
    confirmPassword: z.string().min(1, 'Подтвердите пароль'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const [submitting, setSubmitting] = useState(false);

  const token = searchParams.get('token') ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  // Если токена нет — не показываем форму
  if (!token) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Card sx={{ maxWidth: 400, width: '100%' }}>
          <CardContent>
            <Alert severity="error" sx={{ mb: 2 }}>
              Ссылка недействительна: отсутствует токен. Запросите новую ссылку
              для сброса пароля.
            </Alert>
            <Button
              component={RouterLink}
              to="/forgot-password"
              variant="contained"
              fullWidth
            >
              Запросить новую ссылку
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const onSubmit = async (data: ResetForm) => {
    setSubmitting(true);
    try {
      await authApi.resetPassword({
        token,
        newPassword: data.newPassword,
      });
      enqueueSnackbar('Пароль изменён. Войдите с новым паролем.', {
        variant: 'success',
      });
      navigate('/login', { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      enqueueSnackbar(
        apiError.message || 'Ошибка сброса пароля. Возможно, ссылка истекла.',
        { variant: 'error' },
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Новый пароль
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Придумайте новый пароль для входа.
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <TextField
                label="Новый пароль"
                type="password"
                fullWidth
                autoFocus
                {...register('newPassword')}
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
              />
              <TextField
                label="Подтвердите пароль"
                type="password"
                fullWidth
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={submitting}
              >
                {submitting ? 'Сохранение...' : 'Сохранить пароль'}
              </Button>
            </Stack>
          </form>

          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/login">
              Вернуться ко входу
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}