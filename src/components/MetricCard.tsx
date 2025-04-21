import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend }) => {
  return (
    <Card className="bg-white shadow-sm rounded-lg">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">{title}</span>
          {icon}
        </div>
        <div className="text-2xl font-semibold text-gray-800">
          {typeof value === 'object' ? JSON.stringify(value) : value}
        </div>
        {trend && (
          <div className="text-sm flex items-center gap-1">
            <span className={
              (title.toLowerCase().includes('dependency') ? trend.value < 0 : trend.value > 0)
                ? 'text-green-600' : 'text-red-600'
            }>
              {trend.value > 0 ? '▲' : trend.value < 0 ? '▼' : ''} {Math.abs(trend.value).toFixed(1)}%
            </span>
            <span className="text-gray-500">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;