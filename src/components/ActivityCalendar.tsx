import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

import { useCalendar } from '../hooks/useStats';



// ============================================================
// Календарь активности за неделю.
// Показывает 7 дней (Пн-Вс) текущей недели.
// 🟢 день с записью, ⚪ без, 🔵 сегодня.
// ============================================================
export default function ActivityCalendar() {
  const theme = useTheme();

  // Текущий месяц в формате YYYY-MM
  const month = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }, []);

  const calendarQuery = useCalendar(month);
  const [open, setOpen] = useState(false);

  // 7 дней текущей недели (Пн-Вс)
  const weekDays = useMemo(() => {
    const now = new Date();
    // getDay(): 0=Вс, 1=Пн, ...
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);

    const days: { date: Date; iso: string; label: string }[] = [];
    const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().slice(0, 10); // YYYY-MM-DD
      days.push({
        date: d,
        iso,
        label: labels[i],
      });
    }
    return days;
  }, []);

  const activeDays = useMemo(
    () => new Set(calendarQuery.data?.days ?? []),
    [calendarQuery.data],
  );

  const todayIso = useMemo(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }, []);

  const getDayColor = (iso: string) => {
    if (iso === todayIso) return theme.palette.primary.main;   // сегодня
    if (activeDays.has(iso)) return theme.palette.success.main; // запись есть
    return theme.palette.action.disabledBackground;             // нет записи
  };

  const getDayTextColor = (iso: string) => {
    if (iso === todayIso || activeDays.has(iso)) return '#fff';
    return theme.palette.text.secondary;
  };

    const streak = calendarQuery.data?.currentStreak ?? 0;

    return (
      <>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
          {weekDays.map((day) => {
            const dayNumber = day.date.getDate();
            const isToday = day.iso === todayIso;

            return (
              <Stack
                key={day.iso}
                spacing={0.5}
                sx={{ alignItems: 'center', flex: 1 }}
              >
                <Typography variant="caption" color="text.secondary">
                  {day.label}
                </Typography>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: getDayColor(day.iso),
                    color: getDayTextColor(day.iso),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: isToday ? 700 : 500,
                    fontSize: '0.875rem',
                    transition: 'background-color 0.2s',
                  }}
                >
                  {dayNumber}
                </Box>
              </Stack>
            );
          })}
        </Stack>

        {/* Кнопка + модалка */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="text"
            size="small"
            onClick={() => setOpen(true)}
            sx={{ textTransform: 'none' }}
          >
            Смотри, сколько ты в режиме →
          </Button>
        </Box>

        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: 'center' }}>
            Ты в режиме
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
              {streak}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {streak === 1 ? 'день подряд' :
               streak < 5 ? 'дня подряд' :
               'дней подряд'}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Молодец. Давай ещё один?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button onClick={() => setOpen(false)} variant="contained">
              Хорошо
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }