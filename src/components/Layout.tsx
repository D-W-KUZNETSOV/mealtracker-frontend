import { Outlet, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
  Stack,
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import { useAuthStore } from '../store/authStore';
import UserAvatar from './UserAvatar';

// Пункты меню навигации
const navItems = [
  { label: 'Рецепты', path: '/recipes' },
  { label: 'Ингредиенты', path: '/ingredients' },
  { label: 'Дневник', path: '/diary' },
  { label: 'Цели', path: '/goals' },
  { label: 'Профиль', path: '/profile' },
];

export default function Layout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ============ AppBar ============ */}
      <AppBar position="static">
        <Toolbar>
          <RestaurantMenuIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/recipes"
            sx={{
              color: 'inherit',
              textDecoration: 'none',
              mr: 4,
              fontWeight: 600,
            }}
          >
            MealTracker
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={RouterLink}
                to={item.path}
                color="inherit"
                sx={{
                  textTransform: 'none',
                  bgcolor:
                    location.pathname === item.path
                      ? 'rgba(255,255,255,0.15)'
                      : 'transparent',
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mr: 2 }}>
            <UserAvatar username={user?.username ?? '?'} size={32} />
            <Typography variant="body2">{user?.username}</Typography>
          </Stack>
          <Button color="inherit" onClick={handleLogout}>
            Выйти
          </Button>
        </Toolbar>
      </AppBar>

      {/* ============ Контент страницы ============ */}
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>

      {/* ============ Footer (опционально) ============ */}
      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: 'center',
          color: 'text.secondary',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption">
          MealTracker © 2026
        </Typography>
      </Box>
    </Box>
  );
}