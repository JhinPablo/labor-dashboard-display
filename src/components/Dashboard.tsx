
import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Filter,
  BarChart,
  LineChart,
  Globe
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
  LaborForceChart,
  PopulationMapChart
} from './DemographicCharts';
import useDashboardData from '@/hooks/useDashboardData';

export function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const { metricData, chartData } = useDashboardData(selectedRegion);

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
    : null;

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
            <Filter className="h-4 w-4 text-labor-500" />
            <Select value={selectedRegion} onValueChange={handleRegionChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {chartData.regions.map((region) => (
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-animation">
          <MetricCard
            title="Population"
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
            icon={<LineChart className="h-6 w-6" />}
            trend={{ 
              value: metricData.fertilityRate.trend, 
              isPositive: metricData.fertilityRate.trend >= 0 
            }}
          />
        </div>
      </section>
      
      {/* Demographic Analysis Section */}
      <section className="space-y-5">
        <h2 className="text-xl font-medium text-labor-800 mb-5">Demographic Analysis</h2>
        
        {/* Fertility & Labor Force Rates Chart */}
        <div className="bg-white rounded-lg border shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Fertility & Labor Force Rates Over Time</h3>
            <div className="flex items-center gap-2">
              <Select 
                value={selectedCountry} 
                onValueChange={handleCountryChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {availableCountries.map((country) => (
                    country.geo && country.geo.trim() !== '' ? (
                      <SelectItem key={country.geo} value={country.geo}>
                        {country.geo}
                      </SelectItem>
                    ) : null
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="h-[400px]">
            <FertilityRateChart 
              data={chartData.fertilityData} 
              laborForceData={chartData.laborForceData}
              selectedCountry={selectedCountry}
            />
          </div>
        </div>
        
        {/* Population Map */}
        <div className="bg-white rounded-lg border shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Population by Country</h3>
            <div className="flex items-center gap-2">
              <Select 
                value={effectiveYear?.toString() || ''} 
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {chartData.years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="h-[500px]">
            <PopulationMapChart 
              data={chartData.populationByCountry}
              icon={<Globe className="h-6 w-6 text-labor-500" />}
            />
          </div>
        </div>
        
        {/* Labor Force Rate by Gender */}
        <div className="bg-white rounded-lg border shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Labor Force Rate by Gender</h3>
            <div className="flex items-center gap-2">
              <Select 
                value={selectedCountry} 
                onValueChange={handleCountryChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {availableCountries.map((country) => (
                    country.geo && country.geo.trim() !== '' ? (
                      <SelectItem key={country.geo} value={country.geo}>
                        {country.geo}
                      </SelectItem>
                    ) : null
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="h-[400px]">
            <LaborForceChart 
              data={chartData.laborForceData} 
              selectedCountry={selectedCountry}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
