
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import FeatureAccess from '@/components/FeatureAccess';
import DashboardMetrics from './DashboardMetrics';
import DashboardMap from './DashboardMap';
import DashboardHeader from './DashboardHeader';
import DashboardControls from './DashboardControls';
import { useDashboardInitialData } from '@/hooks/useDashboardInitialData';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';

const DashboardLayout = () => {
  const { userSubscription, isLoading: authLoading } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  
  const {
    isLoading: initialDataLoading,
    selectedYear,
    setSelectedYear,
    availableYears,
    regions
  } = useDashboardInitialData();

  const { metrics, isLoading: metricsLoading } = useDashboardMetrics(selectedRegion, selectedYear);
  
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
          isLoading={metricsLoading}
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
          isLoading={initialDataLoading || metricsLoading}
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
    </div>
  );
};

export default DashboardLayout;
