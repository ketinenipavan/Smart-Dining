import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import type { UserRole } from '../types';

interface Props {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<Props> = ({
  children,
  allowedRoles,
  redirectPath,
}) => {
  const { user, isAuthenticated, isLoading, initAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-maroon-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-stone-600">Verifying Restaurant Staff Credentials...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated || !user) {
    const defaultRedirect = location.pathname.startsWith('/admin') ? '/admin/login' : '/kitchen/login';
    return <Navigate to={redirectPath || defaultRedirect} state={{ from: location }} replace />;
  }

  // Check role authorization (admin can access everything)
  const isAuthorized = allowedRoles.includes(user.role) || user.role === 'admin';

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] p-4">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 max-w-md w-full shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto font-bold text-xl">
            !
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">Sector Access Restricted</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Your current account (<strong>{user.email}</strong> - role: <em>{user.role}</em>) does not have clearance for this operational sector.
          </p>
          <div className="pt-2">
            <Navigate to={user.role === 'kitchen' ? '/kitchen' : '/'} replace />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
