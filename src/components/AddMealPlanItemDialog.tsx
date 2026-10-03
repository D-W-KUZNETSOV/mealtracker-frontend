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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { useMyRecipes } from '../hooks/useRecipes';
import { useBaseIngredients } from '../hooks/useIngredients';
import { useAddMealPlanItem } from '../hooks/useMealPlans';
import type {
  ApiError,
  IngredientDto,
  MealType,
  RecipeListItemDto,
} from '../types/api';

interface Props {
  open: boolean;
  onClose: () => void;
  planId: number;
  planDate: string;
  mealType: MealType;
}

type Mode = 'recipe' | 'ingredient';

const MEAL_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Завтрак',
  LUNCH: 'Обед',
  DINNER: 'Ужин',
  SNACK: 'Перекус',
  DESSERT: 'Десерт',
  DRINK: 'Напиток',
};

export default function AddMealPlanItemDialog({
  open,
  onClose,
  planId,
  planDate,
  mealType,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const addMutation = useAddMealPlanItem();

  // ---------- React Query ----------
  const recipesQuery = useMyRecipes(0, 100);
  const ingredientsQuery = useBaseIngredients();

  // ---------- useState ----------
  const [mode, setMode] = useState<Mode>('recipe');
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeListItemDto | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientDto | null>(null);
  const [servings, setServings] = useState<number>(1);
  const [weightInGrams, setWeightInGrams] = useState<number>(100);

  // ---------- Сброс при открытии ----------
  useEffect(() => {
    if (open) {
      setMode('recipe');
      setSelectedRecipe(null);
      setSelectedIngredient(null);
      setServings(1);
      setWeightInGrams(100);
    }
  }, [open]);

  // ---------- Автоподстановка servings/weight при выборе ----------
  useEffect(() => {
    if (selectedRecipe) {
      setServings(selectedRecipe.servings ?? 1);
    }
  }, [selectedRecipe]);

  // ---------- Данные для отображения ----------
  const recipes = recipesQuery.data?.content ?? [];
  const ingredients = ingredientsQuery.data ?? [];

  const canSubmit = useMemo(() => {
    if (mode === 'recipe') return !!selectedRecipe && servings > 0;
    return !!selectedIngredient && weightInGrams > 0;
  }, [mode, selectedRecipe, selectedIngredient, servings, weightInGrams]);

  // ---------- Отправка ----------
  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      if (mode === 'recipe' && selectedRecipe) {
        await addMutation.mutateAsync({
          planId,
          data: {
            planDate,
            mealType,
            recipeId: selectedRecipe.id,
            servings,
          },
        });
      } else if (mode === 'ingredient' && selectedIngredient) {
        await addMutation.mutateAsync({
          planId,
          data: {
            planDate,
            mealType,
            ingredientId: selectedIngredient.id,
            weightInGrams,
          },
        });
      }

      enqueueSnackbar('Приём добавлен в план', { variant: 'success' });
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      enqueueSnackbar(apiError.message || 'Ошибка добавления', {
        variant: 'error',
      });
    }
  };

  // ---------- JSX ----------
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {MEAL_LABELS[mealType]} — {planDate}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Переключатель режима */}
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, v) => v && setMode(v)}
            size="small"
            fullWidth
          >
            <ToggleButton value="recipe">Рецепт</ToggleButton>
            <ToggleButton value="ingredient">Ингредиент</ToggleButton>
          </ToggleButtonGroup>

          {mode === 'recipe' && (
            <>
              <Autocomplete
                options={recipes}
                getOptionLabel={(r) => r.name}
                value={selectedRecipe}
                onChange={(_, v) => setSelectedRecipe(v)}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                loading={recipesQuery.isLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Рецепт"
                    fullWidth
                    autoFocus
                  />
                )}
              />

              {selectedRecipe && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    КБЖУ рецепта: {selectedRecipe.totalCalories ?? '—'} ккал ·{' '}
                    {selectedRecipe.servings} порц. по{' '}
                    {selectedRecipe.servingSizeGrams?.toFixed(0) ?? '—'} г
                  </Typography>

                  <TextField
                    label="Порций"
                    type="number"
                    fullWidth
                    value={servings}
                    onChange={(e) => setServings(Number(e.target.value) || 0)}
                    slotProps={{ htmlInput: { step: '0.5', min: 0.5 } }}
                  />
                </>
              )}
            </>
          )}

          {mode === 'ingredient' && (
            <>
              <Autocomplete
                options={ingredients}
                getOptionLabel={(i) => i.name}
                value={selectedIngredient}
                onChange={(_, v) => setSelectedIngredient(v)}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                loading={ingredientsQuery.isLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ингредиент"
                    fullWidth
                    autoFocus
                  />
                )}
              />

              {selectedIngredient && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    КБЖУ на 100 г: {selectedIngredient.caloriesPer100g ?? '—'} ккал
                  </Typography>

                  <TextField
                    label="Вес, г"
                    type="number"
                    fullWidth
                    value={weightInGrams}
                    onChange={(e) => setWeightInGrams(Number(e.target.value) || 0)}
                    slotProps={{ htmlInput: { step: '1', min: 1 } }}
                  />
                </>
              )}
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