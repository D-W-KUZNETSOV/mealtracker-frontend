import { useEffect, useState } from 'react';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Alert,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { useMealPlans } from '../hooks/useMealPlans';
import { useGenerateShoppingList } from '../hooks/useShoppingLists';
import type { ApiError, MealPlanDto } from '../types/api';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function GenerateShoppingListDialog({ open, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const plansQuery = useMealPlans();
  const generateMutation = useGenerateShoppingList();

  const [selectedPlan, setSelectedPlan] = useState<MealPlanDto | null>(null);
  const [periodStart, setPeriodStart] = useState<string>('');
  const [periodEnd, setPeriodEnd] = useState<string>('');

  useEffect(() => {
    if (open) {
      setSelectedPlan(null);
      setPeriodStart('');
      setPeriodEnd('');
    }
  }, [open]);

  // При выборе плана — подставляем период
  useEffect(() => {
    if (selectedPlan) {
      setPeriodStart(selectedPlan.startDate);
      setPeriodEnd(selectedPlan.endDate);
    }
  }, [selectedPlan]);

  const handleSubmit = async () => {
    if (!selectedPlan) return;
    try {
      await generateMutation.mutateAsync({
        planId: selectedPlan.id,
        data: {
          periodStart: periodStart || null,
          periodEnd: periodEnd || null,
        },
      });
      enqueueSnackbar('Список покупок создан', { variant: 'success' });
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
      <DialogTitle>Создать список покупок из плана</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Autocomplete
            options={plansQuery.data ?? []}
            getOptionLabel={(p) => p.name ?? `План #${p.id}`}
            value={selectedPlan}
            onChange={(_, v) => setSelectedPlan(v)}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            renderInput={(params) => (
              <TextField {...params} label="План меню" fullWidth />
            )}
          />

          {selectedPlan && (
            <>
              <TextField
                label="Период с"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
              <TextField
                label="Период по"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
              <Alert severity="info">
                Текущий активный список покупок будет отправлен в архив.
              </Alert>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={generateMutation.isPending}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selectedPlan || generateMutation.isPending}
        >
          {generateMutation.isPending ? 'Создание...' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}