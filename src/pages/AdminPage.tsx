import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../api/client';
import type { RecipeDto } from '../types/api'; // (или как у тебя называется тип рецепта)

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const [recipes, setRecipes] = useState<RecipeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // зачем: загружаем публичные рецепты (только если админ)
    if (user?.role !== 'ADMIN') return;

    apiClient.get<RecipeDto[]>('/api/recipes/public')
      .then((res) => setRecipes(res.data))
      .catch((err) => setError(err.message || 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить этот рецепт?')) return;
    try {
      await apiClient.delete(`/api/recipes/${id}`);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert('Ошибка удаления');
    }
  };

  if (user?.role !== 'ADMIN') {
    return <Alert severity="error">Доступ запрещён. Вы не администратор.</Alert>;
  }

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Админ-панель</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Публичные рецепты (всего: {recipes.length})
      </Typography>

      <List>
        {recipes.map((r) => (
          <ListItem key={r.id} secondaryAction={
            <IconButton edge="end" onClick={() => handleDelete(r.id)}>
              <DeleteIcon color="error" />
            </IconButton>
          }>
            <ListItemText
              primary={r.name}
                            secondary={
                              <span>
                                Автор: {(r as any).username || '—'} · {Math.round((r as any).caloriesPer100g || (r as any).calories || 0)} ккал/100г
                              </span>
                            }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}