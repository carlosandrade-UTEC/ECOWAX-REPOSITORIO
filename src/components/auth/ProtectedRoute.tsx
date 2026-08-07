import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { ModuloApp } from '../../types';

interface ProtectedRouteProps {
  modulo: ModuloApp;
  children: React.ReactNode;
}

/**
 * Componente de Protección de Rutas basado en Roles y Permisos de cfg_roles_permisos.
 * Redirige a /login si no hay sesión activa, o a /dashboard con un mensaje si el permiso es NINGUNO.
 */
export function ProtectedRoute({ modulo, children }: ProtectedRouteProps) {
  const { currentUser, getPermiso } = useAppStore();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const permiso = getPermiso(modulo);
  if (permiso === 'NINGUNO') {
    return (
      <Navigate
        to="/dashboard"
        state={{
          errorAcceso: `Acceso no autorizado: Su perfil (${currentUser.rol}) no cuenta con permisos para acceder al módulo "${modulo}".`,
        }}
        replace
      />
    );
  }

  return <>{children}</>;
}
