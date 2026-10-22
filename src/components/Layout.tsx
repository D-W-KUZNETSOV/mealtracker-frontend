import { useState } from "react";
import {
  Outlet,
  useNavigate,
  Link as RouterLink,
  useLocation,
} from "react-router-dom";
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
} from "@mui/material";
import BalanceIcon from "./BalanceIcon";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import FeedbackIcon from "@mui/icons-material/Feedback"; // 🆕
import { useAuthStore } from "../store/authStore";
import UserAvatar from "./UserAvatar";
import FeedbackDialog from "./FeedbackDialog"; // 🆕
import OfflineIndicator from "./OfflineIndicator";
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import BarcodeScannerDialog from './BarcodeScannerDialog';

// Основное меню (везде)
const navItems = [
  { label: "Главная", path: "/" },
  { label: "Рецепты", path: "/recipes" },
  { label: "Ингредиенты", path: "/ingredients" },
  { label: "Дневник", path: "/diary" },
  { label: "План", path: "/meal-plan" },
  { label: "Покупки", path: "/shopping" },
  { label: "Замеры", path: "/measurements" },
  { label: "Цели", path: "/goals" },
];




export default function Layout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Состояния для меню
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [feedbackOpen, setFeedbackOpen] = useState(false); // 🆕
  const [scannerOpen, setScannerOpen] = useState(false); // 🆕 для сканера

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* ============ AppBar ============ */}
     <AppBar position="sticky" sx={{ top: 0, zIndex: 1100 }}>
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

          <BalanceIcon sx={{ mr: 1, fontSize: 28 }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              color: "inherit",
              textDecoration: "none",
              mr: 2,
              fontWeight: 600,
              flexGrow: isMobile ? 1 : 0,
            }}
          >
            Баланс
          </Typography>

          {/* Меню только на десктопе */}
          {!isMobile && (
            <Stack direction="row" spacing={0.5} sx={{ flexGrow: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  color="inherit"
                  size="small"
                  sx={{
                    textTransform: "none",
                    fontSize: { md: "0.8rem", lg: "0.875rem" },
                    px: { md: 0.75, lg: 1.25 },
                    minWidth: 0,
                    bgcolor:
                      location.pathname === item.path
                        ? "rgba(255,255,255,0.15)"
                        : "transparent",
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          )}

                    {/* Аватар + имя: на десктопе показываем имя, на мобильном только аватар */}
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center", ml: "auto" }}
                    >
                     {/* Кнопка Сканера */}
                     <IconButton
                       onClick={() => {
                         // 🆕 Если мы на странице ингредиентов и есть открытая форма (barcode в URL),
                         // принудительно закрываем её, чтобы сканер мог открыться
                         if (window.location.pathname === '/ingredients' && window.location.search.includes('barcode=')) {
                           window.history.replaceState({}, '', '/ingredients');
                           window.location.reload(); // Простой способ сбросить форму
                         }
                         setScannerOpen(true);
                       }}
                       color="inherit"
                       size="small"
                       title="Сканировать штрихкод"
                     >
                       <QrCodeScannerIcon />
                     </IconButton>

                      {/* Кнопка Справочника */}
                      <IconButton
                        onClick={() => navigate('/guide')}
                        color="inherit"
                        size="small"
                        title="Справочник"
                      >
                        <MenuBookIcon />
                      </IconButton>

                      {/* Аватар */}
                      <IconButton
                        onClick={handleUserMenuOpen}
                        color="inherit"
                        size="small"
                      >
                        <UserAvatar
                          username={user?.displayName || user?.username || "?"}
                          avatarUrl={user?.avatarUrl}
                          size={32}
                        />
                      </IconButton>

                      {!isMobile && (
                        <Typography variant="body2">
                          {user?.displayName || user?.username}
                        </Typography>
                      )}
                    </Stack>
        </Toolbar>
      </AppBar>

      {/* ============ Боковое меню (только мобильные) ============ */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 260 }} role="presentation">
          {/* Лого */}
          <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <BalanceIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Баланс
            </Typography>
          </Box>
          <Divider />

          {/* Основное меню */}
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

          {/* Доп. меню */}




          {/* Выйти */}
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
                                                <MenuItem
                                                  disabled
                                                  sx={{
                                                    bgcolor: 'primary.main',
                                                    color: 'primary.contrastText',
                                                    mb: 1,
                                                    borderRadius: 1,
                                                    opacity: 1, // зачем: убираем бледность disabled
                                                    '&.Mui-disabled': { opacity: 1 } // зачем: принудительно убираем прозрачность
                                                  }}
                                                >
                                                  <Typography
                                                    variant="subtitle2"
                                                    sx={{ fontWeight: 600, color: 'inherit' }}
                                                  >
                                                    {user?.displayName || user?.username}
                                                  </Typography>
                                                </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleUserMenuClose();
            navigate("/profile");
          }}
        >
          Профиль
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUserMenuClose();
            setFeedbackOpen(true);
          }}
        >
          <FeedbackIcon fontSize="small" sx={{ mr: 1 }} />
          Обратная связь
        </MenuItem>
        {/* 🆕 Админ-панель (только для админа) */}
                {user?.role === 'ADMIN' && (
                  <MenuItem
                    onClick={() => {
                      handleUserMenuClose();
                      navigate('/admin');
                    }}
                  >
                    Админ-панель
                  </MenuItem>
                )}
        {!isMobile && (
          <MenuItem
            onClick={() => {
              handleUserMenuClose();
              navigate("/guide");
            }}
          >
            Справочник
          </MenuItem>
        )}
        <Divider />
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
        <OfflineIndicator />
        <Outlet />
      </Container>

      {/* ============ Footer ============ */}
      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: "center",
          color: "text.secondary",
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="caption">Баланс © 2026</Typography>
      </Box>
      {/* 🆕 Диалог обратной связи */}
      <FeedbackDialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
      <BarcodeScannerDialog open={scannerOpen} onClose={() => setScannerOpen(false)} />
    </Box>
  );
}
