import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  LocalDining as DiaryIcon,
  TrackChanges as GoalsIcon,
  Person as ProfileIcon,
  LocalFireDepartment as FireIcon,
  FitnessCenter as ProteinIcon,
  MonitorWeight as WeightIcon,
} from '@mui/icons-material';

import { useAuthStore } from '../store/authStore';
import { useTodayStats } from '../hooks/useStats';
import { useGoals } from '../hooks/useNutrition';
import { useProfile } from '../hooks/useProfile';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const statsQuery = useTodayStats();
  const goalsQuery = useGoals();
  const profileQuery = useProfile();

  const loading =
    statsQuery.isLoading || goalsQuery.isLoading || profileQuery.isLoading;

  // 404 от goals/profile — нормально (данные не заполнены), не считаем ошибкой
  const isGoalsNotFound =
    goalsQuery.isError &&
    (goalsQuery.error as { status?: number })?.status === 404;

  const isProfileNotFound =
    profileQuery.isError &&
    (profileQuery.error as { status?: number })?.status === 404;

  const error =
    statsQuery.isError ||
    (goalsQuery.isError && !isGoalsNotFound) ||
    (profileQuery.isError && !isProfileNotFound);

  const stats = statsQuery.data;
  const goals = goalsQuery.data;
  const profile = profileQuery.data;

  // Калории
  const calories = stats?.calories ?? 0;
  const targetCalories = goals?.targetCalories ?? 2000;
  const remaining = Math.max(0, targetCalories - calories);
  const caloriesPercent = Math.min(
    100,
    Math.round((calories / targetCalories) * 100),
  );

  // Белки
  const proteins = stats?.proteins ?? 0;
  const targetProtein = stats?.targetProtein ?? 0;
  const proteinPercent = stats?.proteinProgressPercent ?? 0;

  // Вес
  const currentWeight = goals?.currentWeightKg ?? profile?.currentWeightKg ?? 0;
  const targetWeight = profile?.targetWeightKg ?? 0;
  const bmi = profile?.bmi ?? 0;

  const today = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const getBmiLabel = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Недостаток', color: 'info' as const };
    if (bmi < 25) return { label: 'Норма', color: 'success' as const };
    if (bmi < 30) return { label: 'Избыток', color: 'warning' as const };
    return { label: 'Ожирение', color: 'error' as const };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Не удалось загрузить данные. Попробуйте обновить страницу.
      </Alert>
    );
  }

  return (
    <Box>
      {/* ============ Приветствие ============ */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Привет, {user?.username ?? 'друг'}! 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Сегодня {today}
        </Typography>
      </Box>

      {/* ============ Сетка карточек ============ */}
      <Grid container spacing={3}>
        {/* Калории */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                <FireIcon color="error" />
                <Typography variant="h6">Калории сегодня</Typography>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', mb: 1 }}>
                <Typography variant="h4" color="primary.main">
                  {Math.round(calories)}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  / {targetCalories} ккал
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={caloriesPercent}
                sx={{ height: 10, borderRadius: 1, mb: 1 }}
                color={caloriesPercent > 100 ? 'error' : 'primary'}
              />

              <Typography variant="body2" color="text.secondary">
                {caloriesPercent > 100
                  ? `Превышение на ${Math.round(calories - targetCalories)} ккал`
                  : `Осталось ${Math.round(remaining)} ккал`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Белки */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                <ProteinIcon color="success" />
                <Typography variant="h6">Белки</Typography>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', mb: 1 }}>
                <Typography variant="h4" color="success.main">
                  {Math.round(proteins)}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  / {targetProtein} г
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={Math.min(100, proteinPercent)}
                sx={{ height: 10, borderRadius: 1, mb: 1 }}
                color="success"
              />

              <Typography variant="body2" color="text.secondary">
                {Math.round(proteinPercent)}% от цели
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* БЖУ сегодня */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                БЖУ сегодня
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Белки
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {Math.round(proteins)} г
                  </Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Жиры
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {Math.round(stats?.fats ?? 0)} г
                  </Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Углеводы
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {Math.round(stats?.carbs ?? 0)} г
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Вес и цель */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                <WeightIcon color="info" />
                <Typography variant="h6">Вес и цель</Typography>
              </Stack>

              <Stack spacing={1.5}>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Текущий вес
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {currentWeight} кг
                  </Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Целевой вес
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {targetWeight} кг
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="body2" color="text.secondary">
                    ИМТ
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight={600}>
                      {bmi.toFixed(1)}
                    </Typography>
                    <Chip
                      size="small"
                      label={getBmiLabel(bmi).label}
                      color={getBmiLabel(bmi).color}
                    />
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Быстрые действия */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Быстрые действия
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<RestaurantIcon />}
                    onClick={() => navigate('/recipes')}
                  >
                    Рецепты
                  </Button>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DiaryIcon />}
                    onClick={() => navigate('/diary')}
                  >
                    Дневник
                  </Button>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GoalsIcon />}
                    onClick={() => navigate('/goals')}
                  >
                    Цели
                  </Button>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ProfileIcon />}
                    onClick={() => navigate('/profile')}
                  >
                    Профиль
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}