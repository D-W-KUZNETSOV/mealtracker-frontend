import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Pagination,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

import { useMyRecipes, usePublicRecipes } from '../hooks/useRecipes';
import type { ApiError, RecipeListItemDto } from '../types/api';
import { roundNutrient } from '../types/api';
import RecipeFormDialog from '../components/RecipeFormDialog';

type TabKey = 'my' | 'public';

const PAGE_SIZE = 10;

export default function RecipesPage() {
  const [tab, setTab] = useState<TabKey>('my');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  const navigate = useNavigate();

  const myQuery = useMyRecipes(page - 1, PAGE_SIZE);
  const publicQuery = usePublicRecipes();

  const isMyTab = tab === 'my';
  const currentQuery = isMyTab ? myQuery : publicQuery;

  const items: RecipeListItemDto[] = isMyTab
    ? myQuery.data?.content ?? []
    : publicQuery.data ?? [];

  const totalPages = isMyTab ? myQuery.data?.totalPages ?? 0 : 0;

  const handleTabChange = (_: unknown, v: TabKey) => {
    setTab(v);
    setPage(1);
  };

  return (
    <Box>
     <Stack
       sx={{
         flexDirection: 'row',
         justifyContent: 'space-between',
         alignItems: 'center',
       }}
     >
        <Typography variant="h4">Рецепты</Typography>
        {isMyTab && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
          >
            Создать рецепт
          </Button>
        )}
      </Stack>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={handleTabChange}>
          <Tab label="Мои рецепты" value="my" />
          <Tab label="Публичные" value="public" />
        </Tabs>
      </Paper>

      {currentQuery.isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {currentQuery.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Ошибка загрузки: {(currentQuery.error as unknown as ApiError)?.message}
        </Alert>
      )}

      {!currentQuery.isLoading &&
        !currentQuery.isError &&
        items.length === 0 && (
          <Alert severity="info">
            {isMyTab
              ? 'У вас пока нет рецептов. Нажмите «Создать рецепт», чтобы добавить первый.'
              : 'Пока нет публичных рецептов.'}
          </Alert>
        )}

      {!currentQuery.isLoading && items.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 2,
          }}
        >
          {items.map((recipe) => (
            <Card key={recipe.id}>
              <CardActionArea
                onClick={() => navigate(`/recipes/${recipe.id}`)}
              >
                <CardContent>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 1,
                  }}
                >
                    <Typography variant="h6" component="div">
                      {recipe.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={recipe.visibility}
                      color={
                        recipe.visibility === 'PUBLIC' ? 'success' : 'default'
                      }
                    />
                  </Stack>

                  {recipe.category && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {recipe.category}
                    </Typography>
                  )}

                  <Typography variant="body2" color="text.secondary">
                    {recipe.totalCalories != null
                      ? `${roundNutrient(recipe.totalCalories)} ккал`
                      : '—'}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}

      {isMyTab && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            color="primary"
          />
        </Box>
      )}

      <RecipeFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />
    </Box>
  );
}