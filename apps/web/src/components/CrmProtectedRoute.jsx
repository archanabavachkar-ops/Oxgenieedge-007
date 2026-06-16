
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Loader2 } from 'lucide-react';

const CrmProtectedRoute = ({ children, allowedRoles = ['admin', 'ceo', 'sales manager', 'sales agent', 'viewer', 'manager', 'employee'] }) => {
  const { currentAdmin, isAdminLoggedIn, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Fire a console log to verify the auth check is running
    console.log('[CrmProtectedRoute] Auth verification running...');
    console.log('[CrmProtectedRoute] Path:', location.pathname);
    console.log('[CrmProtectedRoute] Admin Logged In:', isAdminLoggedIn);
    console.log('[CrmProtectedRoute] Current Admin:', currentAdmin);
  }, [isAdminLoggedIn, currentAdmin, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // 1. Verify Admin Authentication Status
  const storedAdmin =
    JSON.parse(localStorage.getItem('adminUser'));

const admin =
    currentAdmin || storedAdmin;

if (
    !isAdminLoggedIn &&
    !currentAdmin &&
    !storedAdmin
) {
    console.log(
        '[CrmProtectedRoute] Unauthorized access attempt.'
    );

    return (
        <Navigate
            to="/admin/login"
            replace
        />
    );
}

const userRole =
    admin?.role?.toLowerCase() || 'viewer';

const allowedRolesLower =
    allowedRoles.map(r => r.toLowerCase());

if (
    !allowedRolesLower.includes(userRole)
) {
    console.warn(
        `[CrmProtectedRoute] Forbidden role: ${userRole}`
    );

    return (
        <Navigate
            to="/admin/crm/dashboard"
            replace
        />
    );
}

return children;
};

export default CrmProtectedRoute;
