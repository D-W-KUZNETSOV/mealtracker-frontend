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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { useAddPortion } from '../hooks/useStats';
import { useMyRecipes } from '../hooks/useRecipes';
import type { ApiError, RecipeListItemDto } from '../types/api';
import { roundNutrient } from '../types/api';

interface AddPortionDialogProps {
  open: boolean;
  onClose: () => void;
}

type UnitMode = 'GRAM' | 'PORTION';

export default function AddPortionDialog({
  open,
  onClose,
}: AddPortionDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const addMutation = useAddPortion();

  const myRecipesQuery = useMyRecipes(0, 100);
  const recipes: RecipeListItemDto[] = myRecipesQuery.data?.content ?? [];

  const [selected, setSelected] = useState<RecipeListItemDto | null>(null);
  const [mode, setMode] = useState<UnitMode>('GRAM');
  const [inputStr, setInputStr] = useState<string>('100');

  // Сброс при открытии
  useEffect(() => {
    if (open) {
      setSelected(null);
      setMode('GRAM');
      setInputStr('100');
    }
  }, [open]);

  const inputNum = Number(inputStr.replace(',', '.')) || 0;

  // Вес в граммах (в зависимости от режима)
  const weight = useMemo(() => {
    if (!selected) return 0;
    if (mode === 'GRAM') return inputNum;
    // PORTION
    const size = selected.servingSizeGrams ?? 0;
    return size > 0 ? inputNum * size : 0;
  }, [selected, mode, inputNum]);

  // Живой предпросмотр КБЖУ
  const preview = useMemo(() => {
    if (!selected || selected.totalCalories == null) return null;
    if (!selected.totalWeight || selected.totalWeight <= 0) return null;
    if (weight <= 0) return null;
    const k = weight / selected.totalWeight;
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

  const handleModeChange = (_: unknown, v: UnitMode | null) => {
    if (!v) return;
    setMode(v);
    // При смене режима ставим разумное значение по умолчанию
    setInputStr(v === 'GRAM' ? '100' : '1');
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
              <TextField {...params} label="Рецепт" fullWidth autoFocus />
            )}
          />

          {/* Подсказка по порции */}
          {selected && selected.servingSizeGrams > 0 && (
            <Typography variant="caption" color="text.secondary">
              1 порция ≈ {roundNutrient(selected.servingSizeGrams)} г
              {selected.servings > 1 && ` (рецепт на ${selected.servings} порц.)`}
            </Typography>
          )}

          {/* Переключатель: граммы / порции */}
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={mode}
              onChange={handleModeChange}
            >
              <ToggleButton value="GRAM">Граммы</ToggleButton>
              <ToggleButton value="PORTION">Порции</ToggleButton>
            </ToggleButtonGroup>

            <TextField
              label={mode === 'GRAM' ? 'Вес порции, г' : 'Количество порций'}
              type="text"
              fullWidth
              value={inputStr}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '' || /^\d*[.,]?\d*$/.test(raw)) {
                  setInputStr(raw);
                }
              }}
              onFocus={(e) => e.target.select()}
              placeholder="0"
              slotProps={{ htmlInput: { inputMode: 'decimal' } }}
            />
          </Stack>

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