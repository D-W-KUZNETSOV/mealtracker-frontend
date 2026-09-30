import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { useAddPortion } from '../hooks/useStats';
import { useMyRecipes } from '../hooks/useRecipes';
import type {
  ApiError,
  RecipeListItemDto,
} from '../types/api';
import { roundNutrient } from '../types/api';

interface AddPortionDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddPortionDialog({
  open,
  onClose,
}: AddPortionDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const addMutation = useAddPortion();

  // Мои рецепты для выбора
  const myRecipesQuery = useMyRecipes(0, 100);
  const recipes: RecipeListItemDto[] = myRecipesQuery.data?.content ?? [];

  const [selected, setSelected] = useState<RecipeListItemDto | null>(null);
  const [weight, setWeight] = useState<number>(100);

  // Сброс при открытии
  useEffect(() => {
    if (open) {
      setSelected(null);
      setWeight(100);
    }
  }, [open]);

  // Живой предпросмотр КБЖУ
  // Внимание: /api/recipes возвращает total* на null,
  // поэтому предпросмотр может быть неточным. Показываем только если есть данные.
 const preview = useMemo(() => {
   if (!selected || selected.totalCalories == null) return null;
   if (!selected.totalWeight || selected.totalWeight <= 0) return null;   // ← защита
   const k = weight / selected.totalWeight;                                // ← было / 100
   return {
     calories: (selected.totalCalories ?? 0) * k,
     proteins: (selected.totalProteins ?? 0) * k,
     fats: (selected.totalFats ?? 0) * k,
     carbs: (selected.totalCarbs ?? 0) * k,
   };
 }, [selected, weight]);


  const canSubmit =
    selected !== null && weight > 0 && !addMutation.isPending;

  const handleSubmit = async () => {
    if (!selected) return;
    try {
      await addMutation.mutateAsync({
        recipeId: selected.id,
        weightInGrams: weight,
      });
      enqueueSnackbar('Порция добавлена', { variant: 'success' });
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      enqueueSnackbar(
        apiError.message || 'Ошибка добавления порции',
        { variant: 'error' },
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Добавить порцию</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Autocomplete
            options={recipes}
            getOptionLabel={(o) => o.name}
            value={selected}
            onChange={(_, v) => setSelected(v)}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Рецепт"
                fullWidth
                autoFocus
              />
            )}
          />

         <TextField
           label="Вес порции, г"
           type="text"
           fullWidth
           value={weight === 0 ? '' : weight}
           onChange={(e) => {
             const raw = e.target.value;
             if (raw === '') {
               setWeight(0);
               return;
             }
             const val = Number(raw.replace(',', '.'));
             if (!Number.isNaN(val)) {
               setWeight(val);
             }
           }}
           onFocus={(e) => e.target.select()}
           placeholder="0"
           slotProps={{ htmlInput: { inputMode: 'decimal', min: 1 } }}
         />

          {preview && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                КБЖУ порции
              </Typography>
              <Stack direction="row" spacing={3}>
                <Box>
                  <Typography variant="h6">
                    {roundNutrient(preview.calories)} ккал
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Калории
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6">
                    {roundNutrient(preview.proteins)} г
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Белки
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6">
                    {roundNutrient(preview.fats)} г
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Жиры
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6">
                    {roundNutrient(preview.carbs)} г
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Углеводы
                  </Typography>
                </Box>
              </Stack>
            </Paper>
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
          disabled={!canSubmit}
        >
          {addMutation.isPending ? 'Добавление...' : 'Добавить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}