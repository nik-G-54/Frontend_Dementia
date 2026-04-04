import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Allows access if user has a token (real or demo).
 */
export default function PrivateRoute() {
  const token = localStorage.getItem('token');
  const mode = localStorage.getItem('mode');
  // Allow through if real token OR demo mode
  return (token || mode === 'demo') ? <Outlet /> : <Navigate to="/login" replace />;
}
