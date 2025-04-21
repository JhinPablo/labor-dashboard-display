
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';

const DashboardPage = () => {
  const { user, isLoading } = useAuth();

  // If loading, show a loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  // If not authenticated, show limited version with upgrade prompt
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="py-4 mb-6">
          <h1 className="text-2xl font-bold text-labor-900">Labor Market Dashboard</h1>
          <p className="text-labor-500 mt-1">
            Track employment trends and forecast market changes
          </p>
        </div>
        
        <Card className="bg-white shadow-md border-labor-200">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-6">
            <Lock className="w-12 h-12 text-labor-400" />
            <h2 className="text-xl font-bold text-labor-900">Dashboard Access Restricted</h2>
            <p className="max-w-lg text-labor-600">
              Sign in to access the Labor Market Dashboard with detailed metrics and charts. 
              Create a free account to get started or upgrade to our premium plans for more advanced features.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/subscriptions">View Plans</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <DashboardLayout />;
};

export default DashboardPage;
