
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUp, ArrowDown, Users, Baby, TrendingUp } from 'lucide-react';

type MetricsProps = {
  isLoading: boolean;
  metrics: {
    laborForce: { value: number; trend: number };
    fertilityRate: { value: number; trend: number };
    population: { value: number; trend: number };
    topCountries: { country: string; value: number }[];
  };
};

const formatNumber = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(0);
};

const DashboardMetrics: React.FC<MetricsProps> = ({ isLoading, metrics }) => {
  if (isLoading) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-8 w-2/3 mb-1" />
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            {metrics.laborForce.trend !== 0 && (
              <div className={`flex items-center ${metrics.laborForce.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.laborForce.trend > 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                <span className="text-sm font-medium">{Math.abs(metrics.laborForce.trend).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <h3 className="mt-4 text-2xl font-bold">{formatNumber(metrics.laborForce.value)}</h3>
          <p className="text-gray-600 text-sm">Total Labor Force</p>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-100">
              <Baby className="h-5 w-5 text-pink-600" />
            </div>
            {metrics.fertilityRate.trend !== 0 && (
              <div className={`flex items-center ${metrics.fertilityRate.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.fertilityRate.trend > 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                <span className="text-sm font-medium">{Math.abs(metrics.fertilityRate.trend).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <h3 className="mt-4 text-2xl font-bold">{metrics.fertilityRate.value.toFixed(2)}</h3>
          <p className="text-gray-600 text-sm">Average Fertility Rate</p>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-100">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            {metrics.population.trend !== 0 && (
              <div className={`flex items-center ${metrics.population.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.population.trend > 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                <span className="text-sm font-medium">{Math.abs(metrics.population.trend).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <h3 className="mt-4 text-2xl font-bold">{formatNumber(metrics.population.value)}</h3>
          <p className="text-gray-600 text-sm">Total Population</p>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-100">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <h3 className="mt-4 text-lg font-bold">Top Countries</h3>
          <div className="mt-2 space-y-1">
            {metrics.topCountries.slice(0, 3).map((country, i) => (
              <div key={country.country} className="flex justify-between text-sm">
                <span className="text-gray-600">{i + 1}. {country.country}</span>
                <span className="font-medium">{formatNumber(country.value)}</span>
              </div>
            ))}
            {metrics.topCountries.length === 0 && (
              <p className="text-gray-400 text-sm">No data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default DashboardMetrics;
