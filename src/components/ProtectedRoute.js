import { Navigate } from 'react-router-dom';
import { useUserRole } from '../hooks/useUserRole';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { role, loading } = useUserRole();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/sin-permisos" replace />;
  }

  return children;
};
