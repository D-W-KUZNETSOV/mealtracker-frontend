import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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

import { useMyRecipes } from '../hooks/useRecipes';
import { useReplaceMealPlanItem } from '../hooks/useMealPlans';
import { roundNutrient } from '../types/api';
import type { ApiError, MealPlanItemDto, RecipeListItemDto } from '../types/api';

interface ReplaceMealPlanItemDialogProps {
  open: boolean;
  onClose: () => void;
  planId: number;
  item: MealPlanItemDto;
}

export default function ReplaceMealPlanItemDialog({
  open,
  onClose,
  planId,
  item,
}: ReplaceMealPlanItemDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const replaceMutation = useReplaceMealPlanItem();
  const recipesQuery = useMyRecipes(0, 100);

  const [selected, setSelected] = useState<RecipeListItemDto | null>(null);

  // Сброс при открытии
  useEffect(() => {
    if (open) setSelected(null);
  }, [open]);

  // Рецепты той же категории, кроме текущего
 const candidates = useMemo(() => {
   const all = recipesQuery.data?.content ?? [];
   console.log('=== ReplaceMealPlanItemDialog ===');
   console.log('item.mealType:', item.mealType);
   console.log('item.recipeId:', item.recipeId);
   console.log('recipes count:', all.length);
   console.log('categories:', all.map(r => ({ id: r.id, name: r.name, category: r.category })));
   const filtered = all.filter(
     (r) => r.category === item.mealType && r.id !== item.recipeId,
   );
   console.log('filtered count:', filtered.length);
   return filtered;
 }, [recipesQuery.data, item.mealType, item.recipeId]);

  const handleSubmit = async () => {
    if (!selected) return;
    try {
      await replaceMutation.mutateAsync({
        planId,
        itemId: item.id,
        newRecipeId: selected.id,
      });
      enqueueSnackbar('Блюдо заменено', { variant: 'success' });
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      enqueueSnackbar(
        apiError.message || 'Ошибка замены',
        { variant: 'error' },
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Заменить блюдо</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="info">
            Сейчас: {item.recipeName ?? item.ingredientName ?? item.customName ?? '—'}
          </Alert>

          {candidates.length === 0 ? (
            <Alert severity="warning">
              Нет других рецептов категории «{item.mealType}». Добавь рецепт.
            </Alert>
          ) : (
            <Autocomplete
              options={candidates}
              getOptionLabel={(o) => o.name}
              value={selected}
              onChange={(_, v) => setSelected(v)}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              loading={recipesQuery.isLoading}
              renderInput={(params) => (
                <TextField {...params} label="Новый рецепт" fullWidth autoFocus />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Stack>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {option.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {roundNutrient(option.totalCalories ?? 0)} ккал · Б: {roundNutrient(option.totalProteins ?? 0)} г
                    </Typography>
                  </Stack>
                </li>
              )}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={replaceMutation.isPending}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selected || replaceMutation.isPending}
        >
          {replaceMutation.isPending ? 'Замена...' : 'Заменить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}