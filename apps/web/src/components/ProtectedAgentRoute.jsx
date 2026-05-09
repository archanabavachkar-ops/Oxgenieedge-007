import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedAgentRoute({ children }) {
  const { currentUser, initialLoading } = useAuth();
  const location = useLocation();

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Allow 'agent', 'employee', or 'admin' to access the agent dashboard
  const isAgent = currentUser && ['agent', 'employee', 'admin'].includes(currentUser.role);

  if (!isAgent) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}