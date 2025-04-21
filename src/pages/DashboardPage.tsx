
import React from 'react';
import { Dashboard } from '@/components/Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();

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
