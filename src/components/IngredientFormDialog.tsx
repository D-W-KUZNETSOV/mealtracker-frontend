import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';   // ← добавил Controller
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import type { IngredientDto, IngredientRequest } from '../types/api';
import { calcCaloriesFromMacros, roundNutrient } from '../types/api';

// ============================================================
// Схема валидации формы ингредиента.
// ============================================================
const ingredientSchema = z.object({
  name: z.string().min(1, 'Введите название').max(100, 'Максимум 100 символов'),
  proteinsPer100g: z
    .number({ message: 'Введите число' })
    .min(0, 'Не может быть отрицательным')
    .max(100, 'Слишком много'),
  fatsPer100g: z
    .number({ message: 'Введите число' })
    .min(0, 'Не может быть отрицательным')
    .max(100, 'Слишком много'),
  carbsPer100g: z
    .number({ message: 'Введите число' })
    .min(0, 'Не может быть отрицательным')
    .max(100, 'Слишком много'),
  caloriesPer100g: z
    .number({ message: 'Введите число' })
    .min(0, 'Не может быть отрицательным')
    .max(1000, 'Слишком много')
    .nullable()
    .optional(),
});

type IngredientForm = z.infer<typeof ingredientSchema>;

interface IngredientFormDialogProps {
  open: boolean;
  ingredient?: IngredientDto | null;
  initialName?: string;
  loading?: boolean;
  onSubmit: (data: IngredientRequest) => void;
  onClose: () => void;
}

// ============================================================
// Модалка создания / редактирования ингредиента.
// ============================================================
export default function IngredientFormDialog({
  open,
  ingredient,
  initialName,
  loading = false,
  onSubmit,
  onClose,
}: IngredientFormDialogProps) {
  const isEdit = !!ingredient;

  const {
    register,
    control,   // ← добавил
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<IngredientForm>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: '',
      proteinsPer100g: 0,
      fatsPer100g: 0,
      carbsPer100g: 0,
      caloriesPer100g: null,
    },
  });

  // При открытии с ингредиентом — заполняем форму, иначе сбрасываем
  useEffect(() => {
    if (open) {
      if (ingredient) {
        reset({
          name: ingredient.name,
          proteinsPer100g: ingredient.proteinsPer100g,
          fatsPer100g: ingredient.fatsPer100g,
          carbsPer100g: ingredient.carbsPer100g,
          caloriesPer100g: ingredient.caloriesPer100g ?? null,
        });
      } else {
        reset({
          name: initialName ?? '',
          proteinsPer100g: 0,
          fatsPer100g: 0,
          carbsPer100g: 0,
          caloriesPer100g: null,   // ← добавил
        });
      }
    }
  }, [open, ingredient, initialName, reset]);

  // Живой предпросмотр калорий
  const [p, f, c, cal] = watch([
    'proteinsPer100g',
    'fatsPer100g',
    'carbsPer100g',
    'caloriesPer100g',
  ]);

  const previewCalories =
    cal != null && Number(cal) > 0
      ? Number(cal)
      : calcCaloriesFromMacros(
          Number(p) || 0,
          Number(f) || 0,
          Number(c) || 0,
        );

  const handleFormSubmit = (data: IngredientForm) => {
    onSubmit({
      name: data.name.trim(),
      proteinsPer100g: data.proteinsPer100g,
      fatsPer100g: data.fatsPer100g,
      carbsPer100g: data.carbsPer100g,
      caloriesPer100g: data.caloriesPer100g ?? null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          {isEdit ? 'Редактировать ингредиент' : 'Новый ингредиент'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Название"
              fullWidth
              autoFocus
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <Stack direction="row" spacing={2}>
              <Controller
                name="proteinsPer100g"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Белки, г/100г"
                    type="text"
                    fullWidth
                    value={field.value === 0 || field.value == null ? '' : field.value}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') { field.onChange(0); return; }
                      const val = Number(raw.replace(',', '.'));
                      if (!Number.isNaN(val)) field.onChange(val);
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    slotProps={{ htmlInput: { step: '0.1', min: 0, inputMode: 'decimal' } }}
                    error={!!errors.proteinsPer100g}
                    helperText={errors.proteinsPer100g?.message}
                  />
                )}
              />

              <Controller
                name="fatsPer100g"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Жиры, г/100г"
                    type="text"
                    fullWidth
                    value={field.value === 0 || field.value == null ? '' : field.value}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') { field.onChange(0); return; }
                      const val = Number(raw.replace(',', '.'));
                      if (!Number.isNaN(val)) field.onChange(val);
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    slotProps={{ htmlInput: { step: '0.1', min: 0, inputMode: 'decimal' } }}
                    error={!!errors.fatsPer100g}
                    helperText={errors.fatsPer100g?.message}
                  />
                )}
              />

              <Controller
                name="carbsPer100g"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Углеводы, г/100г"
                    type="text"
                    fullWidth
                    value={field.value === 0 || field.value == null ? '' : field.value}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') { field.onChange(0); return; }
                      const val = Number(raw.replace(',', '.'));
                      if (!Number.isNaN(val)) field.onChange(val);
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    slotProps={{ htmlInput: { step: '0.1', min: 0, inputMode: 'decimal' } }}
                    error={!!errors.carbsPer100g}
                    helperText={errors.carbsPer100g?.message}
                  />
                )}
              />

              <Controller
                name="caloriesPer100g"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Калории, ккал/100г"
                    type="text"
                    fullWidth
                    value={field.value === 0 || field.value == null ? '' : field.value}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') { field.onChange(null); return; }
                      const val = Number(raw.replace(',', '.'));
                      if (!Number.isNaN(val)) field.onChange(val);
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    slotProps={{ htmlInput: { step: '0.1', min: 0, inputMode: 'decimal' } }}
                    error={!!errors.caloriesPer100g}
                    helperText={errors.caloriesPer100g?.message ?? 'Если пусто — посчитается из БЖУ'}
                  />
                )}
              />
            </Stack>

            <Box
              sx={{
                p: 2,
                bgcolor: 'action.hover',
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Калорийность (на 100 г)
              </Typography>
              <Typography variant="h5" color="primary.main">
                {roundNutrient(previewCalories)} ккал
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {cal != null && Number(cal) > 0
                  ? 'Указано вручную'
                  : 'Считается автоматически по формуле 4×Б + 9×Ж + 4×У'}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Отмена
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}