
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CircleUser, 
  LineChart as LineChartIcon,
  BarChart,
  Map,
  Loader
} from 'lucide-react';
import MetricCard from './MetricCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FertilityTrendChart,
  PopulationPyramidChart,
  DependencyRatioMap,
  LaborForceByGenderChart
} from './DashboardCharts';
import { Card, CardContent } from '@/components/ui/card';
import useDashboardAPI from '@/hooks/useDashboardAPI';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DependencyRatioMapModal } from './DependencyRatioMapModal';
import PlanBasedContent from './PlanBasedContent';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
  const { data, metricData, chartData, isLoading, error, refresh } = useDashboardAPI(
    selectedRegion, 
    selectedYear || undefined, 
    selectedCountry
  );

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedCountry('all'); // Reset country filter when region changes
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
  };

  const handleYearChange = (year: string) => {
    const yearNum = parseInt(year);
    setSelectedYear(yearNum);
  };

  // Get the latest year from chart data
  const latestYear = chartData.years && chartData.years.length > 0 
    ? chartData.years[chartData.years.length - 1]
    : null;

  // If no year is selected, use the latest year
  const effectiveYear = selectedYear || latestYear || 0;

  // Filter countries based on selected region
  const availableCountries = selectedRegion === 'all' 
    ? chartData.countries 
    : chartData.countries.filter(country => country.un_region === selectedRegion);

  // Ensure we have at least one value for the year dropdown
  const yearOptions = chartData.years && chartData.years.length > 0 
    ? chartData.years
    : [];

  // Display error if any
  if (error && !isLoading) {
    return (
      <div className="space-y-8 p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading dashboard data: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 animate-fade-in">
      {/* Overview Section */}
      <section>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-medium text-labor-800">Overview</h2>
          <div className="flex items-center gap-2">
            <Select value={selectedRegion} onValueChange={handleRegionChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {chartData.regions && chartData.regions.map((region) => (
                  region.region && region.region.trim() !== '' && region.region !== 'Western Asia' ? (
                    <SelectItem key={region.region} value={region.region}>
                      {region.region}
                    </SelectItem>
                  ) : null
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-animation">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="bg-white shadow-sm">
                <CardContent className="p-4">
                  <Skeleton className="h-16 w-full rounded mb-2" />
                  <Skeleton className="h-6 w-3/4 rounded" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {Object.entries(metricData).map(([key, data]) => {
                // Skip the isLoading property
                if (key === 'isLoading') return null;
                
                // Type guard to ensure we have a valid metric object
                if (!data || typeof data !== 'object' || data === null || typeof data === 'boolean') {
                  return null;
                }
                
                // Safe access to properties with proper type assertions
                const metricInfo = data as { label: string; value: string; trend: number };
                
                if (!('label' in metricInfo) || !('value' in metricInfo) || !('trend' in metricInfo)) {
                  return null;
                }
                
                return (
                  <PlanBasedContent
                    key={key}
                    type="metric"
                    title={metricInfo.label}
                    value={metricInfo.value}
                    trend={{
                      value: metricInfo.trend,
                      isPositive: key === 'dependencyRatio' ? metricInfo.trend < 0 : metricInfo.trend > 0
                    }}
                    data={metricInfo}
                  />
                );
              })}
            </>
          )}
        </div>
      </section>
      
      {/* Charts Section */}
      <section className="space-y-5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-medium text-labor-800">Demographic Analysis</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select 
              value={selectedCountry} 
              onValueChange={handleCountryChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {availableCountries && availableCountries.map((country) => (
                  country.geo && country.geo.trim() !== '' ? (
                    <SelectItem key={country.geo} value={country.geo}>
                      {country.geo}
                    </SelectItem>
                  ) : null
                ))}
              </SelectContent>
            </Select>

            <Select
              value={
                selectedYear !== null
                  ? selectedYear.toString()
                  : latestYear?.toString() || ''
              }
              onValueChange={handleYearChange}
              disabled={yearOptions.length === 0}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.length > 0 ? (
                  yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year.toString()}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>No data available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <PlanBasedContent
            type="chart"
            title="Fertility Trend"
            data={chartData.fertilityData}
            chartComponent={
              <FertilityTrendChart 
                data={chartData.fertilityData} 
                selectedCountry={selectedCountry}
              />
            }
          />

          <PlanBasedContent
            type="chart"
            title="Dependency Ratio by Country"
            data={chartData.dependencyRatioData}
            chartComponent={
              <DependencyRatioMap 
                data={chartData.dependencyRatioData}
                year={effectiveYear}
              />
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <PlanBasedContent
            type="chart"
            title="Population Pyramid"
            data={chartData.populationPyramidData}
            chartComponent={
              <PopulationPyramidChart
                data={chartData.populationPyramidData}
                selectedCountry={selectedCountry}
                year={effectiveYear}
              />
            }
          />

          <PlanBasedContent
            type="chart"
            title="Labor Force by Gender"
            data={chartData.laborForceData}
            chartComponent={
              <LaborForceByGenderChart 
                data={chartData.laborForceData} 
                selectedCountry={selectedCountry}
              />
            }
          />
        </div>

        {/* Detailed Reports Section (Gold Plan Only) */}
        <div className="mt-8">
          <PlanBasedContent
            type="report"
            title="Custom Detailed Report"
            data={null}
            chartComponent={
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Detailed Analysis Report</h3>
                  <p className="text-labor-600">
                    Access comprehensive labor market analysis and future projections with our Gold Plan.
                  </p>
                </CardContent>
              </Card>
            }
          />
        </div>
      </section>

      {/* Data Summary */}
      {data && !isLoading && (
        <section className="mt-8">
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
        </section>
      )}
    </div>
  );
}

export default Dashboard;
