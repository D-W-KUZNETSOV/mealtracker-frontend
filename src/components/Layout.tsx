import { useState } from 'react';
import { Outlet, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Состояния для меню
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ============ AppBar ============ */}
      <AppBar position="static">
        <Toolbar>
          {/* Бургер только на мобильных */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

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
              flexGrow: isMobile ? 1 : 0,
            }}
          >
            MealTracker
          </Typography>

          {/* Меню только на десктопе */}
          {!isMobile && (
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
          )}

          {/* Аватар + имя: на десктопе показываем имя, на мобильном только аватар */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', ml: 'auto' }}>
            <IconButton onClick={handleUserMenuOpen} color="inherit" size="small">
              <UserAvatar username={user?.username ?? '?'} size={32} />
            </IconButton>
            {!isMobile && (
              <Typography variant="body2">{user?.username}</Typography>
            )}
          </Stack>

          {/* Кнопка «Выйти» только на десктопе */}
          {!isMobile && (
            <Button color="inherit" onClick={handleLogout} sx={{ ml: 1 }}>
              Выйти
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* ============ Боковое меню (только мобильные) ============ */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 260 }} role="presentation">
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <RestaurantMenuIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              MealTracker
            </Typography>
          </Box>
          <Divider />
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={location.pathname === item.path}
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  setDrawerOpen(false);
                  handleLogout();
                }}
              >
                <LogoutIcon sx={{ mr: 1 }} />
                <ListItemText primary="Выйти" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* ============ Меню пользователя (клик по аватару) ============ */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
      >
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">
            {user?.username}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleUserMenuClose();
            navigate('/profile');
          }}
        >
          Профиль
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUserMenuClose();
            handleLogout();
          }}
        >
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
          Выйти
        </MenuItem>
      </Menu>

      {/* ============ Контент страницы ============ */}
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>

      {/* ============ Footer ============ */}
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
        <Typography variant="caption">MealTracker © 2026</Typography>
      </Box>
    </Box>
  );
}