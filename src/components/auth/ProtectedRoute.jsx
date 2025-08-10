import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ROLES } from '../../constants/roles';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  // Mostrar spinner mientras se verifica la autenticación
  if (loading) {
    return <LoadingSpinner />;
  }

  // Si no hay usuario autenticado, redirigir a login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene
  if (requiredRole && userProfile?.role !== requiredRole) {
    console.log('🚫 Acceso denegado:', {
      userRole: userProfile?.role,
      requiredRole: requiredRole,
      userEmail: userProfile?.email
    });
    // Redirigir a home si no tiene permisos
    return <Navigate to="/" replace />;
  }

  // Usuario autenticado y con permisos, mostrar contenido
  return children;
};

export default ProtectedRoute;
