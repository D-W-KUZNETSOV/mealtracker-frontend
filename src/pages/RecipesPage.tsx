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
  Collapse,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useNavigate } from 'react-router-dom';

import { useMyRecipes, usePublicRecipes } from '../hooks/useRecipes';
import type { ApiError, RecipeListItemDto } from '../types/api';
import { roundNutrient } from '../types/api';
import { useDebounce } from '../hooks/useDebounce';
import RecipeFormDialog from '../components/RecipeFormDialog';

type TabKey = 'my' | 'public';
type SortKey =
  | 'name,asc'
  | 'name,desc'
  | 'calories,asc'
  | 'calories,desc'
  | 'protein,asc'
  | 'protein,desc';

const PAGE_SIZE = 10;

const CATEGORIES = [
  { value: '', label: 'Все' },
  { value: 'BREAKFAST', label: 'Завтрак' },
  { value: 'LUNCH', label: 'Обед' },
  { value: 'DINNER', label: 'Ужин' },
  { value: 'SNACK', label: 'Перекус' },
  { value: 'DESSERT', label: 'Десерт' },
  { value: 'DRINK', label: 'Напиток' },
];

export default function RecipesPage() {
  const [tab, setTab] = useState<TabKey>('my');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  // Фильтры
  const [queryStr, setQueryStr] = useState('');
  const [category, setCategory] = useState<string>('');
  const [minCalories, setMinCalories] = useState<string>('');
  const [maxCalories, setMaxCalories] = useState<string>('');
  const [minProtein, setMinProtein] = useState<string>('');
  const [sort, setSort] = useState<SortKey>('name,asc');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedQuery = useDebounce(queryStr, 300);
  const navigate = useNavigate();

  const filters = {
    query: debouncedQuery || undefined,
    category: category || undefined,
    minCalories: minCalories ? Number(minCalories) : undefined,
    maxCalories: maxCalories ? Number(maxCalories) : undefined,
    minProtein: minProtein ? Number(minProtein) : undefined,
    sort,
  };

  const myQuery = useMyRecipes(page - 1, PAGE_SIZE, filters);
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

  const handleResetFilters = () => {
    setQueryStr('');
    setCategory('');
    setMinCalories('');
    setMaxCalories('');
    setMinProtein('');
    setSort('name,asc');
    setPage(1);
  };

  const hasActiveFilters =
    queryStr ||
    category ||
    minCalories ||
    maxCalories ||
    minProtein ||
    sort !== 'name,asc';

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

      {/* Поиск */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Поиск по названию..."
          value={queryStr}
          onChange={(e) => {
            setQueryStr(e.target.value);
            setPage(1);
          }}
          slotProps={{ htmlInput: { inputMode: 'search' } }}
        />
        <Button
          variant={showFilters ? 'contained' : 'outlined'}
          startIcon={<FilterListIcon />}
          onClick={() => setShowFilters((v) => !v)}
          sx={{ flexShrink: 0 }}
        >
          Фильтры
        </Button>
        {hasActiveFilters && (
          <Button
            variant="text"
            color="error"
            startIcon={<ClearIcon />}
            onClick={handleResetFilters}
            sx={{ flexShrink: 0 }}
          >
            Сбросить
          </Button>
        )}
      </Stack>

      {/* Чипы категорий */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}
      >
        <ToggleButtonGroup
        sx={{ flexWrap: 'wrap', gap: 0.5 }}
          size="small"
          exclusive
          value={category}
          onChange={(_, v) => {
            if (v !== null) {
              setCategory(v);
              setPage(1);
            }
          }}
        >
          {CATEGORIES.map((c) => (
            <ToggleButton key={c.value} value={c.value}>
              {c.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      {/* Панель фильтров */}
      <Collapse in={showFilters}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Калории от"
              type="number"
              size="small"
              value={minCalories}
              onChange={(e) => setMinCalories(e.target.value)}
              onFocus={(e) => e.target.select()}
              slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' } }}
            />
            <TextField
              label="Калории до"
              type="number"
              size="small"
              value={maxCalories}
              onChange={(e) => setMaxCalories(e.target.value)}
              onFocus={(e) => e.target.select()}
              slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' } }}
            />
            <TextField
              label="Белок от, г"
              type="number"
              size="small"
              value={minProtein}
              onChange={(e) => setMinProtein(e.target.value)}
              onFocus={(e) => e.target.select()}
              slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' } }}
            />
            <TextField
              select
              label="Сортировка"
              size="small"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              sx={{ minWidth: 200 }}
            >
                           <MenuItem value="name,asc">Название (А-Я)</MenuItem>
                           <MenuItem value="name,desc">Название (Я-А)</MenuItem>
                           <MenuItem value="calories,asc">Калории (↑)</MenuItem>
                           <MenuItem value="calories,desc">Калории (↓)</MenuItem>
                           <MenuItem value="protein,asc">Белок (↑)</MenuItem>
                           <MenuItem value="protein,desc">Белок (↓)</MenuItem>
            </TextField>
          </Stack>
        </Paper>
      </Collapse>

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
              ? hasActiveFilters
                ? 'По фильтрам ничего не найдено.'
                : 'У вас пока нет рецептов. Нажмите «Создать рецепт», чтобы добавить первый.'
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