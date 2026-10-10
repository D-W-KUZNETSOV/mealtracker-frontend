import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { useMealPlans } from '../hooks/useMealPlans';
import { useCalendar } from '../hooks/useStats';

interface Props {
  isGoalsNotFound: boolean;
}

export default function MorningGreetingCard({ isGoalsNotFound }: Props) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  const today = (() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return { iso: `${y}-${m}-${d}`, month: `${y}-${m}` };
  })();

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const isMorning = hour >= 6 && hour < 12;
    if (!isMorning) return;
    const lastShown = localStorage.getItem('morning-greeting-shown');
    if (lastShown === today.iso) return;
    setVisible(true);
    localStorage.setItem('morning-greeting-shown', today.iso);
  }, [today.iso]);

  const plansQuery = useMealPlans();
  const calendarQuery = useCalendar(today.month);

  const todayPlan = plansQuery.data?.find(
    (p) => p.startDate <= today.iso && p.endDate >= today.iso,
  );
  const streak = calendarQuery.data?.currentStreak ?? 0;

  if (!visible) return null;

  // Сценарий 1 — нет цели
  if (isGoalsNotFound) {
    return (
      <Card sx={{ mb: 3, borderLeft: 4, borderColor: 'primary.main' }}>
        <CardContent>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
            <WbSunnyIcon color="warning" />
            <Typography variant="h6">Доброе утро</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Давай начнём с простого — поставим цель. Это поможет рассчитать
            норму калорий и белка.
          </Typography>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/goals')}
          >
            Поставить цель
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Сценарий 2 — есть план
  if (todayPlan && todayPlan.items?.length) {
    return (
      <Card sx={{ mb: 3, borderLeft: 4, borderColor: 'success.main' }}>
        <CardContent>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
            <WbSunnyIcon color="warning" />
            <Typography variant="h6">Доброе утро</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            План на сегодня готов.
          </Typography>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/plan')}
          >
            Открыть план
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Сценарий 3 — streak
  return (
    <Card sx={{ mb: 3, borderLeft: 4, borderColor: 'warning.main' }}>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
          <WbSunnyIcon color="warning" />
          <Typography variant="h6">Доброе утро</Typography>
        </Stack>
        {streak > 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            🔥 {streak} {streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'} подряд.
            Молодец. Давай ещё один?
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Начнём сегодня? С одного шага.
          </Typography>
        )}
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/diary')}
        >
          Записать завтрак
        </Button>
      </CardContent>
    </Card>
  );
}