import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { useCreateMealPlan } from '../hooks/useMealPlans';
import type { ApiError } from '../types/api';



interface Props {
  open: boolean;
  onClose: () => void;
}

function toApiDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

export default function CreateMealPlanDialog({ open, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const createMutation = useCreateMealPlan();

  const [name, setName] = useState('План на неделю');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (open) {
      const monday = getMonday(new Date());
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);

      setName('План на неделю');
      setStartDate(toApiDate(monday));
      setEndDate(toApiDate(sunday));
    }
  }, [open]);

  const canSubmit = name.trim().length > 0 && !!startDate && !!endDate;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        startDate,
        endDate,
      });
      enqueueSnackbar('План создан', { variant: 'success' });
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      enqueueSnackbar(apiError.message || 'Ошибка создания', {
        variant: 'error',
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Создать план меню</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Название"
            fullWidth
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Начало"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <TextField
            label="Конец"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={createMutation.isPending}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit || createMutation.isPending}
        >
          {createMutation.isPending ? 'Создание...' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}