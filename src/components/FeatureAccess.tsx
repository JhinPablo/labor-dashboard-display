
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureAccessProps {
  requiredPlan: 'silver' | 'gold';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  title?: string;
  description?: string;
}

const FeatureAccess: React.FC<FeatureAccessProps> = ({
  requiredPlan,
  children,
  fallback,
  title,
  description
}) => {
  const { userSubscription, isLoading } = useAuth();
  
  // Define subscription levels for comparison
  const planLevels = {
    'free': 0,
    'silver': 1,
    'gold': 2
  };
  
  const requiredLevel = planLevels[requiredPlan];
  const userLevel = planLevels[userSubscription || 'free'];
  
  // If user has sufficient plan level, show the content
  if (userLevel >= requiredLevel) {
    return <>{children}</>;
  }
  
  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Default locked feature view
  return (
    <Card className="h-full">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4 h-full">
        <Lock className="w-8 h-8 text-gray-400" />
        <h3 className="font-medium text-labor-900">{title || `${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} Plan Feature`}</h3>
        <p className="text-sm text-gray-500">
          {description || `Upgrade to ${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} plan to access this feature`}
        </p>
        <Button variant="outline" asChild>
          <Link to="/subscriptions">Upgrade Plan</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeatureAccess;
