import { useAuth } from '../../features/auth/context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
  const { user } = useAuth();
  const userPermissions = user?.role === 'admin'
    ? ['*'] // Admin tiene acceso a todo
    : user?.permissions || [];

  const hasAllPermissions = requiredPermissions.every(permission =>
    userPermissions.includes(permission) || userPermissions.includes('*')
  );

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredPermissions.length > 0 && !hasAllPermissions) {
    return <Navigate to="/dashboard" replace state={{ error: 'Acceso no autorizado' }} />;
  }

  return children;
};

export default ProtectedRoute;