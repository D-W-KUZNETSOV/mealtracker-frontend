import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// ============================================================
// Оборачивает защищённые маршруты.
// Если юзер не залогинен — редирект на /login,
// при этом сохраняем изначальный URL, чтобы вернуть после логина.
// ============================================================
export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}