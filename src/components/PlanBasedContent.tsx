
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MetricCard from './MetricCard';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlanBasedContentProps {
  data: any;
  type: 'metric' | 'chart' | 'report';
  chartComponent?: React.ReactNode;
  title: string;
  value?: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const PlanBasedContent: React.FC<PlanBasedContentProps> = ({
  data,
  type,
  chartComponent,
  title,
  value,
  trend
}) => {
  const { user } = useAuth();
  const plan = user?.user_metadata?.subscription_plan || 'free';

  const showChart = plan === 'silver' || plan === 'gold';
  const showDetailedReport = plan === 'gold';

  if (type === 'metric') {
    return (
      <MetricCard
        title={title}
        value={value || 0}
        trend={trend}
      />
    );
  }

  if (type === 'chart' && !showChart) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4 h-[300px]">
          <Lock className="w-8 h-8 text-gray-400" />
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">
            Upgrade to Silver or Gold plan to access interactive charts
          </p>
          <Button variant="outline" asChild>
            <Link to="/subscriptions">Upgrade Plan</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (type === 'report' && !showDetailedReport) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
          <Lock className="w-8 h-8 text-gray-400" />
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">
            Upgrade to Gold plan to access detailed reports
          </p>
          <Button variant="outline" asChild>
            <Link to="/subscriptions">Upgrade Plan</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!chartComponent) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 flex items-center justify-center h-[300px]">
          <p className="text-labor-500">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return chartComponent;
};

export default PlanBasedContent;
