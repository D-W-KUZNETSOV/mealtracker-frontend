import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import UserAvatar from '../components/UserAvatar';
import ImageUpload from '../components/ImageUpload';
import {
  useDailyCalories,
  useProfile,
  useUpdateProfile,
} from '../hooks/useProfile';
import type {
  ActivityLevel,
  ApiError,
  Gender,
  ProfileUpdateRequest,
} from '../types/api';
import InfoTooltip, { tooltips } from '../components/InfoTooltip';

// ============================================================
// Схема валидации
// ============================================================
const profileSchema = z.object({
  avatarUrl: z.string().optional(),
  dateOfBirth: z.string().optional(),
  heightCm: z
    .number({ message: 'Введите число' })
    .min(50, 'Минимум 50 см')
    .max(250, 'Максимум 250 см'),
  currentWeightKg: z
    .number({ message: 'Введите число' })
    .min(20, 'Минимум 20 кг')
    .max(300, 'Максимум 300 кг'),
  targetWeightKg: z
    .number({ message: 'Введите число' })
    .min(20, 'Минимум 20 кг')
    .max(300, 'Максимум 300 кг'),
  gender: z.enum(['MALE', 'FEMALE']),
  activityLevel: z.enum([
    'SEDENTARY',
    'LIGHT',
    'MODERATE',
    'HIGH',
    'VERY_HIGH',
  ]),
});

type ProfileForm = z.infer<typeof profileSchema>;

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  SEDENTARY: 'Сидячий образ жизни',
  LIGHT: 'Лёгкая активность (1–2 раза в неделю)',
  MODERATE: 'Умеренная активность (3–4 раза в неделю)',
  HIGH: 'Высокая активность (5–6 раз в неделю)',
  VERY_HIGH: 'Очень высокая (ежедневно / физическая работа)',
};

const GENDER_LABELS: Record<Gender, string> = {
  MALE: 'Мужской',
  FEMALE: 'Женский',
};

export default function ProfilePage() {
  const { enqueueSnackbar } = useSnackbar();
  const user = useAuthStore((s) => s.user);

  const profileQuery = useProfile();
  const dailyCaloriesQuery = useDailyCalories();
  const updateMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      avatarUrl: '',
      dateOfBirth: '',
      heightCm: 170,
      currentWeightKg: 70,
      targetWeightKg: 70,
      gender: 'MALE',
      activityLevel: 'MODERATE',
    },
  });

  // Заполняем форму, когда приходит профиль
  useEffect(() => {
    if (profileQuery.data) {
      const p = profileQuery.data;
      reset({
        avatarUrl: p.avatarUrl ?? '',
        dateOfBirth: '',
        heightCm: p.heightCm ?? 170,
        currentWeightKg: p.currentWeightKg ?? 70,
        targetWeightKg: p.targetWeightKg ?? 70,
        gender: p.gender ?? 'MALE',
        activityLevel: p.activityLevel ?? 'MODERATE',
      });
    }
  }, [profileQuery.data, reset]);

  const onSubmit = async (data: ProfileForm) => {
    try {
      const payload: ProfileUpdateRequest = {
        avatarUrl: data.avatarUrl || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        heightCm: data.heightCm,
        currentWeightKg: data.currentWeightKg,
        targetWeightKg: data.targetWeightKg,
        gender: data.gender,
        activityLevel: data.activityLevel,
      };
      await updateMutation.mutateAsync(payload);
      // Обновляем user в authStore, чтобы шапка (Layout) увидела новый avatarUrl
      await useAuthStore.getState().fetchMe();
      enqueueSnackbar('Профиль обновлён', { variant: 'success' });
    } catch (err) {
      const apiError = err as ApiError;
      enqueueSnackbar(apiError.message || 'Ошибка сохранения', {
        variant: 'error',
      });
    }
  };

  if (profileQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <Alert severity="error">
        Ошибка загрузки:{' '}
        {(profileQuery.error as unknown as ApiError)?.message ??
          'Профиль не заполнен'}
      </Alert>
    );
  }

  const profile = profileQuery.data;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Профиль
      </Typography>

      {/* ============ Аватар + имя ============ */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <UserAvatar
              username={user?.username ?? '?'}
              avatarUrl={profile.avatarUrl}
              size={64}
            />
            <Box>
              <Typography variant="h6">{user?.username}</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* ============ Сводка ============ */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Возраст
              </Typography>
              <Typography variant="h5">
                {profile.ageYears != null ? `${profile.ageYears} лет` : '—'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: 'center' }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  ИМТ (BMI)
                </Typography>
                <InfoTooltip title={tooltips.bmi} />
              </Stack>
              <Typography variant="h5">
                {profile.bmi != null ? profile.bmi.toFixed(1) : '—'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Дневная норма
              </Typography>
              <Typography variant="h5">
                {dailyCaloriesQuery.data != null
                  ? `${dailyCaloriesQuery.data} ккал`
                  : '—'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ============ Форма ============ */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Редактировать профиль
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Controller
                name="avatarUrl"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value || null}
                    onChange={(url) => field.onChange(url ?? '')}
                    label="Аватар"
                  />
                )}
              />

              <TextField
                label="Дата рождения"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                {...register('dateOfBirth')}
                helperText="Формат: ГГГГ-ММ-ДД"
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Рост, см"
                    type="number"
                    fullWidth
                    slotProps={{ htmlInput: { step: '1', min: 50, max: 250 } }}
                    {...register('heightCm', { valueAsNumber: true })}
                    error={!!errors.heightCm}
                    helperText={errors.heightCm?.message}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Текущий вес, кг"
                    type="number"
                    fullWidth
                    slotProps={{ htmlInput: { step: '0.1', min: 20, max: 300 } }}
                    {...register('currentWeightKg', { valueAsNumber: true })}
                    error={!!errors.currentWeightKg}
                    helperText={errors.currentWeightKg?.message}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Целевой вес, кг"
                    type="number"
                    fullWidth
                    slotProps={{ htmlInput: { step: '0.1', min: 20, max: 300 } }}
                    {...register('targetWeightKg', { valueAsNumber: true })}
                    error={!!errors.targetWeightKg}
                    helperText={errors.targetWeightKg?.message}
                  />
                </Grid>
              </Grid>

              {/* Пол */}
              <FormControl>
                <FormLabel>Пол</FormLabel>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup row {...field}>
                      {(Object.keys(GENDER_LABELS) as Gender[]).map((g) => (
                        <FormControlLabel
                          key={g}
                          value={g}
                          control={<Radio />}
                          label={GENDER_LABELS[g]}
                        />
                      ))}
                    </RadioGroup>
                  )}
                />
              </FormControl>

              {/* Уровень активности */}
              <FormControl>
                <FormLabel>Уровень активности</FormLabel>
                <Controller
                  name="activityLevel"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map(
                        (level) => (
                          <FormControlLabel
                            key={level}
                            value={level}
                            control={<Radio />}
                            label={ACTIVITY_LABELS[level]}
                          />
                        ),
                      )}
                    </RadioGroup>
                  )}
                />
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                disabled={updateMutation.isPending}
                sx={{ alignSelf: 'flex-start' }}
              >
                {updateMutation.isPending
                  ? 'Сохранение...'
                  : 'Сохранить профиль'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}