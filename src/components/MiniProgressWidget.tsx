import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from 'recharts';

import { useMeasurements } from '../hooks/useMeasurements';

// ============================================================
// Мини-виджет прогресса веса для дашборда.
// Показывает последние 7 замеров веса + разницу.
// ============================================================
export default function MiniProgressWidget() {
  const navigate = useNavigate();
  const measurementsQuery = useMeasurements();

  // Последние 7 замеров с весом (от старых к новым)
  const weightData = useMemo(() => {
    const all = measurementsQuery.data ?? [];
    const withWeight = all
      .filter((m) => m.weightKg != null)
      .sort(
        (a, b) =>
          new Date(a.measuredAt).getTime() -
          new Date(b.measuredAt).getTime(),
      );

    const last7 = withWeight.slice(-7);

    return last7.map((m) => ({
      date: new Date(m.measuredAt).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
      }),
      weight: m.weightKg,
    }));
  }, [measurementsQuery.data]);

  // Разница: последний - первый (в последних 7)
  const diff = useMemo(() => {
    if (weightData.length < 2) return null;
    const first = weightData[0].weight ?? 0;
    const last = weightData[weightData.length - 1].weight ?? 0;
    return last - first;
  }, [weightData]);

  if (measurementsQuery.isLoading) {
    return null;   // тихо скрываем, пока грузится
  }

  // Нет замеров с весом — показываем CTA
  if (weightData.length === 0) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction="row"
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6">Прогресс веса</Typography>
              <Typography variant="body2" color="text.secondary">
                Добавь первый замер, чтобы видеть прогресс
              </Typography>
            </Box>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/measurements')}
            >
              Добавить замер
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Иконка тренда
  const TrendIcon =
    diff == null || Math.abs(diff) < 0.1
      ? TrendingFlatIcon
      : diff < 0
        ? TrendingDownIcon
        : TrendingUpIcon;

  const trendColor =
    diff == null || Math.abs(diff) < 0.1
      ? 'text.secondary'
      : diff < 0
        ? 'success.main'
        : 'error.main';

  return (
    <Card
      sx={{
        mb: 3,
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 4 },
      }}
      onClick={() => navigate('/measurements')}
    >
      <CardContent>
        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box>
            <Typography variant="h6">Прогресс веса</Typography>
            <Typography variant="caption" color="text.secondary">
              Последние {weightData.length} {getMeasurementWord(weightData.length)}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {diff != null && (
              <>
                <TrendIcon sx={{ color: trendColor, fontSize: 20 }} />
                <Typography
                  variant="h6"
                  sx={{ color: trendColor, fontWeight: 600 }}
                >
                  {diff > 0 ? '+' : ''}
                  {diff.toFixed(1)} кг
                </Typography>
              </>
            )}
          </Stack>
        </Stack>

        <Box sx={{ width: '100%', height: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData}>
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                hide
              />
              <Tooltip
                formatter={(value) => [`${value} кг`, 'Вес']}
                labelFormatter={(label) => `Дата: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#4CAF50"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {weightData[0].date} → {weightData[weightData.length - 1].date}
          </Typography>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: 'center', color: 'primary.main' }}
          >
            <Typography variant="caption">Подробнее</Typography>
            <ArrowForwardIcon sx={{ fontSize: 14 }} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
// ============================================================
// Склонение слова «замер»
// ============================================================
function getMeasurementWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'замер';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'замера';
  return 'замеров';
}