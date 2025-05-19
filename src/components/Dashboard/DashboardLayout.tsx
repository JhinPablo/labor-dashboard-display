
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import FeatureAccess from '@/components/FeatureAccess';
import DashboardMetrics from './DashboardMetrics';
import DashboardMap from './DashboardMap';
import { ArrowUp, ArrowDown } from 'lucide-react';

type Region = {
  id: string;
  name: string;
};

// Datos de ejemplo para usar cuando no hay conexión a la base de datos
const dummyRegions = [
  { id: 'region-1', name: 'Western Europe' },
  { id: 'region-2', name: 'Eastern Europe' },
  { id: 'region-3', name: 'Northern Europe' },
  { id: 'region-4', name: 'Southern Europe' }
];

const dummyYears = [2018, 2019, 2020, 2021, 2022];

const dummyMetrics = {
  laborForce: { value: 245000000, trend: 1.2 },
  fertilityRate: { value: 1.56, trend: -0.3 },
  population: { value: 520000000, trend: 0.5 },
  topCountries: [
    {country: 'Germany', value: 42000000},
    {country: 'France', value: 33500000},
    {country: 'United Kingdom', value: 32800000}
  ]
};

const DashboardLayout = () => {
  const { userSubscription, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<number>(2020);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [metrics, setMetrics] = useState({
    laborForce: { value: 0, trend: 0 },
    fertilityRate: { value: 0, trend: 0 },
    population: { value: 0, trend: 0 },
    topCountries: [] as {country: string, value: number}[]
  });

  // Fetch available years and regions on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch available years
        const { data: yearsData, error: yearsError } = await supabase
          .from('labor')
          .select('year')
          .order('year', { ascending: false });
          
        if (yearsError) {
          console.error('Error fetching years:', yearsError);
          // Use dummy years if we can't fetch from DB
          setAvailableYears(dummyYears);
          setSelectedYear(dummyYears[dummyYears.length - 1]);
        } else if (yearsData && yearsData.length > 0) {
          // Get unique years
          const years = [...new Set(yearsData.map(item => item.year))];
          setAvailableYears(years);
          
          if (years.length > 0) {
            setSelectedYear(years[0]); // Set to most recent year
          }
        } else {
          // Use dummy years if no data
          setAvailableYears(dummyYears);
          setSelectedYear(dummyYears[dummyYears.length - 1]);
        }
        
        // Fetch available regions
        const { data: regionsData, error: regionsError } = await supabase
          .from('geo_data')
          .select('*');
          
        if (regionsError) {
          console.error('Error fetching regions:', regionsError);
          // Use dummy regions if we can't fetch from DB
          setRegions(dummyRegions);
        } else if (regionsData && regionsData.length > 0) {
          // Check if region_name field exists
          if (regionsData[0] && 'region_name' in regionsData[0]) {
            // Get unique regions
            const uniqueRegions = [...new Set(regionsData
              .map(item => item.region_name)
              .filter(Boolean))];
            setRegions(uniqueRegions.map((name, index) => ({ id: `region-${index}`, name })));
          } else {
            console.warn('region_name field not found in geo_data table, using dummy data');
            setRegions(dummyRegions);
          }
        } else {
          // Use dummy regions if no data
          setRegions(dummyRegions);
        }
        
      } catch (error) {
        console.error('Error fetching initial data:', error);
        // Use dummy data in case of error
        setAvailableYears(dummyYears);
        setSelectedYear(dummyYears[dummyYears.length - 1]);
        setRegions(dummyRegions);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Fetch dashboard metrics when region or year changes
  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      if (selectedYear) {
        setIsLoading(true);
        try {
          // Fetch labor force data
          const laborQuery = supabase
            .from('labor')
            .select('geo, labour_force, year')
            .eq('year', selectedYear);
            
          if (selectedRegion !== 'all') {
            // Join with geo_data to filter by region if needed
            // This is a simplified approach, may need adjustment based on actual DB schema
            laborQuery.like('geo', `%${selectedRegion}%`);
          }
            
          const { data: laborData, error: laborError } = await laborQuery;
          
          if (laborError) {
            console.error('Error fetching labor data:', laborError);
            // Use dummy metrics
            setMetrics(dummyMetrics);
            setIsLoading(false);
            return;
          }
          
          if (!laborData || laborData.length === 0) {
            console.log('No labor data found, using dummy metrics');
            setMetrics(dummyMetrics);
            setIsLoading(false);
            return;
          }
          
          // Calculate total labor force
          const totalLaborForce = laborData.reduce((sum, item) => sum + (item.labour_force || 0), 0);
          
          // Fetch previous year labor force for trend
          const prevYear = selectedYear - 1;
          const { data: prevLaborData, error: prevLaborError } = await supabase
            .from('labor')
            .select('labour_force')
            .eq('year', prevYear);
            
          if (prevLaborError) {
            console.error('Error fetching previous labor data:', prevLaborError);
          }
          
          // Calculate trend percentage
          const prevTotalLaborForce = prevLaborData?.reduce((sum, item) => sum + (item.labour_force || 0), 0) || 0;
          const laborForceTrend = prevTotalLaborForce ? ((totalLaborForce - prevTotalLaborForce) / prevTotalLaborForce) * 100 : 0;
          
          // Fetch fertility rate data
          const { data: fertilityData, error: fertilityError } = await supabase
            .from('fertility')
            .select('geo, fertility_rate')
            .eq('year', selectedYear);
            
          if (fertilityError) {
            console.error('Error fetching fertility data:', fertilityError);
          }
          
          // Calculate average fertility rate
          const validFertilityRates = fertilityData
            ? fertilityData.filter(item => item.fertility_rate !== null)
                         .map(item => item.fertility_rate)
            : [];
            
          const avgFertilityRate = validFertilityRates.length > 0 
            ? validFertilityRates.reduce((sum, rate) => sum + rate, 0) / validFertilityRates.length 
            : dummyMetrics.fertilityRate.value;
          
          // Fetch top countries with highest labor force
          const { data: topCountriesData, error: topCountriesError } = await supabase
            .from('labor')
            .select('geo, labour_force')
            .eq('year', selectedYear)
            .order('labour_force', { ascending: false })
            .limit(3);
            
          if (topCountriesError) {
            console.error('Error fetching top countries:', topCountriesError);
          }
          
          const topCountries = topCountriesData && topCountriesData.length > 0
            ? topCountriesData.map(item => ({
                country: item.geo,
                value: item.labour_force || 0
              }))
            : dummyMetrics.topCountries;
          
          // Fetch population data
          const { data: populationData, error: populationError } = await supabase
            .from('population')
            .select('population')
            .eq('year', selectedYear)
            .eq('sex', 'Total')
            .eq('age', 'Total');
            
          if (populationError) {
            console.error('Error fetching population data:', populationError);
          }
          
          const totalPopulation = populationData
            ? populationData.reduce((sum, item) => sum + (item.population || 0), 0)
            : dummyMetrics.population.value;
          
          // Fetch previous year population for trend
          const { data: prevPopData, error: prevPopError } = await supabase
            .from('population')
            .select('population')
            .eq('year', prevYear)
            .eq('sex', 'Total')
            .eq('age', 'Total');
            
          if (prevPopError) {
            console.error('Error fetching previous population data:', prevPopError);
          }
          
          const prevTotalPopulation = prevPopData
            ? prevPopData.reduce((sum, item) => sum + (item.population || 0), 0)
            : 0;
            
          const populationTrend = prevTotalPopulation 
            ? ((totalPopulation - prevTotalPopulation) / prevTotalPopulation) * 100 
            : dummyMetrics.population.trend;
          
          setMetrics({
            laborForce: { 
              value: totalLaborForce || dummyMetrics.laborForce.value, 
              trend: laborForceTrend || dummyMetrics.laborForce.trend 
            },
            fertilityRate: { 
              value: avgFertilityRate, 
              trend: dummyMetrics.fertilityRate.trend // We would calculate this if we had previous year data
            },
            population: { 
              value: totalPopulation, 
              trend: populationTrend 
            },
            topCountries: topCountries
          });
          
        } catch (error) {
          console.error('Error fetching dashboard metrics:', error);
          // Use dummy metrics in case of error
          setMetrics(dummyMetrics);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchDashboardMetrics();
  }, [selectedRegion, selectedYear]);
  
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
        <div>
          <h1 className="text-3xl font-bold text-labor-900">Dashboard</h1>
          <p className="text-labor-600">Track labor market trends and demographic indicators</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={selectedRegion === 'all' ? 'all' : selectedRegion}
            onValueChange={handleRegionChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.name}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={selectedYear.toString()} 
            onValueChange={handleYearChange}
            disabled={availableYears.length === 0}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
    </div>
  );
};

export default DashboardLayout;
