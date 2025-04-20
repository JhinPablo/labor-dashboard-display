
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CircleUser, 
  LineChart as LineChartIcon,
  BarChart,
  Map,
  AlertCircle
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
  FertilityRateChart,
  PopulationPyramidChart,
  DependencyRatioMap,
  LaborForceChart
} from './DemographicCharts';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import useDashboardData from '@/hooks/useDashboardData';
import { testConnection } from '@/lib/supabaseClient';

export function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [debugMode, setDebugMode] = useState<boolean>(true);
  const [supabaseStatus, setSupabaseStatus] = useState<boolean | null>(null);
  
  const { metricData, chartData, isLoading, error, refresh } = useDashboardData(selectedRegion);

  useEffect(() => {
    // Test Supabase connection on component mount
    const checkSupabase = async () => {
      const status = await testConnection();
      setSupabaseStatus(status);
      console.log("Supabase connection status:", status);
    };
    
    checkSupabase();
  }, []);

  const handleRegionChange = (region: string) => {
    console.log("Region changed to:", region);
    setSelectedRegion(region);
    setSelectedCountry('all'); // Reset country filter when region changes
  };

  const handleCountryChange = (country: string) => {
    console.log("Country changed to:", country);
    setSelectedCountry(country);
  };

  const handleYearChange = (year: string) => {
    console.log("Year changed to:", year);
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
      {/* Debug Panel */}
      {debugMode && (
        <Card className="bg-yellow-50 border-yellow-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-yellow-800 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Debug Panel
              </h3>
              <button 
                className="text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded"
                onClick={() => setDebugMode(false)}>
                Hide
              </button>
            </div>
            <div className="mt-3 text-sm space-y-2 bg-white p-3 rounded">
              <div><strong>Supabase Connection:</strong> {supabaseStatus === null ? 'Checking...' : (supabaseStatus ? 'Connected ✅' : 'Failed ❌')}</div>
              <div><strong>Loading State:</strong> {isLoading ? 'Loading... ⏳' : 'Complete ✅'}</div>
              <div><strong>Error:</strong> {error ? `❌ ${error}` : 'None ✅'}</div>
              <div><strong>Selected Region:</strong> {selectedRegion}</div>
              <div><strong>Selected Country:</strong> {selectedCountry}</div>
              <div><strong>Selected Year:</strong> {effectiveYear}</div>
              <div><strong>Available Years:</strong> {chartData.years.length}</div>
              <div><strong>Available Countries:</strong> {chartData.countries.length}</div>
              <div className="mt-3">
                <button 
                  className="text-xs bg-blue-500 text-white hover:bg-blue-600 px-2 py-1 rounded"
                  onClick={refresh}>
                  Refresh Data
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error display */}
      {error && !debugMode && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <button 
              className="ml-4 text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded"
              onClick={() => setDebugMode(true)}>
              Show Debug Panel
            </button>
          </AlertDescription>
        </Alert>
      )}

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
                  region.region && region.region.trim() !== '' ? (
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
            value={isLoading ? "Loading..." : metricData.populationTotal.value}
            icon={<Users className="h-6 w-6" />}
            trend={{ 
              value: metricData.populationTotal.trend, 
              isPositive: metricData.populationTotal.trend >= 0 
            }}
          />
          <MetricCard
            title="Labor Force Rate"
            value={isLoading ? "Loading..." : metricData.laborForceRate.value}
            icon={<BarChart className="h-6 w-6" />}
            trend={{ 
              value: metricData.laborForceRate.trend, 
              isPositive: metricData.laborForceRate.trend >= 0 
            }}
          />
          <MetricCard
            title="Fertility Rate"
            value={isLoading ? "Loading..." : metricData.fertilityRate.value}
            icon={<LineChartIcon className="h-6 w-6" />}
            trend={{ 
              value: metricData.fertilityRate.trend, 
              isPositive: metricData.fertilityRate.trend >= 0 
            }}
          />
          <MetricCard
            title="Dependency Ratio"
            value={isLoading ? "Loading..." : metricData.dependencyRatio.value}
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
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">Loading data...</p>
                  </div>
                ) : chartData.fertilityData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">No fertility data available</p>
                  </div>
                ) : (
                  <FertilityRateChart 
                    data={chartData.fertilityData} 
                    selectedCountry={selectedCountry}
                    laborForceData={chartData.laborForceData}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dependency Ratio Map */}
          <Card className="bg-white rounded-lg border shadow">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">Dependency Ratio by Country</h3>
              <div className="h-[350px]">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">Loading data...</p>
                  </div>
                ) : (
                  <DependencyRatioMap
                    data={chartData.dependencyRatioData}
                    year={effectiveYear}
                    icon={<Map className="h-6 w-6 text-labor-500" />}
                  />
                )}
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
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">Loading data...</p>
                  </div>
                ) : (
                  <PopulationPyramidChart
                    data={chartData.populationPyramidData}
                    selectedCountry={selectedCountry}
                    year={effectiveYear}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Labor Force by Gender */}
          <Card className="bg-white rounded-lg border shadow">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">Labor Force by Gender</h3>
              <div className="h-[450px]">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">Loading data...</p>
                  </div>
                ) : (
                  <LaborForceChart 
                    data={chartData.laborForceData} 
                    selectedCountry={selectedCountry}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
