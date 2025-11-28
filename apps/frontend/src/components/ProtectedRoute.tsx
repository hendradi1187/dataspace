import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useRBACStore } from '@/stores/rbac-store';
import { authService } from '@/services/auth-service';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

/**
 * ProtectedRoute Component
 * Protects routes that require authentication
 * Optionally checks for required roles
 */
export const ProtectedRoute = ({
  children,
  requiredRole,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const { hasPermission } = useRBACStore();

  // Check if user is authenticated
  if (!isAuthenticated || !authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role(s)
  if (requiredRole && user) {
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = requiredRoles.includes(user.role);

    if (!hasRequiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
