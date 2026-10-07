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
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';   // 🆕
import { useSnackbar } from 'notistack';
import { getImageFullUrl } from '../utils/imageUrl';

import {
  useCopyRecipeToMy,
  useDeleteRecipe,
  useRecipeSummary,
  useToggleRecipeVisibility,
} from '../hooks/useRecipes';import type { ApiError } from '../types/api';
import { roundNutrient } from '../types/api';
import ConfirmDialog from '../components/ConfirmDialog';
import RecipeFormDialog from '../components/RecipeFormDialog';

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const recipeId = id ? Number(id) : undefined;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const summaryQuery = useRecipeSummary(recipeId);
  const toggleMutation = useToggleRecipeVisibility();
  const deleteMutation = useDeleteRecipe();
   const copyMutation = useCopyRecipeToMy();   // 🆕

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
    // 🆕 F5 — «Сохранить себе»
    const handleCopyToMy = async () => {
      if (!recipeId) return;
      try {
        const result = await copyMutation.mutateAsync(recipeId);
        enqueueSnackbar('Рецепт сохранён в мои', { variant: 'success' });
        navigate(`/recipes/${result.data.id}`, { replace: true });
      } catch (err) {
        const apiError = err as ApiError;
        enqueueSnackbar(apiError.message || 'Ошибка сохранения', {
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

                    {recipe.isMine ? (
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        sx={{ flexShrink: 0 }}
                      >
                        <Button
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => setEditOpen(true)}
                          fullWidth={isMobile}
                        >
                          Редактировать
                        </Button>
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
                    ) : (
                      <Stack
                        direction="column"
                        spacing={1}
                        sx={{
                          flexShrink: 0,
                          alignItems: { xs: 'stretch', sm: 'flex-end' },
                        }}
                      >
                        {recipe.authorUsername && (
                          <Typography variant="body2" color="text.secondary">
                            Автор: <b>{recipe.authorUsername}</b>
                          </Typography>
                        )}
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleCopyToMy}
                          disabled={copyMutation.isPending}
                          fullWidth={isMobile}
                        >
                          {copyMutation.isPending ? 'Сохранение...' : 'Сохранить себе'}
                        </Button>
                      </Stack>
                    )}
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
            {/* ============ Шаги приготовления ============ */}
            {recipe.steps && recipe.steps.length > 0 && (
              <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Шаги приготовления
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {recipe.steps.map((step, idx) => (
                    <Stack key={idx} direction="row" spacing={2}>
                      <Box
                        sx={{
                          minWidth: 28,
                          height: 28,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          flexShrink: 0,
                          mt: 0.25,
                        }}
                      >
                        {idx + 1}
                      </Box>
                      <Typography sx={{ wordBreak: 'break-word', pt: 0.25 }}>
                        {step}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            )}


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

      <RecipeFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        recipeId={recipeId}
        initialData={recipe}
      />
    </Box>
  );
}