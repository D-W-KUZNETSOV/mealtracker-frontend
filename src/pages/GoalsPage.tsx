
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

import { useGoals, useSaveGoals, useTargetProtein } from '../hooks/useNutrition';
import type {
  ActivityLevel,
  ApiError
} from '../types/api';

// ============================================================
// Схема валидации
// ============================================================
const goalsSchema = z.object({
  currentWeightKg: z
    .number({ message: 'Введите число' })
    .min(20, 'Минимум 20 кг')
    .max(300, 'Максимум 300 кг'),
  proteinPerKg: z
    .number({ message: 'Введите число' })
    .min(0.5, 'Минимум 0.5 г/кг')
    .max(5, 'Максимум 5 г/кг'),
  targetCalories: z
    .number({ message: 'Введите число' })
    .min(500, 'Минимум 500 ккал')
    .max(10000, 'Максимум 10000 ккал'),
  activityLevel: z.enum([
    'SEDENTARY',
    'LIGHT',
    'MODERATE',
    'HIGH',
    'VERY_HIGH',
  ]),
});

type GoalsForm = z.infer<typeof goalsSchema>;

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  SEDENTARY: 'Сидячий образ жизни',
  LIGHT: 'Лёгкая активность (1–2 раза в неделю)',
  MODERATE: 'Умеренная активность (3–4 раза в неделю)',
  HIGH: 'Высокая активность (5–6 раз в неделю)',
  VERY_HIGH: 'Очень высокая (ежедневно / физическая работа)',
};

export default function GoalsPage() {
  const { enqueueSnackbar } = useSnackbar();

  const goalsQuery = useGoals();
  const targetProteinQuery = useTargetProtein();
  const saveMutation = useSaveGoals();


  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<GoalsForm>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      currentWeightKg: 70,
      proteinPerKg: 1.6,
      targetCalories: 2000,
      activityLevel: 'MODERATE',
    },
  });

  // Заполняем форму, когда приходят текущие цели
  useEffect(() => {
    if (goalsQuery.data) {
     reset({
       currentWeightKg: goalsQuery.data.currentWeightKg ?? 70,
       proteinPerKg: goalsQuery.data.proteinPerKg ?? 1.6,
       targetCalories: goalsQuery.data.targetCalories ?? 2000,
       activityLevel: goalsQuery.data.activityLevel ?? 'MODERATE',
     });
    }
  }, [goalsQuery.data, reset]);

  const onSubmit = async (data: GoalsForm) => {

    try {
      await saveMutation.mutateAsync(data);
      enqueueSnackbar('Цели сохранены', { variant: 'success' });
    } catch (err) {
      const apiError = err as ApiError;
      enqueueSnackbar(apiError.message || 'Ошибка сохранения', {
        variant: 'error',
      });
    }
  };

  if (goalsQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

 const goalsError = goalsQuery.error as ApiError | null;
 // 404 = целей ещё нет (новый пользователь) — это не ошибка
 const isGoalsMissing = goalsError?.status === 404;

 if (goalsQuery.isError && !isGoalsMissing) {
   return (
     <Alert severity="error">
       Ошибка загрузки целей: {goalsError?.message}
     </Alert>
   );
 }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Цели КБЖУ
      </Typography>

      <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Текущий вес
            </Typography>
            <Typography variant="h5">
              {goalsQuery.data?.currentWeightKg ?? '—'} кг
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Целевой белок
            </Typography>
            <Typography variant="h5">
              {targetProteinQuery.data
                ? `${targetProteinQuery.data.targetProteinGramsPerDay.toFixed(1)} г/день`
                : '—'}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Дата обновления
            </Typography>
            <Typography variant="body1">
              {goalsQuery.data?.createdAt
                ? new Date(goalsQuery.data.createdAt).toLocaleDateString('ru-RU')
                : '—'}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Настройки целей
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3} sx={{ mt: 2 }}>
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
                label="Белок на кг веса, г"
                type="number"
                fullWidth
                slotProps={{ htmlInput: { step: '0.1', min: 0.5, max: 5 } }}
                {...register('proteinPerKg', { valueAsNumber: true })}
                error={!!errors.proteinPerKg}
                helperText={
                  errors.proteinPerKg?.message ||
                  'Обычно 1.6–2.2 г/кг для активных людей'
                }
              />

              <TextField
                label="Целевые калории, ккал/день"
                type="number"
                slotProps={{ htmlInput: { step: '1', min: 500, max: 10000 } }}
                {...register('targetCalories', { valueAsNumber: true })}
                error={!!errors.targetCalories}
                helperText={errors.targetCalories?.message}
              />

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
                disabled={saveMutation.isPending}
                sx={{ alignSelf: 'flex-start' }}
              >
                {saveMutation.isPending ? 'Сохранение...' : 'Сохранить цели'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}