import { createTheme } from '@mui/material/styles';

// ============================================================
// Тема MUI для MealTracker.
// Пока минимальная: primary-цвет + шрифт.
// Позже можно расширить (dark mode, кастомные палитры и т.д.).
// ============================================================
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2e7d32', // зелёный — ассоциация с едой/здоровьем
    },
    secondary: {
      main: '#ff9800',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'system-ui',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});