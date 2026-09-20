import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';

import { useCreateRecipe } from '../hooks/useRecipes';
import {
  useBaseIngredients,
  useMyIngredients,
} from '../hooks/useIngredients';
import type {
  ApiError,
  IngredientDto,
  RecipeIngredientInput,
  RecipeRequest,
} from '../types/api';
import { roundNutrient } from '../types/api';

// ============================================================
// Строка ингредиента в форме (локальная структура)
// ============================================================
interface IngredientRow {
  tempId: number;              // для React key
  ingredientId: number | null;
  weightInGrams: number;
}

interface RecipeFormDialogProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  'Завтрак',
  'Обед',
  'Ужин',
  'Перекус',
  'Десерт',
  'Напиток',
];

export default function RecipeFormDialog({
  open,
  onClose,
}: RecipeFormDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const createMutation = useCreateRecipe();

  // Загружаем ингредиенты: мои + базовые
  const myIngredientsQuery = useMyIngredients();
  const baseIngredientsQuery = useBaseIngredients();

  const allIngredients: IngredientDto[] = useMemo(
    () => [
      ...(myIngredientsQuery.data ?? []),
      ...(baseIngredientsQuery.data ?? []),
    ],
    [myIngredientsQuery.data, baseIngredientsQuery.data],
  );

  // ---------- Состояние формы ----------
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>(
    'PRIVATE',
  );
  const [rows, setRows] = useState<IngredientRow[]>([]);

  // ---------- Сброс формы при открытии ----------
  useEffect(() => {
    if (open) {
      setName('');
      setCategory(null);
      setDescription('');
      setImageUrl('');
      setVisibility('PRIVATE');
      setRows([
        {
          tempId: Date.now(),
          ingredientId: null,
          weightInGrams: 100,
        },
      ]);
    }
  }, [open]);

  // ---------- Работа со строками ингредиентов ----------
  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        tempId: Date.now() + Math.random(),
        ingredientId: null,
        weightInGrams: 100,
      },
    ]);
  };

  const handleRemoveRow = (tempId: number) => {
    setRows((prev) => prev.filter((r) => r.tempId !== tempId));
  };

  const handleRowChange = (
    tempId: number,
    patch: Partial<Omit<IngredientRow, 'tempId'>>,
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.tempId === tempId ? { ...r, ...patch } : r)),
    );
  };

  // ---------- Живой предпросмотр КБЖУ ----------
  const totals = useMemo(() => {
    let calories = 0;
    let proteins = 0;
    let fats = 0;
    let carbs = 0;

    for (const row of rows) {
      if (!row.ingredientId) continue;
      const ing = allIngredients.find((i) => i.id === row.ingredientId);
      if (!ing) continue;

      const k = row.weightInGrams / 100;
      calories += ing.caloriesPer100g * k;
      proteins += ing.proteinsPer100g * k;
      fats += ing.fatsPer100g * k;
      carbs += ing.carbsPer100g * k;
    }

    return { calories, proteins, fats, carbs };
  }, [rows, allIngredients]);

  // ---------- Валидность ----------
  const canSubmit =
    name.trim().length > 0 &&
    rows.length > 0 &&
    rows.every(
      (r) => r.ingredientId !== null && r.weightInGrams > 0,
    );

  // ---------- Отправка ----------
  const handleSubmit = async () => {
    if (!canSubmit) {
      enqueueSnackbar('Заполните название и все ингредиенты', {
        variant: 'warning',
      });
      return;
    }

    const ingredients: RecipeIngredientInput[] = rows.map((r) => ({
      ingredientId: r.ingredientId!,
      weightInGrams: r.weightInGrams,
    }));

    const payload: RecipeRequest = {
      name: name.trim(),
      category: category ?? undefined,
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      visibility,
      ingredients,
    };

    try {
      await createMutation.mutateAsync(payload);
      enqueueSnackbar('Рецепт создан', { variant: 'success' });
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      enqueueSnackbar(apiError.message || 'Ошибка создания', {
        variant: 'error',
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Создать рецепт</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Название */}
          <TextField
            label="Название"
            fullWidth
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Категория */}
         <Autocomplete
           options={allIngredients}
           getOptionLabel={(o) => o.name}
           value={ing ?? null}
           onChange={(_, v) =>
             handleRowChange(row.tempId, {
               ingredientId: v ? v.id : null,
             })
           }
           isOptionEqualToValue={(o, v) => o.id === v.id}
           renderOption={(props, option) => (
             <li {...props} key={option.id}>
               {option.name}
             </li>
           )}
           renderInput={(params) => (
             <TextField
               {...params}
               label="Ингредиент"
               size="small"
               fullWidth
             />
           )}
           sx={{ flex: 2 }}
         />

          {/* Описание */}
          <TextField
            label="Описание"
            fullWidth
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Картинка (URL) */}
          <TextField
            label="URL картинки (опционально)"
            fullWidth
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          {/* Видимость */}
          <FormControl>
            <FormLabel>Видимость</FormLabel>
            <RadioGroup
              row
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as 'PUBLIC' | 'PRIVATE')
              }
            >
              <FormControlLabel
                value="PRIVATE"
                control={<Radio />}
                label="Приватный (только я)"
              />
              <FormControlLabel
                value="PUBLIC"
                control={<Radio />}
                label="Публичный (всем)"
              />
            </RadioGroup>
          </FormControl>

          <Divider />

          {/* Ингредиенты */}
       <Stack
         direction="row"
         sx={{
           justifyContent: 'space-between',
           alignItems: 'center',
         }}
       >
            <Typography variant="h6">Ингредиенты</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddRow}
              size="small"
            >
              Добавить ингредиент
            </Button>
          </Stack>

          {rows.length === 0 ? (
            <Typography color="text.secondary">
              Добавьте хотя бы один ингредиент
            </Typography>
          ) : (
            <Stack spacing={1}>
              {rows.map((row) => {
                const ing = allIngredients.find(
                  (i) => i.id === row.ingredientId,
                );
                const itemCalories = ing
                  ? (ing.caloriesPer100g * row.weightInGrams) / 100
                  : 0;

                return (
                  <Stack
                    key={row.tempId}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Autocomplete
                      options={allIngredients}
                      getOptionLabel={(o) => o.name}
                      value={ing ?? null}
                      onChange={(_, v) =>
                        handleRowChange(row.tempId, {
                          ingredientId: v ? v.id : null,
                        })
                      }
                      isOptionEqualToValue={(o, v) => o.id === v.id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Ингредиент"
                          size="small"
                          fullWidth
                        />
                      )}
                      sx={{ flex: 2 }}
                    />
                    <TextField
                      label="Вес, г"
                      type="number"
                      size="small"
                      value={row.weightInGrams}
                      onChange={(e) =>
                        handleRowChange(row.tempId, {
                          weightInGrams: Number(e.target.value) || 0,
                        })
                      }
                      slotProps={{ htmlInput: { step: '1', min: 1 } }}
                      sx={{ flex: 1 }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ minWidth: 80, textAlign: 'right' }}
                    >
                      {roundNutrient(itemCalories)} ккал
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveRow(row.tempId)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                );
              })}
            </Stack>
          )}

          {/* Итого КБЖУ */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
            >
              Итого по рецепту
            </Typography>
            <Stack direction="row" spacing={4}>
              <Box>
                <Typography variant="h6">
                  {roundNutrient(totals.calories)} ккал
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Калории
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6">
                  {roundNutrient(totals.proteins)} г
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Белки
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6">
                  {roundNutrient(totals.fats)} г
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Жиры
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6">
                  {roundNutrient(totals.carbs)} г
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Углеводы
                </Typography>
              </Box>
            </Stack>
          </Paper>
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