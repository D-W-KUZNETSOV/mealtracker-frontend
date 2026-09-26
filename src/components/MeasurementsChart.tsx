import { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { BodyMeasurementDto } from '../types/api';

interface MeasurementsChartProps {
  measurements: BodyMeasurementDto[];
}

// ============================================================
// Графики прогресса замеров.
// ============================================================
export default function MeasurementsChart({
  measurements,
}: MeasurementsChartProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Сортируем по дате (от старых к новым) — для графика
  const sorted = useMemo(
    () =>
      [...measurements].sort(
        (a, b) =>
          new Date(a.measuredAt).getTime() -
          new Date(b.measuredAt).getTime(),
      ),
    [measurements],
  );

  // Данные для графика веса
  const weightData = useMemo(
    () =>
      sorted
        .filter((m) => m.weightKg != null)
        .map((m) => ({
          date: new Date(m.measuredAt).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
          }),
          fullDate: new Date(m.measuredAt).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          weight: m.weightKg,
        })),
    [sorted],
  );

  // Данные для графика обхватов
  const circumferenceData = useMemo(
    () =>
      sorted
        .filter(
          (m) =>
            m.waistCm != null ||
            m.bellyCm != null ||
            m.chestCm != null ||
            m.hipsCm != null,
        )
        .map((m) => ({
          date: new Date(m.measuredAt).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
          }),
          fullDate: new Date(m.measuredAt).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          waist: m.waistCm,
          belly: m.bellyCm,
          chest: m.chestCm,
          hips: m.hipsCm,
        })),
    [sorted],
  );

  // Прогресс веса (разница)
  const weightProgress = useMemo(() => {
    if (weightData.length < 2) return null;
    const first = weightData[0].weight ?? 0;
    const last = weightData[weightData.length - 1].weight ?? 0;
    return {
      diff: last - first,
      from: first,
      to: last,
    };
  }, [weightData]);

  if (measurements.length === 0) {
    return null;
  }

  return (
    <Stack spacing={3} sx={{ mb: 3 }}>
      {/* ============ График веса ============ */}
      {weightData.length > 0 && (
        <Card>
          <CardContent>
            <Stack
              direction="row"
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Typography variant="h6">Вес</Typography>
              {weightProgress && (
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      weightProgress.diff < 0
                        ? 'success.main'
                        : weightProgress.diff > 0
                          ? 'error.main'
                          : 'text.secondary',
                    fontWeight: 600,
                  }}
                >
                  {weightProgress.diff > 0 ? '+' : ''}
                  {weightProgress.diff.toFixed(1)} кг с начала
                </Typography>
              )}
            </Stack>

            <Box sx={{ width: '100%', height: isMobile ? 180 : 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis
                    fontSize={12}
                    domain={['dataMin - 2', 'dataMax + 2']}
                    unit=" кг"
                  />
                  <Tooltip
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.fullDate;
                      }
                      return label;
                    }}
                    formatter={(value) => [`${value} кг`, 'Вес']}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#4CAF50"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* ============ График обхватов ============ */}
      {circumferenceData.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Обхваты
            </Typography>

           <Box sx={{ width: '100%', height: isMobile ? 200 : 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={circumferenceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} unit=" см" />
                  <Tooltip
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.fullDate;
                      }
                      return label;
                    }}
                    formatter={(value, name) => {
                      const labels: Record<string, string> = {
                        waist: 'Талия',
                        belly: 'Живот',
                        chest: 'Грудь',
                        hips: 'Бёдра',
                      };
                      return [`${value} см`, labels[name as string] || name];
                    }}
                  />
                  <Legend
                    formatter={(value) => {
                      const labels: Record<string, string> = {
                        waist: 'Талия',
                        belly: 'Живот',
                        chest: 'Грудь',
                        hips: 'Бёдра',
                      };
                      return labels[value] || value;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="waist"
                    stroke="#FF9800"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="belly"
                    stroke="#F44336"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="chest"
                    stroke="#2196F3"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="hips"
                    stroke="#9C27B0"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}