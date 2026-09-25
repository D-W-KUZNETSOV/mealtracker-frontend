import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

// Публичные страницы — грузим сразу (нужны на старте)
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Ленивые страницы — грузятся по требованию
const RecipesPage = lazy(() => import('./pages/RecipesPage'));
const RecipeDetailPage = lazy(() => import('./pages/RecipeDetailPage'));
const IngredientsPage = lazy(() => import('./pages/IngredientsPage'));
const DiaryPage = lazy(() => import('./pages/DiaryPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Красивый фолбэк во время загрузки чанка
function PageLoader() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Публичные страницы (без Layout) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Защищённые страницы (внутри Layout) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
            <Route path="/ingredients" element={<IngredientsPage />} />
            <Route path="/diary" element={<DiaryPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Редиректы */}
        <Route path="/" element={<Navigate to="/recipes" replace />} />
        <Route path="*" element={<Navigate to="/recipes" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;