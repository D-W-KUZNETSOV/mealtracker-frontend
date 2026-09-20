import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function RecipesPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4">MealTracker</Typography>
        <Box>
          <Typography variant="body2" component="span" sx={{ mr: 2 }}>
            Привет, {user?.username}!
          </Typography>
          <Button variant="outlined" onClick={handleLogout}>
            Выйти
          </Button>
        </Box>
      </Stack>

      <Typography variant="body1" color="text.secondary">
        Здесь будут рецепты. Пока — заглушка, чтобы проверить
        авторизацию end-to-end.
      </Typography>
    </Container>
  );
}