import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { useBaseIngredients, useMyIngredients } from '../hooks/useIngredients';
import { useAddShoppingItem } from '../hooks/useShoppingLists';
import type { ApiError, IngredientDto } from '../types/api';

interface Props {
  open: boolean;
  onClose: () => void;
  listId: number;
}

const UNIT_LABELS: Record<string, string> = {
  GRAM: 'г',
  ML: 'мл',
  PIECE: 'шт',
  TBSP: 'ст.л.',
  TSP: 'ч.л.',
  CUP: 'чашка',
};

export default function AddShoppingItemDialog({ open, onClose, listId }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const addMutation = useAddShoppingItem();
 const myIngredientsQuery = useMyIngredients();
 const baseIngredientsQuery = useBaseIngredients();

 const allIngredients = useMemo(
   () => [
     ...(myIngredientsQuery.data ?? []),
     ...(baseIngredientsQuery.data ?? []),
   ],
   [myIngredientsQuery.data, baseIngredientsQuery.data],
 );

  const [selected, setSelected] = useState<IngredientDto | null>(null);
  const [quantity, setQuantity] = useState<number>(100);

  useEffect(() => {
    if (open) {
      setSelected(null);
      setQuantity(100);
    }
  }, [open]);

  const canSubmit = !!selected && quantity > 0;

  const handleSubmit = async () => {
    if (!selected) return;
    try {
      await addMutation.mutateAsync({
        listId,
        data: {
          ingredientId: selected.id,
          ingredientName: selected.name,
          category: null,
          quantityGrams: quantity,
          unitType: selected.unitType,
        },
      });
      enqueueSnackbar('Добавлено в список', { variant: 'success' });
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      enqueueSnackbar(apiError.message || 'Ошибка', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Добавить в список покупок</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Autocomplete
            options={allIngredients}
            getOptionLabel={(i) => i.name}
            value={selected}
            onChange={(_, v) => setSelected(v)}
            isOptionEqualToValue={(o, v) => o.id === v.id}
             loading={myIngredientsQuery.isLoading || baseIngredientsQuery.isLoading}
            renderInput={(params) => (
              <TextField {...params} label="Ингредиент" fullWidth autoFocus />
            )}
          />

          {selected && (
            <>
              <Typography variant="body2" color="text.secondary">
                КБЖУ на 100 г: {selected.caloriesPer100g ?? '—'} ккал
              </Typography>

           <TextField
             label={`Количество, ${UNIT_LABELS[selected.unitType] ?? 'ед.'}`}
             type="number"
             fullWidth
             value={quantity === 0 || quantity == null ? '' : quantity}
             onChange={(e) => {
               const raw = e.target.value;
               if (raw === '') {
                 setQuantity(0);
                 return;
               }
               const val = Number(raw.replace(',', '.'));
               if (!Number.isNaN(val)) setQuantity(val);
             }}
             onFocus={(e) => e.target.select()}
             placeholder="0"
             slotProps={{ htmlInput: { step: '1', min: 1, inputMode: 'decimal' } }}
           />
            </>
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
          disabled={!canSubmit || addMutation.isPending}
        >
          {addMutation.isPending ? 'Добавление...' : 'Добавить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}