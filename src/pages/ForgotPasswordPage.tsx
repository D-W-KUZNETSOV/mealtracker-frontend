import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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

const forgotSchema = z.object({
  email: z.string().min(1, 'Введите email').email('Некорректный email'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotForm) => {
    setSubmitting(true);
    try {
      await authApi.forgotPassword({ email: data.email });
      setSent(true);
      enqueueSnackbar('Письмо отправлено', { variant: 'success' });
    } catch (err) {
      const apiError = err as ApiError;
      enqueueSnackbar(apiError.message || 'Ошибка отправки', {
        variant: 'error',
      });
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
            Забыли пароль?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Введите email, и мы отправим ссылку для сброса пароля.
          </Typography>

          {sent ? (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>
                Если такой email зарегистрирован — письмо со ссылкой уже
                отправлено. Проверьте папку «Спам».
              </Alert>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                fullWidth
              >
                Вернуться ко входу
              </Button>
            </>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  autoFocus
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={submitting}
                >
                  {submitting ? 'Отправка...' : 'Отправить ссылку'}
                </Button>
              </Stack>
            </form>
          )}

          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Вспомнили пароль?{' '}
            <Link component={RouterLink} to="/login">
              Войти
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}