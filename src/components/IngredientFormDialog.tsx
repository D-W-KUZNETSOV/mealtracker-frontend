import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
    .number({ invalid_type_error: 'Введите число' })
    .min(0, 'Не может быть отрицательным')
    .max(100, 'Слишком много'),
  fatsPer100g: z
    .number({ invalid_type_error: 'Введите число' })
    .min(0, 'Не может быть отрицательным')
    .max(100, 'Слишком много'),
  carbsPer100g: z
    .number({ invalid_type_error: 'Введите число' })
    .min(0, 'Не может быть отрицательным')
    .max(100, 'Слишком много'),
});

type IngredientForm = z.infer<typeof ingredientSchema>;

interface IngredientFormDialogProps {
  open: boolean;
  /** Если передан — режим редактирования */
  ingredient?: IngredientDto | null;
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
  loading = false,
  onSubmit,
  onClose,
}: IngredientFormDialogProps) {
  const isEdit = !!ingredient;

  const {
    register,
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
        });
      } else {
        reset({
          name: '',
          proteinsPer100g: 0,
          fatsPer100g: 0,
          carbsPer100g: 0,
        });
      }
    }
  }, [open, ingredient, reset]);

  // Живой предпросмотр калорий
  const [p, f, c] = watch(['proteinsPer100g', 'fatsPer100g', 'carbsPer100g']);
  const previewCalories = calcCaloriesFromMacros(
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
             <TextField
               label="Белки, г/100г"
               type="number"
               fullWidth
               slotProps={{
                 htmlInput: { step: '0.1', min: 0 },
               }}
               {...register('proteinsPer100g', { valueAsNumber: true })}
               error={!!errors.proteinsPer100g}
               helperText={errors.proteinsPer100g?.message}
             />
             <TextField
               label="Жиры, г/100г"
               type="number"
               fullWidth
               slotProps={{
                 htmlInput: { step: '0.1', min: 0 },
               }}
               {...register('fatsPer100g', { valueAsNumber: true })}
               error={!!errors.fatsPer100g}
               helperText={errors.fatsPer100g?.message}
             />
             <TextField
               label="Углеводы, г/100г"
               type="number"
               fullWidth
               slotProps={{
                 htmlInput: { step: '0.1', min: 0 },
               }}
               {...register('carbsPer100g', { valueAsNumber: true })}
               error={!!errors.carbsPer100g}
               helperText={errors.carbsPer100g?.message}
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
                Считается автоматически по формуле 4×Б + 9×Ж + 4×У
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