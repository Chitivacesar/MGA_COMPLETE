import { useAuth } from '../../features/auth/context/AuthContext';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  // Si el usuario está autenticado, redirigir al Dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si el usuario no está autenticado, mostrar el contenido público
  return children;
};

export default PublicRoute;