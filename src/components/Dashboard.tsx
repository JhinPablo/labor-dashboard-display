
import React, { useState } from 'react';
import { 
  Users, 
  CircleUser, 
  LineChart as LineChartIcon,
  BarChart,
  Map
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

export function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const { metricData, chartData, isLoading } = useDashboardData(selectedRegion);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedCountry('all'); // Reset country filter when region changes
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year));
  };

  // Get the latest year from chart data
  const latestYear = chartData.years && chartData.years.length > 0 
    ? Math.max(...chartData.years)
    : new Date().getFullYear();

  // If no year is selected, use the latest year
  const effectiveYear = selectedYear || latestYear;

  // Filter countries based on selected region
  const availableCountries = selectedRegion === 'all' 
    ? chartData.countries 
    : chartData.countries.filter(country => country.un_region === selectedRegion);

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
          <MetricCard
            title="Total Population"
            value={metricData.populationTotal.value}
            icon={<Users className="h-6 w-6" />}
            trend={{ 
              value: metricData.populationTotal.trend, 
              isPositive: metricData.populationTotal.trend >= 0 
            }}
          />
          <MetricCard
            title="Labor Force Rate"
            value={metricData.laborForceRate.value}
            icon={<BarChart className="h-6 w-6" />}
            trend={{ 
              value: metricData.laborForceRate.trend, 
              isPositive: metricData.laborForceRate.trend >= 0 
            }}
          />
          <MetricCard
            title="Fertility Rate"
            value={metricData.fertilityRate.value}
            icon={<LineChartIcon className="h-6 w-6" />}
            trend={{ 
              value: metricData.fertilityRate.trend, 
              isPositive: metricData.fertilityRate.trend >= 0 
            }}
          />
          <MetricCard
            title="Dependency Ratio"
            value={metricData.dependencyRatio.value}
            icon={<CircleUser className="h-6 w-6" />}
            trend={{ 
              value: metricData.dependencyRatio.trend, 
              isPositive: metricData.dependencyRatio.trend < 0  // Lower dependency ratio is generally considered positive
            }}
          />
        </div>
      </section>
      
      {/* Demographic Analysis Section */}
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
              value={effectiveYear?.toString() || ''} 
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {chartData.years && chartData.years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Fertility Trend Chart */}
          <Card className="bg-white rounded-lg border shadow">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">Fertility Trend</h3>
              <div className="h-[350px]">
                <FertilityTrendChart 
                  data={chartData.fertilityData} 
                  selectedCountry={selectedCountry}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dependency Ratio Map */}
          <Card className="bg-white rounded-lg border shadow">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">Dependency Ratio by Country</h3>
              <div className="h-[350px]">
                <DependencyRatioMap
                  data={chartData.dependencyRatioData}
                  year={effectiveYear}
                  icon={<Map className="h-6 w-6 text-labor-500" />}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Population Pyramid */}
          <Card className="bg-white rounded-lg border shadow">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">Population Pyramid</h3>
              <div className="h-[450px]">
                <PopulationPyramidChart
                  data={chartData.populationPyramidData}
                  selectedCountry={selectedCountry}
                  year={effectiveYear}
                />
              </div>
            </CardContent>
          </Card>

          {/* Labor Force by Gender */}
          <Card className="bg-white rounded-lg border shadow">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">Labor Force by Gender</h3>
              <div className="h-[450px]">
                <LaborForceByGenderChart 
                  data={chartData.laborForceData} 
                  selectedCountry={selectedCountry}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
