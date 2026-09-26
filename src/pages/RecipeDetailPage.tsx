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
  useMediaQuery,
  useTheme,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

      {/* ============ Шапка ============ */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'flex-start' },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h4"
              sx={{ mb: 1, wordBreak: 'break-word' }}
            >
              {recipe.name}
            </Typography>
            <Chip
              label={
                recipe.visibility === 'PUBLIC'
                  ? 'Публичный'
                  : 'Приватный'
              }
              color={recipe.visibility === 'PUBLIC' ? 'success' : 'default'}
              size="small"
              sx={{ mb: 1 }}
            />
            {recipe.description && (
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {recipe.description}
              </Typography>
            )}
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ flexShrink: 0 }}
          >
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={handleToggleVisibility}
              disabled={toggleMutation.isPending}
              fullWidth={isMobile}
            >
              Сменить видимость
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setConfirmDelete(true)}
              fullWidth={isMobile}
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

      {/* ============ КБЖУ ============ */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Итого КБЖУ
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
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
        </Box>
      </Paper>

      {/* ============ Ингредиенты ============ */}
      <Typography variant="h6" gutterBottom>
        Ингредиенты
      </Typography>
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell align="right">Вес, г</TableCell>
              <TableCell align="right">Ккал</TableCell>
              {!isMobile && <TableCell align="right">Б</TableCell>}
              {!isMobile && <TableCell align="right">Ж</TableCell>}
              {!isMobile && <TableCell align="right">У</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {recipe.ingredients.map((ing, idx) => (
              <TableRow key={idx}>
                <TableCell
                  sx={{
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    minWidth: 100,
                  }}
                >
                  {ing.name}
                </TableCell>
                <TableCell align="right">{ing.quantityGrams}</TableCell>
                <TableCell align="right">
                  {roundNutrient(ing.itemCalories)}
                </TableCell>
                {!isMobile && (
                  <TableCell align="right">
                    {roundNutrient(
                      (ing.proteinsPer100g * ing.quantityGrams) / 100,
                    )}
                  </TableCell>
                )}
                {!isMobile && (
                  <TableCell align="right">
                    {roundNutrient(
                      (ing.fatsPer100g * ing.quantityGrams) / 100,
                    )}
                  </TableCell>
                )}
                {!isMobile && (
                  <TableCell align="right">
                    {roundNutrient(
                      (ing.carbsPer100g * ing.quantityGrams) / 100,
                    )}
                  </TableCell>
                )}
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