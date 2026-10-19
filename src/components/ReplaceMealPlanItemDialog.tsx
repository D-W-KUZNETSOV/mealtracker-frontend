import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";

import { useMyRecipes } from "../hooks/useRecipes";
import { useReplaceMealPlanItem } from "../hooks/useMealPlans";
import { roundNutrient } from "../types/api";
import type {
  ApiError,
  MealPlanItemDto,
  RecipeListItemDto,
} from "../types/api";

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
    return all.filter(
      (r) => r.category === item.mealType && r.id !== item.recipeId,
    );
  }, [recipesQuery.data, item.mealType, item.recipeId]);

  // 🆕 Отправка замены (только по кнопке)
  const handleSubmit = async () => {
    if (!selected) return;
    try {
      await replaceMutation.mutateAsync({
        planId,
        itemId: item.id,
        newRecipeId: selected.id,
      });
      enqueueSnackbar("Блюдо заменено", { variant: "success" });
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      enqueueSnackbar(apiError.message || "Ошибка замены", {
        variant: "error",
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Заменить блюдо</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Плашка "Сейчас" */}
          <Alert severity="info">
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Сейчас: {item.recipeName ?? item.ingredientName ?? item.customName ?? "—"}
            </Typography>
            <Typography variant="caption">
              {item.servings != null ? `${item.servings} порц.` : item.weightInGrams != null ? `${item.weightInGrams} г` : ""}
              {item.calories != null && ` · ${Math.round(item.calories)} ккал`}
              {item.proteins != null && ` · Б ${Math.round(item.proteins)}`}
            </Typography>
          </Alert>

          {candidates.length === 0 ? (
            <Alert severity="warning">
              Нет других рецептов категории «{item.mealType}». Добавь рецепт.
            </Alert>
          ) : (
            <>
              {/* Выбор нового рецепта */}
              <Autocomplete
                options={candidates}
                getOptionLabel={(o) => o.name}
                value={selected}
                onChange={(_, v) => setSelected(v)}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                loading={recipesQuery.isLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Новый рецепт"
                    fullWidth
                    autoFocus
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Stack>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {roundNutrient(option.totalCalories ?? 0)} ккал · Б:{" "}
                        {roundNutrient(option.totalProteins ?? 0)} г
                      </Typography>
                    </Stack>
                  </li>
                )}
              />

              {/* 🆕 Блок сравнения (появляется только при выборе) */}
              {selected && (
                <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Сравнение:
                  </Typography>

                  <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Было:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {Math.round(item.calories ?? 0)} ккал · Б {Math.round(item.proteins ?? 0)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Станет:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: (selected.totalCalories ?? 0) > (item.calories ?? 0) ? 'error.main' : 'success.main'
                      }}
                    >
                      {Math.round(selected.totalCalories ?? 0)} ккал · Б {Math.round(selected.totalProteins ?? 0)}
                    </Typography>
                  </Stack>
                </Box>
              )}
            </>
          )}
        </Stack>
      </DialogContent>

      {/* Кнопки внизу диалога */}
      <DialogActions>
        <Button onClick={onClose} disabled={replaceMutation.isPending}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selected || replaceMutation.isPending}
        >
          {replaceMutation.isPending ? "Замена..." : "Заменить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}