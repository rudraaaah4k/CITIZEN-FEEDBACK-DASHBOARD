import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types';
import { FullPageSpinner } from '../ui/Spinner';

export const ProtectedRoute = ({ roles }: { roles?: UserRole[] }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export const PublicOnlyRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'citizen' ? '/dashboard' : '/admin/dashboard'} replace />;
  }
  return <Outlet />;
};

// Same redirect behavior as PublicOnlyRoute, used specifically for the landing page ("/")
// so logged-in users land on their dashboard instead of the marketing homepage.
export const HomeRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'citizen' ? '/dashboard' : '/admin/dashboard'} replace />;
  }
  return <Outlet />;
};
