
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
import useDashboardData from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DependencyRatioMapModal } from './DependencyRatioMapModal';
import PlanBasedContent from './PlanBasedContent';

export function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const { metricData, chartData, isLoading, refresh } = useDashboardData(selectedRegion);

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
    // Refresh data with the selected year
    refresh(yearNum);
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
    : ['no-data']; // 'no-data' is a valid non-empty value

  // Effect to refresh data when year changes
  useEffect(() => {
    if (selectedYear !== null) {
      refresh(selectedYear);
    }
  }, [selectedYear]);

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
                const metricData = data as { label: string; value: string; trend: number };
                
                if (!('label' in metricData) || !('value' in metricData) || !('trend' in metricData)) {
                  return null;
                }
                
                return (
                  <PlanBasedContent
                    key={key}
                    type="metric"
                    title={metricData.label}
                    value={metricData.value}
                    trend={{
                      value: metricData.trend,
                      isPositive: key === 'dependencyRatio' ? metricData.trend < 0 : metricData.trend > 0
                    }}
                    data={metricData}
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
                  : latestYear?.toString() || 'no-data'
              }
              onValueChange={handleYearChange}
              disabled={yearOptions.length === 0 || yearOptions[0] === 'no-data'}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions[0] !== 'no-data' ? (
                  yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year.toString()}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-data">No data available</SelectItem>
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
    </div>
  );
}

export default Dashboard;
