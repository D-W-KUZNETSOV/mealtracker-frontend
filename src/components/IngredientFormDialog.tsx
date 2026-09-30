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
// Вспомогательная проверка: строка → число
const numberString = (min: number, max: number, required = false) =>
  z.string().refine(
    (val) => {
      if (val === '' || val == null) return !required;
      const n = Number(val.replace(',', '.'));
      return !Number.isNaN(n) && n >= min && n <= max;
    },
    { message: `Введите число от ${min} до ${max}` },
  );

const ingredientSchema = z.object({
  name: z.string().min(1, 'Введите название').max(100, 'Максимум 100 символов'),
  proteinsPer100g: numberString(0, 100, true),
  fatsPer100g: numberString(0, 100, true),
  carbsPer100g: numberString(0, 100, true),
  caloriesPer100g: numberString(0, 1000, false),
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
    proteinsPer100g: '',
    fatsPer100g: '',
    carbsPer100g: '',
    caloriesPer100g: '',
  },
  });

  // При открытии с ингредиентом — заполняем форму, иначе сбрасываем
  useEffect(() => {
    if (open) {
      if (ingredient) {
        reset({
          name: ingredient.name,
          proteinsPer100g: String(ingredient.proteinsPer100g ?? ''),
          fatsPer100g: String(ingredient.fatsPer100g ?? ''),
          carbsPer100g: String(ingredient.carbsPer100g ?? ''),
          caloriesPer100g:
            ingredient.caloriesPer100g != null
              ? String(ingredient.caloriesPer100g)
              : '',
        });
      } else {
        reset({
          name: initialName ?? '',
          proteinsPer100g: '',
          fatsPer100g: '',
          carbsPer100g: '',
          caloriesPer100g: '',
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

 const parseNum = (v: unknown): number => {
   if (v == null || v === '') return 0;
   const n = Number(String(v).replace(',', '.'));
   return Number.isNaN(n) ? 0 : n;
 };

 const pNum = parseNum(p);
 const fNum = parseNum(f);
 const cNum = parseNum(c);
 const calNum = parseNum(cal);

 const previewCalories =
   calNum > 0 ? calNum : calcCaloriesFromMacros(pNum, fNum, cNum);

 const handleFormSubmit = (data: IngredientForm) => {
   const toNum = (v: string): number =>
     Number(v.replace(',', '.')) || 0;

   const calStr = data.caloriesPer100g ?? '';
   const calParsed = calStr === '' ? null : Number(calStr.replace(',', '.'));

   onSubmit({
     name: data.name.trim(),
     proteinsPer100g: toNum(data.proteinsPer100g),
     fatsPer100g: toNum(data.fatsPer100g),
     carbsPer100g: toNum(data.carbsPer100g),
     caloriesPer100g: calParsed != null && !Number.isNaN(calParsed) ? calParsed : null,
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
                 value={field.value ?? ''}
                 onChange={(e) => {
                   const raw = e.target.value;
                   if (raw === '' || /^\d*[.,]?\d*$/.test(raw)) {
                     field.onChange(raw);
                   }
                 }}
                 onFocus={(e) => e.target.select()}
                 placeholder="0"
                 slotProps={{ htmlInput: { inputMode: 'decimal' } }}
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
                   value={field.value ?? ''}
                   onChange={(e) => {
                     const raw = e.target.value;
                     if (raw === '' || /^\d*[.,]?\d*$/.test(raw)) {
                       field.onChange(raw);
                     }
                   }}
                   onFocus={(e) => e.target.select()}
                   placeholder="0"
                   slotProps={{ htmlInput: { inputMode: 'decimal' } }}
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
                   value={field.value ?? ''}
                   onChange={(e) => {
                     const raw = e.target.value;
                     if (raw === '' || /^\d*[.,]?\d*$/.test(raw)) {
                       field.onChange(raw);
                     }
                   }}
                   onFocus={(e) => e.target.select()}
                   placeholder="0"
                   slotProps={{ htmlInput: { inputMode: 'decimal' } }}
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
                   value={field.value ?? ''}
                   onChange={(e) => {
                     const raw = e.target.value;
                     if (raw === '' || /^\d*[.,]?\d*$/.test(raw)) {
                       field.onChange(raw);
                     }
                   }}
                   onFocus={(e) => e.target.select()}
                   placeholder="0"
                   slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                   error={!!errors.caloriesPer100g}
                   helperText={
                     errors.caloriesPer100g?.message ?? 'Если пусто — посчитается из БЖУ'
                   }
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
               {calNum > 0
                 ? 'Указано вручную'
                 : 'Считается автоматически...'}
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