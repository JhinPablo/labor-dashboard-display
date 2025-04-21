
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

type Country = {
  geo: string;
  region_name: string;
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
          
        if (yearsError) throw yearsError;
        
        // Get unique years
        const years = [...new Set(yearsData.map(item => item.year))];
        setAvailableYears(years);
        
        if (years.length > 0) {
          setSelectedYear(years[0]); // Set to most recent year
        }
        
        // Fetch available regions
        const { data: regionsData, error: regionsError } = await supabase
          .from('geo_data')
          .select('region_name')
          .order('region_name');
          
        if (regionsError) throw regionsError;
        
        // Get unique regions
        const uniqueRegions = [...new Set(regionsData.map(item => item.region_name).filter(Boolean))];
        setRegions(uniqueRegions.map((name, index) => ({ id: `region-${index}`, name })));
        
      } catch (error) {
        console.error('Error fetching initial data:', error);
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
            laborQuery.eq('geo_data.region_name', selectedRegion);
          }
            
          const { data: laborData, error: laborError } = await laborQuery;
          if (laborError) throw laborError;
          
          // Calculate total labor force
          const totalLaborForce = laborData.reduce((sum, item) => sum + (item.labour_force || 0), 0);
          
          // Fetch previous year labor force for trend
          const prevYear = selectedYear - 1;
          const { data: prevLaborData, error: prevLaborError } = await supabase
            .from('labor')
            .select('labour_force')
            .eq('year', prevYear);
            
          if (prevLaborError) throw prevLaborError;
          
          // Calculate trend percentage
          const prevTotalLaborForce = prevLaborData.reduce((sum, item) => sum + (item.labour_force || 0), 0);
          const laborForceTrend = prevTotalLaborForce ? ((totalLaborForce - prevTotalLaborForce) / prevTotalLaborForce) * 100 : 0;
          
          // Fetch fertility rate data
          const { data: fertilityData, error: fertilityError } = await supabase
            .from('fertility')
            .select('geo, fertility_rate')
            .eq('year', selectedYear);
            
          if (fertilityError) throw fertilityError;
          
          // Calculate average fertility rate
          const validFertilityRates = fertilityData
            .filter(item => item.fertility_rate !== null)
            .map(item => item.fertility_rate);
            
          const avgFertilityRate = validFertilityRates.length > 0 
            ? validFertilityRates.reduce((sum, rate) => sum + rate, 0) / validFertilityRates.length 
            : 0;
          
          // Fetch top countries with highest labor force
          const { data: topCountriesData, error: topCountriesError } = await supabase
            .from('labor')
            .select('geo, labour_force')
            .eq('year', selectedYear)
            .order('labour_force', { ascending: false })
            .limit(3);
            
          if (topCountriesError) throw topCountriesError;
          
          const topCountries = topCountriesData.map(item => ({
            country: item.geo,
            value: item.labour_force || 0
          }));
          
          // Fetch population data
          const { data: populationData, error: populationError } = await supabase
            .from('population')
            .select('population')
            .eq('year', selectedYear)
            .eq('sex', 'Total')
            .eq('age', 'Total');
            
          if (populationError) throw populationError;
          
          const totalPopulation = populationData.reduce((sum, item) => sum + (item.population || 0), 0);
          
          // Fetch previous year population for trend
          const { data: prevPopData, error: prevPopError } = await supabase
            .from('population')
            .select('population')
            .eq('year', prevYear)
            .eq('sex', 'Total')
            .eq('age', 'Total');
            
          if (prevPopError) throw prevPopError;
          
          const prevTotalPopulation = prevPopData.reduce((sum, item) => sum + (item.population || 0), 0);
          const populationTrend = prevTotalPopulation ? ((totalPopulation - prevTotalPopulation) / prevTotalPopulation) * 100 : 0;
          
          setMetrics({
            laborForce: { 
              value: totalLaborForce, 
              trend: laborForceTrend 
            },
            fertilityRate: { 
              value: avgFertilityRate, 
              trend: 0 // We would calculate this if we had previous year data
            },
            population: { 
              value: totalPopulation, 
              trend: populationTrend 
            },
            topCountries
          });
          
        } catch (error) {
          console.error('Error fetching dashboard metrics:', error);
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
            {/* This would be implemented in a dedicated component */}
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
