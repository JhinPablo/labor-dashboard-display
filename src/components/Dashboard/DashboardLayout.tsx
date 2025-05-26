
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import FeatureAccess from '@/components/FeatureAccess';
import DashboardMetrics from './DashboardMetrics';
import DashboardMap from './DashboardMap';
import DashboardHeader from './DashboardHeader';
import DashboardControls from './DashboardControls';
import useDashboardAPI from '@/hooks/useDashboardAPI';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DashboardLayout = () => {
  const { userSubscription, isLoading: authLoading } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<number>(2020);
  
  const { data, isLoading, error } = useDashboardAPI(selectedRegion, selectedYear);

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
  };
  
  const handleYearChange = (value: string) => {
    setSelectedYear(parseInt(value));
  };

  if (authLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className="container p-8 max-w-7xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading dashboard data: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const regions = data?.chartData.regions || [];
  const availableYears = data?.chartData.years || [2018, 2019, 2020, 2021, 2022];

  // Transform metrics for DashboardMetrics component
  const metrics = data ? {
    laborForce: { 
      value: parseFloat(data.metrics.laborForceRate.value.replace('M', '')) * 1000000,
      trend: data.metrics.laborForceRate.trend 
    },
    fertilityRate: { 
      value: parseFloat(data.metrics.fertilityRate.value),
      trend: data.metrics.fertilityRate.trend 
    },
    population: { 
      value: parseFloat(data.metrics.populationTotal.value.replace('M', '')) * 1000000,
      trend: data.metrics.populationTotal.trend 
    },
    topCountries: data.chartData.countries
      .sort((a, b) => {
        // Sort by some metric - we'll use a simple alphabetical sort for now
        return a.geo.localeCompare(b.geo);
      })
      .slice(0, 3)
      .map(country => ({
        country: country.geo,
        value: 0 // This would need to be calculated from actual data
      }))
  } : {
    laborForce: { value: 0, trend: 0 },
    fertilityRate: { value: 0, trend: 0 },
    population: { value: 0, trend: 0 },
    topCountries: []
  };

  return (
    <div className="container p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <DashboardHeader />
        
        <DashboardControls
          selectedRegion={selectedRegion}
          selectedYear={selectedYear}
          regions={regions}
          availableYears={availableYears}
          onRegionChange={handleRegionChange}
          onYearChange={handleYearChange}
        />
      </div>

      {/* KPI metrics section - available to all plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardMetrics 
          isLoading={isLoading}
          metrics={metrics} 
        />
      </div>

      {/* Interactive map section - requires Silver or Gold plan */}
      <FeatureAccess
        requiredPlan="silver"
        title="Interactive Labor Force Map"
        description="Upgrade to Silver or Gold plan to access the interactive map with detailed regional data"
      >
        <DashboardMap 
          isLoading={isLoading}
          selectedYear={selectedYear}
          selectedRegion={selectedRegion}
        />
      </FeatureAccess>

      {/* Predictions section - requires Gold plan */}
      <FeatureAccess
        requiredPlan="gold"
        title="Advanced Labor Predictions"
        description="Upgrade to Gold plan to access predictive analytics and forecasts"
      >
        <Card>
          <CardHeader>
            <CardTitle>Labor Force Predictions</CardTitle>
          </CardHeader>
          <CardContent className="h-96">
            <div className="flex items-center justify-center h-full">
              <p className="text-labor-600">Detailed predictions are available in the Predictions tab</p>
            </div>
          </CardContent>
        </Card>
      </FeatureAccess>

      {/* Data Summary */}
      {data && !isLoading && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Data Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
              <div>
                <span className="font-medium">Region:</span> {data.metadata.selectedRegion === 'all' ? 'All Regions' : data.metadata.selectedRegion}
              </div>
              <div>
                <span className="font-medium">Year:</span> {data.metadata.selectedYear}
              </div>
              <div>
                <span className="font-medium">Countries:</span> {data.metadata.totalCountries}
              </div>
              <div>
                <span className="font-medium">Data Points:</span> {Object.values(data.metadata.dataPoints).reduce((a, b) => a + b, 0)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardLayout;
