
import React from 'react';
import { Dashboard } from '@/components/Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="py-4">
        <h1 className="text-2xl font-bold text-labor-900">Labor Market Dashboard</h1>
        <p className="text-labor-500 mt-1">
          Track employment trends and forecast market changes
        </p>
      </div>
      <Dashboard />
    </div>
  );
};

export default DashboardPage;
