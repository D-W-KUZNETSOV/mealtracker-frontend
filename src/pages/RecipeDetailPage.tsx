import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSnackbar } from 'notistack';
import { getImageFullUrl } from '../utils/imageUrl';

import {
  useDeleteRecipe,
  useRecipeSummary,
  useToggleRecipeVisibility,
} from '../hooks/useRecipes';
import type { ApiError } from '../types/api';
import { roundNutrient } from '../types/api';
import ConfirmDialog from '../components/ConfirmDialog';

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const recipeId = id ? Number(id) : undefined;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [confirmDelete, setConfirmDelete] = useState(false);

  const summaryQuery = useRecipeSummary(recipeId);
  const toggleMutation = useToggleRecipeVisibility();
  const deleteMutation = useDeleteRecipe();

  const handleToggleVisibility = async () => {
    if (!recipeId) return;
    try {
      await toggleMutation.mutateAsync(recipeId);
      enqueueSnackbar('Видимость изменена', { variant: 'success' });
    } catch (err) {
      const apiError = err as ApiError;
      enqueueSnackbar(apiError.message || 'Ошибка', { variant: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!recipeId) return;
    try {
      await deleteMutation.mutateAsync(recipeId);
      enqueueSnackbar('Рецепт удалён', { variant: 'success' });
      navigate('/recipes', { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      enqueueSnackbar(apiError.message || 'Ошибка удаления', {
        variant: 'error',
      });
    }
  };

  if (summaryQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return <Alert severity="error">Рецепт не найден или ошибка загрузки</Alert>;
  }

  const recipe = summaryQuery.data;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/recipes')}
        sx={{ mb: 2 }}
      >
        К списку рецептов
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
       <Stack
         direction="row"
         sx={{
           justifyContent: 'space-between',
           alignItems: 'flex-start',
         }}
       >
          <Box>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: 'center',
              mb: 1,
            }}
          >
              <Typography variant="h4">{recipe.name}</Typography>
              <Chip
                label={recipe.visibility}
                color={
                  recipe.visibility === 'PUBLIC' ? 'success' : 'default'
                }
              />
            </Stack>
            {recipe.description && (
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {recipe.description}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={handleToggleVisibility}
              disabled={toggleMutation.isPending}
            >
              Сменить видимость
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setConfirmDelete(true)}
            >
              Удалить
            </Button>
          </Stack>
        </Stack>

        {recipe.imageUrl && (
          <Box
            component="img"
            src={getImageFullUrl(recipe.imageUrl) ?? undefined}
            alt={recipe.name}
            sx={{
              maxWidth: '100%',
              maxHeight: 400,
              borderRadius: 1,
              mt: 2,
            }}
          />
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Итого КБЖУ
        </Typography>
        <Stack direction="row" spacing={4}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Калории
            </Typography>
            <Typography variant="h5">
              {roundNutrient(recipe.totalCalories)} ккал
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Белки
            </Typography>
            <Typography variant="h5">
              {roundNutrient(recipe.totalProteins)} г
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Жиры
            </Typography>
            <Typography variant="h5">
              {roundNutrient(recipe.totalFats)} г
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Углеводы
            </Typography>
            <Typography variant="h5">
              {roundNutrient(recipe.totalCarbs)} г
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Ингредиенты
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell align="right">Вес, г</TableCell>
              <TableCell align="right">Ккал</TableCell>
              <TableCell align="right">Б</TableCell>
              <TableCell align="right">Ж</TableCell>
              <TableCell align="right">У</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recipe.ingredients.map((ing, idx) => (
              <TableRow key={idx}>
                <TableCell>{ing.name}</TableCell>
                <TableCell align="right">{ing.quantityGrams}</TableCell>
                <TableCell align="right">
                  {roundNutrient(ing.itemCalories)}
                </TableCell>
                <TableCell align="right">
                  {roundNutrient(
                    (ing.proteinsPer100g * ing.quantityGrams) / 100,
                  )}
                </TableCell>
                <TableCell align="right">
                  {roundNutrient((ing.fatsPer100g * ing.quantityGrams) / 100)}
                </TableCell>
                <TableCell align="right">
                  {roundNutrient((ing.carbsPer100g * ing.quantityGrams) / 100)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={confirmDelete}
        title="Удалить рецепт?"
        message={`Рецепт «${recipe.name}» будет удалён безвозвратно.`}
        confirmLabel="Удалить"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </Box>
  );
}