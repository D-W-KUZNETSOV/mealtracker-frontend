import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { useAddFromPlan } from '../hooks/useStats';
import type { ApiError, MealPlanDto } from '../types/api';

interface Props {
  open: boolean;
  onClose: () => void;
  plan: MealPlanDto;
  date: string;
}

export default function AddFromPlanDialog({ open, onClose, plan, date }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const addMutation = useAddFromPlan();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const itemsForDate = plan.items.filter((i) => i.planDate === date);

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(itemsForDate.map((i) => i.id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, date]);

  const toggle = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0) return;
    try {
      const result = await addMutation.mutateAsync({
        planId: plan.id,
        date,
        itemIds: Array.from(selectedIds),
      });
      enqueueSnackbar(result.data.message || 'Добавлено', { variant: 'success' });
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      enqueueSnackbar(apiError.message || 'Ошибка', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Добавить из плана на {date}</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {itemsForDate.length === 0 ? (
            <Alert severity="info">
              На эту дату в плане нет приёмов
            </Alert>
          ) : (
            itemsForDate.map((item) => (
              <Box
                key={item.id}
                sx={{
                  p: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggle(item.id)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">
                        {item.recipeName || item.ingredientName || item.customName || '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.mealType} ·{' '}
                        {item.servings != null
                          ? `${item.servings} порц.`
                          : item.weightInGrams != null
                          ? `${item.weightInGrams} г`
                          : ''}
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            ))
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={addMutation.isPending}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={selectedIds.size === 0 || addMutation.isPending}
        >
          {addMutation.isPending ? 'Добавление...' : `Добавить (${selectedIds.size})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}