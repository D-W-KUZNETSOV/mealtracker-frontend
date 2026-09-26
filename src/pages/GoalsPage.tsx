import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
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

import {
  useGoals,
  useSaveGoals,
  useTargetProtein,
} from '../hooks/useNutrition';
import type {
  ActivityLevel,
  ApiError,
  GoalType,
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
  goalType: z.enum(['LOSE_WEIGHT', 'MAINTAIN', 'GAIN_MUSCLE']),
  targetProteinOverride: z.number().nullable(),
  targetCaloriesOverride: z.number().nullable(),
});

type GoalsForm = z.infer<typeof goalsSchema>;

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  SEDENTARY: 'Сидячий образ жизни',
  LIGHT: 'Лёгкая активность (1–2 раза в неделю)',
  MODERATE: 'Умеренная активность (3–4 раза в неделю)',
  HIGH: 'Высокая активность (5–6 раз в неделю)',
  VERY_HIGH: 'Очень высокая (ежедневно / физическая работа)',
};

const GOAL_LABELS: Record<GoalType, string> = {
  LOSE_WEIGHT: 'Похудеть',
  MAINTAIN: 'Поддерживать',
  GAIN_MUSCLE: 'Набрать массу',
};

export default function GoalsPage() {
  const { enqueueSnackbar } = useSnackbar();

  const goalsQuery = useGoals();
  const targetProteinQuery = useTargetProtein();
  const saveMutation = useSaveGoals();

  // Чекбоксы «авто/ручной» для калорий и белка
  const [autoCalories, setAutoCalories] = useState(true);
  const [autoProtein, setAutoProtein] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<GoalsForm>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      currentWeightKg: 70,
      proteinPerKg: 1.6,
      targetCalories: 2000,
      activityLevel: 'MODERATE',
      goalType: 'MAINTAIN',
      targetProteinOverride: null,
      targetCaloriesOverride: null,
    },
  });

  // Заполняем форму, когда приходят текущие цели
  useEffect(() => {
    if (goalsQuery.data) {
      const g = goalsQuery.data;
      reset({
        currentWeightKg: g.currentWeightKg ?? 70,
        proteinPerKg: g.proteinPerKg ?? 1.6,
        targetCalories: g.targetCalories ?? 2000,
        activityLevel: g.activityLevel ?? 'MODERATE',
        goalType: g.goalType ?? 'MAINTAIN',
        targetProteinOverride: g.targetProteinOverride ?? null,
        targetCaloriesOverride: g.targetCaloriesOverride ?? null,
      });
      // Если override задан — значит, вручную
      setAutoProtein(g.targetProteinOverride == null);
      setAutoCalories(g.targetCaloriesOverride == null);
    }
  }, [goalsQuery.data, reset]);

  // Следим за формой, чтобы показывать правильные значения
  const goalType = watch('goalType');
  const currentWeight = watch('currentWeightKg');

  const onSubmit = async (data: GoalsForm) => {
    try {
      // Если авто — обнуляем override
      const payload = {
        ...data,
        targetProteinOverride: autoProtein ? null : data.targetProteinOverride,
        targetCaloriesOverride: autoCalories ? null : data.targetCaloriesOverride,
      };
      await saveMutation.mutateAsync(payload);
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

      {/* ============ Верхние карточки ============ */}
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

      {/* ============ Форма ============ */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Настройки целей
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3} sx={{ mt: 2 }}>
              {/* Вес */}
              <TextField
                label="Текущий вес, кг"
                type="number"
                fullWidth
                slotProps={{ htmlInput: { step: '0.1', min: 20, max: 300 } }}
                {...register('currentWeightKg', { valueAsNumber: true })}
                error={!!errors.currentWeightKg}
                helperText={errors.currentWeightKg?.message}
              />

              {/* Цель */}
              <FormControl>
                <FormLabel>Цель</FormLabel>
                <Controller
                  name="goalType"
                  control={control}
                  render={({ field }) => (
                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                      {(Object.keys(GOAL_LABELS) as GoalType[]).map((g) => (
                        <Chip
                          key={g}
                          label={GOAL_LABELS[g]}
                          color={field.value === g ? 'primary' : 'default'}
                          onClick={() => field.onChange(g)}
                          variant={field.value === g ? 'filled' : 'outlined'}
                        />
                      ))}
                    </Stack>
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

              {/* Калории */}
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={autoCalories}
                      onChange={(e) => setAutoCalories(e.target.checked)}
                    />
                  }
                  label="Рассчитать калории автоматически"
                />
                {autoCalories ? (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Калории рассчитываются по формуле Миффлина–Сан Жеора
                    с учётом вашего пола, возраста, роста, веса и активности.
                  </Alert>
                ) : (
                  <TextField
                    label="Целевые калории, ккал/день"
                    type="number"
                    fullWidth
                    sx={{ mt: 1 }}
                    slotProps={{ htmlInput: { step: '1', min: 500, max: 10000 } }}
                    {...register('targetCaloriesOverride', { valueAsNumber: true })}
                    error={!!errors.targetCaloriesOverride}
                    helperText={errors.targetCaloriesOverride?.message}
                  />
                )}
              </Box>

              {/* Белок */}
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={autoProtein}
                      onChange={(e) => setAutoProtein(e.target.checked)}
                    />
                  }
                  label="Рассчитать белок автоматически"
                />
                {autoProtein ? (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Белок рассчитывается по цели:{' '}
                    {goalType === 'LOSE_WEIGHT' && '2.0 г/кг (сохранить мышцы)'}
                    {goalType === 'MAINTAIN' && '1.6 г/кг (поддержание)'}
                    {goalType === 'GAIN_MUSCLE' && '1.8 г/кг (набор массы)'}
                    {' '}→ ~
                    {Math.round((currentWeight || 0) *
                      (goalType === 'LOSE_WEIGHT' ? 2.0 : goalType === 'GAIN_MUSCLE' ? 1.8 : 1.6))}{' '}
                    г/день
                  </Alert>
                ) : (
                  <TextField
                    label="Целевой белок, г/день"
                    type="number"
                    fullWidth
                    sx={{ mt: 1 }}
                    slotProps={{ htmlInput: { step: '1', min: 10, max: 500 } }}
                    {...register('targetProteinOverride', { valueAsNumber: true })}
                    error={!!errors.targetProteinOverride}
                    helperText={errors.targetProteinOverride?.message}
                  />
                )}
              </Box>

              {/* Старое поле proteinPerKg — оставляем скрытым для совместимости */}
              <input type="hidden" {...register('proteinPerKg', { valueAsNumber: true })} />
              <input type="hidden" {...register('targetCalories', { valueAsNumber: true })} />

              <Alert severity="info">
                Уровень активности в профиле и целях — <b>независимые</b>.
                Меняйте его в обоих разделах отдельно.
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