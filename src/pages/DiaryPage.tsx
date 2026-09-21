import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import IconButton from '@mui/material/IconButton';

import { useStatsByDate, useTodayStats } from '../hooks/useStats';
import type { ApiError } from '../types/api';
import { roundNutrient } from '../types/api';
import AddPortionDialog from '../components/AddPortionDialog';

// Утилита: форматирует Date в YYYY-MM-DD (как ждёт бэк)
function toApiDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isToday(d: Date): boolean {
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function DiaryPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);

  const isTodaySelected = isToday(selectedDate);

  // Сегодня — отдельный хук, чтобы кеш не путался
  const todayQuery = useTodayStats();
  // Для выбранной даты
  const dateQuery = useStatsByDate(
    isTodaySelected ? null : toApiDate(selectedDate),
  );

  const currentQuery = isTodaySelected ? todayQuery : dateQuery;

  const stats = currentQuery.data ?? null;

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    // Не позволяем уйти в будущее
    if (d > new Date()) return;
    setSelectedDate(d);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const formattedDate = useMemo(() => {
    return selectedDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDate]);

  return (
    <Box>
     <Stack
       direction="row"
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
      }}
     >
        <Typography variant="h4">Дневник питания</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Добавить порцию
        </Button>
      </Stack>

      {/* Переключатель даты */}
      <Paper sx={{ p: 2, mb: 3 }}>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
          <IconButton onClick={handlePrevDay} title="Предыдущий день">
            <ChevronLeftIcon />
          </IconButton>

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Typography variant="h6">{formattedDate}</Typography>
            {!isTodaySelected && (
              <Button
                size="small"
                startIcon={<TodayIcon />}
                onClick={handleToday}
              >
                Сегодня
              </Button>
            )}
          </Stack>

          <IconButton
            onClick={handleNextDay}
            disabled={isTodaySelected}
            title="Следующий день"
          >
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      </Paper>

      {/* Загрузка / ошибки */}
      {currentQuery.isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {currentQuery.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Ошибка загрузки: {(currentQuery.error as ApiError)?.message}
        </Alert>
      )}

      {/* Сводка КБЖУ */}
      {stats && (
        <Card>
          <CardContent>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
            >
              Съедено за день
            </Typography>

            <Stack direction="row" spacing={4} sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h4">
                  {roundNutrient(stats.calories)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ккал
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4">
                  {roundNutrient(stats.proteins)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Белки, г
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4">
                  {roundNutrient(stats.fats)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Жиры, г
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4">
                  {roundNutrient(stats.carbs)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Углеводы, г
                </Typography>
              </Box>
            </Stack>

            {/* Прогресс по белку */}
            {stats.targetProtein != null &&
            stats.proteinProgressPercent != null ? (
              <Box>
              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  mb: 0.5,
                }}
              >
                  <Typography variant="body2">
                    Белок: {roundNutrient(stats.proteins)} /{' '}
                    {roundNutrient(stats.targetProtein)} г
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {roundNutrient(stats.proteinProgressPercent)}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(stats.proteinProgressPercent, 100)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ) : (
              <Alert severity="info" sx={{ mt: 1 }}>
                Цель по белку не задана. Установите цели в разделе «Цели».
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {!currentQuery.isLoading && !stats && !currentQuery.isError && (
        <Alert severity="info">
          Нет данных за выбранный день. Добавьте порцию, чтобы начать.
        </Alert>
      )}

      {/* Модалка добавления порции */}
      <AddPortionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  );
}