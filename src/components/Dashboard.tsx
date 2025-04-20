
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CircleUser, 
  LineChart as LineChartIcon,
  BarChart,
  Map,
  AlertCircle,
  BadgeInfo
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import useDashboardData from '@/hooks/useDashboardData';
import { testConnection } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [debugMode, setDebugMode] = useState<boolean>(true);
  const [supabaseStatus, setSupabaseStatus] = useState<boolean | null>(null);
  
  // Pass both selectedRegion and selectedCountry to the hook
  const { metricData, chartData, isLoading, error, refresh } = useDashboardData(selectedRegion, selectedCountry);

  useEffect(() => {
    // Test Supabase connection on component mount
    const checkSupabase = async () => {
      const status = await testConnection();
      setSupabaseStatus(status);
      console.log("Supabase connection status:", status);
      
      if (!status) {
        toast.error("Failed to connect to Supabase database");
      }
    };
    
    checkSupabase();
  }, []);

  const handleRegionChange = (region: string) => {
    console.log("Region changed to:", region);
    setSelectedRegion(region);
    setSelectedCountry('all'); // Reset country filter when region changes
    setSelectedYear(null); // Reset year when region changes
  };

  const handleCountryChange = (country: string) => {
    console.log("Country changed to:", country);
    setSelectedCountry(country);
    setSelectedYear(null); // Reset year when country changes
  };

  const handleYearChange = (year: string) => {
    console.log("Year changed to:", year);
    setSelectedYear(parseInt(year));
  };

  // Get available years based on selection
  const getAvailableYears = (): number[] => {
    if (selectedCountry !== 'all') {
      return chartData.yearsByCountry[selectedCountry] || chartData.years;
    } else if (selectedRegion !== 'all') {
      return chartData.yearsByRegion[selectedRegion] || chartData.years;
    }
    return chartData.years;
  };

  // Get the latest year from available years
  const availableYears = getAvailableYears();
  const latestYear = availableYears && availableYears.length > 0 
    ? availableYears[0] 
    : new Date().getFullYear();

  // If no year is selected, use the latest available year
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
              <div><strong>Metrics Loading:</strong> 
                {metricData.populationTotal.isLoading ? 'Population ⏳ ' : 'Population ✅ '}
                {metricData.laborForceRate.isLoading ? 'Labor ⏳ ' : 'Labor ✅ '}
                {metricData.fertilityRate.isLoading ? 'Fertility ⏳ ' : 'Fertility ✅ '}
                {metricData.dependencyRatio.isLoading ? 'Dependency ⏳' : 'Dependency ✅'}
              </div>
              <div><strong>Error:</strong> {error ? `❌ ${error}` : 'None ✅'}</div>
              <div><strong>Selected Region:</strong> {selectedRegion}</div>
              <div><strong>Selected Country:</strong> {selectedCountry}</div>
              <div><strong>Selected Year:</strong> {effectiveYear || 'None'}</div>
              <div><strong>Available Years:</strong> {availableYears?.length || 0}</div>
              <div><strong>Available Countries:</strong> {chartData.countries?.length || 0}</div>
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
          {/* Population Total Card */}
          {metricData.populationTotal.isLoading ? (
            <Card className="bg-white rounded-lg border shadow p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Total Population</p>
                  <Skeleton className="h-9 w-24 mt-1" />
                </div>
                <div className="h-10 w-10 rounded-full bg-labor-100/30 flex items-center justify-center">
                  <Users className="h-6 w-6 text-labor-500/70" />
                </div>
              </div>
              <Skeleton className="h-4 w-16 mt-2" />
            </Card>
          ) : (
            <MetricCard
              title="Total Population"
              value={metricData.populationTotal.value}
              icon={<Users className="h-6 w-6" />}
              trend={{ 
                value: metricData.populationTotal.trend, 
                isPositive: metricData.populationTotal.trend >= 0 
              }}
            />
          )}

          {/* Labor Force Rate Card */}
          {metricData.laborForceRate.isLoading ? (
            <Card className="bg-white rounded-lg border shadow p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Labor Force Rate</p>
                  <Skeleton className="h-9 w-24 mt-1" />
                </div>
                <div className="h-10 w-10 rounded-full bg-labor-100/30 flex items-center justify-center">
                  <BarChart className="h-6 w-6 text-labor-500/70" />
                </div>
              </div>
              <Skeleton className="h-4 w-16 mt-2" />
            </Card>
          ) : (
            <MetricCard
              title="Labor Force Rate"
              value={metricData.laborForceRate.value}
              icon={<BarChart className="h-6 w-6" />}
              trend={{ 
                value: metricData.laborForceRate.trend, 
                isPositive: metricData.laborForceRate.trend >= 0 
              }}
            />
          )}

          {/* Fertility Rate Card */}
          {metricData.fertilityRate.isLoading ? (
            <Card className="bg-white rounded-lg border shadow p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Fertility Rate</p>
                  <Skeleton className="h-9 w-24 mt-1" />
                </div>
                <div className="h-10 w-10 rounded-full bg-labor-100/30 flex items-center justify-center">
                  <LineChartIcon className="h-6 w-6 text-labor-500/70" />
                </div>
              </div>
              <Skeleton className="h-4 w-16 mt-2" />
            </Card>
          ) : (
            <MetricCard
              title="Fertility Rate"
              value={metricData.fertilityRate.value}
              icon={<LineChartIcon className="h-6 w-6" />}
              trend={{ 
                value: metricData.fertilityRate.trend, 
                isPositive: metricData.fertilityRate.trend >= 0 
              }}
            />
          )}

          {/* Dependency Ratio Card */}
          {metricData.dependencyRatio.isLoading ? (
            <Card className="bg-white rounded-lg border shadow p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Dependency Ratio</p>
                  <Skeleton className="h-9 w-24 mt-1" />
                </div>
                <div className="h-10 w-10 rounded-full bg-labor-100/30 flex items-center justify-center">
                  <CircleUser className="h-6 w-6 text-labor-500/70" />
                </div>
              </div>
              <Skeleton className="h-4 w-16 mt-2" />
            </Card>
          ) : (
            <MetricCard
              title="Dependency Ratio"
              value={metricData.dependencyRatio.value}
              icon={<CircleUser className="h-6 w-6" />}
              trend={{ 
                value: metricData.dependencyRatio.trend, 
                isPositive: metricData.dependencyRatio.trend < 0  // Lower dependency ratio is generally considered positive
              }}
            />
          )}
        </div>
      </section>
      
      {/* Demographic Analysis Section */}
      <section className="space-y-5">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center">
            <h2 className="text-xl font-medium text-labor-800">Demographic Analysis</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="ml-2 text-gray-400 hover:text-gray-600">
                    <BadgeInfo className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Year dropdown shows only the years with data available
                    for the selected country or region.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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
              disabled={availableYears.length === 0}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={availableYears.length === 0 ? "No years available" : "Select Year"} />
              </SelectTrigger>
              <SelectContent>
                {availableYears && availableYears.length > 0 ? (
                  availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-data" disabled>
                    No years available
                  </SelectItem>
                )}
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
                {chartData.isLoading ? (
                  <div className="h-full w-full flex flex-col items-center justify-center">
                    <Skeleton className="h-4/5 w-full rounded-md" />
                    <div className="mt-4 text-gray-500 text-sm">Loading chart data...</div>
                  </div>
                ) : chartData.fertilityData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <LineChartIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No fertility data available</p>
                      <p className="text-gray-400 text-sm">Try selecting a different region or country</p>
                    </div>
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
                {chartData.isLoading ? (
                  <div className="h-full w-full flex flex-col items-center justify-center">
                    <Skeleton className="h-4/5 w-full rounded-md" />
                    <div className="mt-4 text-gray-500 text-sm">Loading map data...</div>
                  </div>
                ) : chartData.dependencyRatioData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Map className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No dependency ratio data available</p>
                      <p className="text-gray-400 text-sm">Try selecting a different year</p>
                    </div>
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
                {chartData.isLoading ? (
                  <div className="h-full w-full flex flex-col items-center justify-center">
                    <Skeleton className="h-4/5 w-full rounded-md" />
                    <div className="mt-4 text-gray-500 text-sm">Loading population data...</div>
                  </div>
                ) : chartData.populationPyramidData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No population pyramid data available</p>
                      <p className="text-gray-400 text-sm">Try selecting a different country or year</p>
                    </div>
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
                {chartData.isLoading ? (
                  <div className="h-full w-full flex flex-col items-center justify-center">
                    <Skeleton className="h-4/5 w-full rounded-md" />
                    <div className="mt-4 text-gray-500 text-sm">Loading labor force data...</div>
                  </div>
                ) : chartData.laborForceData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <BarChart className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No labor force data available</p>
                      <p className="text-gray-400 text-sm">Try selecting a different region or country</p>
                    </div>
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
