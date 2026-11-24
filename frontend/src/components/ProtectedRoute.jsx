import React from 'react';
import { Navigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ROLE_ROUTES, normalizeRole } from '../config/roles';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('portalToken');
  const userRole = normalizeRole(localStorage.getItem('userRole'));

  if (token && (localStorage.getItem('mustChangePassword') === 'true' || localStorage.getItem('mustSetPassword') === 'true')) {
    return <Navigate to="/portal/change-password" replace />;
  }

  if (!token) {
    Swal.fire({
      title: 'Access Denied',
      text: 'Please login to access this page.',
      icon: 'warning',
      confirmButtonColor: '#1e3c72',
      timer: 2000
    });
    return <Navigate to="/portal/login" replace />;
  }

  if (allowedRoles && !allowedRoles.map(normalizeRole).includes(userRole)) {
    // Redirect to the role's own dashboard instead of showing an error.
    const redirectPath = ROLE_ROUTES[userRole] || '/portal/login';

    Swal.fire({
      title: 'Unauthorized',
      text: `You don't have permission to access this page. Redirecting to your dashboard.`,
      icon: 'error',
      confirmButtonColor: '#1e3c72',
      timer: 2000
    });
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
