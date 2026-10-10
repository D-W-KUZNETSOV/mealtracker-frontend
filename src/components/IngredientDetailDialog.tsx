import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import type { IngredientDto } from '../types/api';
import { roundNutrient, INGREDIENT_CATEGORIES } from '../types/api';

interface Props {
  open: boolean;
  ingredient: IngredientDto;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function IngredientDetailDialog({
  open,
  ingredient,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const category = INGREDIENT_CATEGORIES[ingredient.category ?? 'OTHER'] ?? INGREDIENT_CATEGORIES.OTHER;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{ingredient.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5}>
          {/* Категория */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="h6">{category.emoji}</Typography>
            <Typography variant="body2" color="text.secondary">
              {category.label}
            </Typography>
          </Stack>

          <Divider />

          {/* КБЖУ */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              КБЖУ на 100 г
            </Typography>
            <Stack spacing={0.5}>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2">Калории</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {ingredient.caloriesPer100g != null
                    ? `${roundNutrient(ingredient.caloriesPer100g)} ккал`
                    : '—'}
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2">Белки</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {roundNutrient(ingredient.proteinsPer100g)} г
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2">Жиры</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {roundNutrient(ingredient.fatsPer100g)} г
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2">Углеводы</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {roundNutrient(ingredient.carbsPer100g)} г
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Stack direction="row" spacing={1}>
          {onEdit && (
            <Button onClick={onEdit} size="small">
              Редактировать
            </Button>
          )}
          {onDelete && (
            <Button onClick={onDelete} size="small" color="error">
              Удалить
            </Button>
          )}
        </Stack>
        <Button onClick={onClose} variant="contained" size="small">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
}