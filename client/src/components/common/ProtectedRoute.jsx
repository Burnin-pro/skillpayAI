import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles } from 'lucide-react';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { addToast } = useToast();

  useEffect(() => {
    if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      if (user.role === 'provider') {
        addToast('That page is for clients.', 'info');
      } else if (user.role === 'customer') {
        addToast('That page is for freelancers.', 'info');
      }
    }
  }, [loading, user, allowedRoles, addToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-ai-violet animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dashboard = user.role === 'customer' ? '/customer' : user.role === 'provider' ? '/freelancer' : '/admin';
    return <Navigate to={dashboard} replace />;
  }

  return children;
}

export const RoleRoute = ProtectedRoute;

