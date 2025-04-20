
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

export function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const { metricData, chartData, isLoading, refresh } = useDashboardData(selectedRegion);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedCountry('all'); // Reset country filter when region changes
    // setSelectedYear(null); // Reset year filter when region changes
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
            </>
          )}
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

            {/* <Select 
              value={yearOptions.includes(effectiveYear.toString()) ? effectiveYear.toString() : 
                    (yearOptions[0] === 'no-data' ? 'no-data' : yearOptions[yearOptions.length - 1].toString())}
              onValueChange={handleYearChange}
              disabled={yearOptions.length <= 1 && yearOptions[0] === 'no-data'}
            > */}
            {/* <Select
              value={
                selectedYear !== null && yearOptions.includes(selectedYear.toString())
                  ? selectedYear.toString()
                  : yearOptions.length > 0
                    ? yearOptions[yearOptions.length - 1].toString()
                    : 'no-data'
              }
              onValueChange={handleYearChange}
              disabled={yearOptions.length === 0 || yearOptions[0] === 'no-data'}
            > */}
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
          {/* Fertility Trend Chart */}
          <Card className="bg-white rounded-lg border shadow">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">Fertility Trend</h3>
              <div className="h-[350px]">
                {chartData.isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin text-labor-500" />
                  </div>
                ) : chartData.fertilityData.length > 0 ? (
                  <FertilityTrendChart 
                    data={chartData.fertilityData} 
                    selectedCountry={selectedCountry}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">No fertility data available for the selected filters.</p>
                  </div>
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
                  <div className="h-full flex items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin text-labor-500" />
                  </div>
                ) : chartData.dependencyRatioData.length > 0 ? (
                  

                  <div className="p-4 space-y-4">
                    <h4 className="text-sm font-medium text-labor-800">Top 3 Countries by Dependency Ratio</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[...chartData.dependencyRatioData]
                        .filter(d => d.year === effectiveYear)
                        .sort((a, b) => b.dependencyRatio - a.dependencyRatio)
                        .slice(0, 3)
                        .map((item) => (
                          <Card key={item.country} className="bg-labor-50 shadow-sm border">
                            <CardContent className="p-3">
                              <div className="font-semibold">{item.country}</div>
                              <div className="text-sm text-labor-600">{item.dependencyRatio.toFixed(1)}%</div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>




                    
                    <DependencyRatioMapModal data={chartData.dependencyRatioData} year={effectiveYear} />
                  </div>



                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Map className="h-8 w-8 mx-auto mb-2 text-labor-400" />
                      <p className="text-gray-500">No dependency ratio data available.</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Population Pyramid */}
          <Card className="bg-white rounded-lg border shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Population Pyramid</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-sm text-labor-500 cursor-help">?</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Male population shown as negative values for visualization purposes. 
                        Chart shows population distribution by age groups and gender.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="h-[450px]">
                {chartData.isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin text-labor-500" />
                  </div>
                ) : chartData.populationPyramidData.length > 0 ? (
                  <PopulationPyramidChart
                    data={chartData.populationPyramidData}
                    selectedCountry={selectedCountry}
                    year={effectiveYear}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">No population data available for the selected filters.</p>
                  </div>
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
                  <div className="h-full flex items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin text-labor-500" />
                  </div>
                ) : chartData.laborForceData.length > 0 ? (
                  <LaborForceByGenderChart 
                    data={chartData.laborForceData} 
                    selectedCountry={selectedCountry}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">No labor force data available for the selected filters.</p>
                  </div>
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