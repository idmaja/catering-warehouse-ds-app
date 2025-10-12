import { Navigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { authService } from '../services/api';

export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = useMemo(() => authService.isAuthenticated(), []);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};