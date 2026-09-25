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
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import UserAvatar from '../components/UserAvatar';
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

// ============================================================
// Схема валидации
// ============================================================
const profileSchema = z.object({
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
        dateOfBirth: '',
        heightCm: p.heightCm,
        currentWeightKg: p.currentWeightKg,
        targetWeightKg: p.targetWeightKg,
        gender: p.gender,
        activityLevel: p.activityLevel,
      });
    }
  }, [profileQuery.data, reset]);

  const onSubmit = async (data: ProfileForm) => {
    try {
      const payload: ProfileUpdateRequest = {
        dateOfBirth: data.dateOfBirth || undefined,
        heightCm: data.heightCm,
        currentWeightKg: data.currentWeightKg,
        targetWeightKg: data.targetWeightKg,
        gender: data.gender,
        activityLevel: data.activityLevel,
      };
      await updateMutation.mutateAsync(payload);
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
        Ошибка загрузки: {(profileQuery.error as unknown as ApiError)?.message}
      </Alert>
    );
  }

  const profile = profileQuery.data;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Профиль
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <UserAvatar
              username={user?.username ?? '?'}
              size={64}
            />
            <Box>
              <Typography variant="h6">{user?.username}</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Сводка */}
      <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Возраст
            </Typography>
            <Typography variant="h5">{profile.ageYears} лет</Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              ИМТ (BMI)
            </Typography>
            <Typography variant="h5">{profile.bmi.toFixed(1)}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
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
      </Stack>

      {/* Форма */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Редактировать профиль
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Дата рождения"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                {...register('dateOfBirth')}
                helperText="Формат: ГГГГ-ММ-ДД"
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Рост, см"
                  type="number"
                  fullWidth
                  slotProps={{ htmlInput: { step: '1', min: 50, max: 250 } }}
                  {...register('heightCm', { valueAsNumber: true })}
                  error={!!errors.heightCm}
                  helperText={errors.heightCm?.message}
                />
                <TextField
                  label="Текущий вес, кг"
                  type="number"
                  fullWidth
                  slotProps={{ htmlInput: { step: '0.1', min: 20, max: 300 } }}
                  {...register('currentWeightKg', { valueAsNumber: true })}
                  error={!!errors.currentWeightKg}
                  helperText={errors.currentWeightKg?.message}
                />
                <TextField
                  label="Целевой вес, кг"
                  type="number"
                  fullWidth
                  slotProps={{ htmlInput: { step: '0.1', min: 20, max: 300 } }}
                  {...register('targetWeightKg', { valueAsNumber: true })}
                  error={!!errors.targetWeightKg}
                  helperText={errors.targetWeightKg?.message}
                />
              </Stack>

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
              {/* TODO(backend): синхронизировать activityLevel между user_goals и user_profile */}
              <Alert severity="info" sx={{ mt: 1 }}>
                Уровень активности в профиле и целях — <b>независимые</b>. Меняйте его в обоих разделах отдельно.
              </Alert>
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