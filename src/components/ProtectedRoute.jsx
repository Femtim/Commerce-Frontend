import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, setActiveModal } = useShop();

  if (!user) {
    setActiveModal('auth');
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}