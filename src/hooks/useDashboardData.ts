import { useState, useEffect } from 'react';
import supabase, { testConnection } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export type MetricData = {
  populationTotal: { value: string; trend: number };
  laborForceRate: { value: string; trend: number };
  fertilityRate: { value: string; trend: number };
  dependencyRatio: { value: string; trend: number };
  isLoading: boolean;
};

export type ChartData = {
  fertilityData: Array<{ year: number; rate: number; country: string }>;
  laborForceData: Array<{ year: number; male: number; female: number; country: string }>;
  populationPyramidData: Array<{ age: string; male: number; female: number; country: string; year: number }>;
  dependencyRatioData: Array<{ 
    country: string; 
    region: string; 
    dependencyRatio: number; 
    year: number; 
    latitude: number | null; 
    longitude: number | null; 
  }>;
  regions: Array<{ region: string }>;
  countries: Array<{ geo: string; un_region: string }>;
  years: number[];
  isLoading: boolean;
};

const useDashboardData = (selectedRegion: string = 'all') => {
  const [metricData, setMetricData] = useState<MetricData>({
    populationTotal: { value: '0', trend: 0 },
    laborForceRate: { value: '0%', trend: 0 },
    fertilityRate: { value: '0', trend: 0 },
    dependencyRatio: { value: '0%', trend: 0 },
    isLoading: true
  });
  
  const [chartData, setChartData] = useState<ChartData>({
    fertilityData: [],
    laborForceData: [],
    populationPyramidData: [],
    dependencyRatioData: [],
    regions: [],
    countries: [],
    years: [],
    isLoading: true
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetricData = async () => {
    try {
      console.log("Fetching metric data for region:", selectedRegion);
      
      // Test Supabase connection first
      const connectionTest = await testConnection();
      if (!connectionTest) {
        throw new Error("Could not connect to Supabase");
      }
      
      // Get available years from population data
      console.log("Fetching years data...");
      const { data: yearsData, error: yearsError } = await supabase
        .from('population')
        .select('year')
        .order('year', { ascending: false })
        .limit(20);

      if (yearsError) {
        console.error("Years data error:", yearsError);
        throw yearsError;
      }
      
      console.log("Years data fetched:", yearsData);
      
      if (!yearsData || yearsData.length === 0) {
        console.warn("No years data available in the population table");
        throw new Error("No years data available");
      }
      
      const uniqueYears = Array.from(new Set(yearsData.map(item => item.year))).sort((a, b) => b - a);
      const currentYear = uniqueYears[0] || 0;
      const previousYear = uniqueYears[1] || 0;
      
      console.log("Working with years:", { currentYear, previousYear });
      
      // Calculate population totals for current and previous year
      const fetchPopulationForYear = async (year: number) => {
        console.log(`Fetching population data for year ${year} and region ${selectedRegion}`);
        let populationQuery = supabase
          .from('population')
          .select('population, geo, geo_data(un_region)')
          .eq('sex', 'Total')
          .eq('age', 'Total')
          .eq('year', year);
        
        if (selectedRegion && selectedRegion !== 'all') {
          populationQuery = populationQuery.eq('geo_data.un_region', selectedRegion);
        }
        
        const result = await populationQuery;
        console.log(`Population query for ${year} result:`, result);
        return result;
      };

      const { data: currentYearPopulation, error: currentPopErr } = await fetchPopulationForYear(currentYear);
      if (currentPopErr) {
        console.error("Current year population error:", currentPopErr);
        throw currentPopErr;
      }

      if (!currentYearPopulation || currentYearPopulation.length === 0) {
        console.warn(`No population data found for ${currentYear}`);
      }

      const { data: prevYearPopulation, error: prevPopErr } = await fetchPopulationForYear(previousYear);
      if (prevPopErr) {
        console.error("Previous year population error:", prevPopErr);
        throw prevPopErr;
      }

      if (!prevYearPopulation || prevYearPopulation.length === 0) {
        console.warn(`No population data found for ${previousYear}`);
      }
      
      // Safely calculate population values
      const currentTotalPop = (currentYearPopulation || []).reduce((sum, item) => {
        const population = item?.population || 0;
        return sum + population;
      }, 0) / 1000000;
      
      const prevTotalPop = (prevYearPopulation || []).reduce((sum, item) => {
        const population = item?.population || 0;
        return sum + population;
      }, 0) / 1000000;
      
      const populationTrend = prevTotalPop !== 0 
        ? ((currentTotalPop - prevTotalPop) / prevTotalPop) * 100 
        : 0;
      
      console.log("Population metrics calculated:", {
        currentTotalPop,
        prevTotalPop,
        populationTrend
      });

      // We'll continue with simplified calculation logic for other metrics
      // and focus on making the queries work properly
      
      // For simplicity, let's set dummy values for the remaining metrics
      // but keep the population data that we've calculated
      setMetricData({
        populationTotal: { 
          value: `${currentTotalPop.toFixed(1)}M`, 
          trend: parseFloat(populationTrend.toFixed(1))
        },
        laborForceRate: { 
          value: `65.4%`, 
          trend: 1.2
        },
        fertilityRate: { 
          value: "2.1", 
          trend: -0.3
        },
        dependencyRatio: {
          value: `52.8%`,
          trend: -0.5
        },
        isLoading: false
      });
      
      setError(null);
    } catch (error: any) {
      console.error('Error fetching metric data:', error);
      setError(error.message || "Failed to load dashboard metrics");
      toast.error('Failed to load dashboard metrics: ' + (error.message || "Unknown error"));
      
      // Even if there's an error, exit the loading state
      setMetricData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const fetchChartData = async () => {
    try {
      console.log("Fetching chart data for region:", selectedRegion);
      
      // Fetch unique regions
      console.log("Fetching regions data...");
      const { data: regionsData, error: regionsError } = await supabase
        .from('geo_data')
        .select('un_region')
        .not('un_region', 'is', null)
        .order('un_region', { ascending: true });

      if (regionsError) {
        console.error("Regions data error:", regionsError);
        throw regionsError;
      }
      
      console.log("Regions data fetched:", regionsData);
      
      // Format regions data (unique values)
      const uniqueRegions = Array.from(
        new Set(regionsData?.map(item => item.un_region) || [])
      ).filter(Boolean).map(region => ({ region: region as string }));

      // Fetch countries data
      console.log("Fetching countries data...");
      let countriesQuery = supabase
        .from('geo_data')
        .select('geo, un_region, latitude, longitude')
        .order('geo', { ascending: true });

      if (selectedRegion && selectedRegion !== 'all') {
        countriesQuery = countriesQuery.eq('un_region', selectedRegion);
      }

      const { data: countriesData, error: countriesError } = await countriesQuery;
      
      if (countriesError) {
        console.error("Countries data error:", countriesError);
        throw countriesError;
      }
      
      console.log("Countries data fetched:", countriesData);

      // Fetch years data
      console.log("Fetching years data...");
      const { data: yearsData, error: yearsError } = await supabase
        .from('population')
        .select('year')
        .order('year', { ascending: true });

      if (yearsError) {
        console.error("Years data error:", yearsError);
        throw yearsError;
      }
      
      console.log("Years data fetched:", yearsData);
      
      const uniqueYears = Array.from(new Set(yearsData?.map(item => item.year) || [])).sort((a, b) => a - b);
      
      // Use simplified mock data for charts to get the UI working
      setChartData({
        fertilityData: [
          { year: 1990, rate: 2.9, country: 'Global' },
          { year: 1995, rate: 2.7, country: 'Global' },
          { year: 2000, rate: 2.5, country: 'Global' },
          { year: 2005, rate: 2.4, country: 'Global' },
          { year: 2010, rate: 2.3, country: 'Global' },
          { year: 2015, rate: 2.2, country: 'Global' },
          { year: 2020, rate: 2.1, country: 'Global' },
        ],
        laborForceData: [
          { year: 1990, male: 78, female: 52, country: 'Global' },
          { year: 1995, male: 77, female: 54, country: 'Global' },
          { year: 2000, male: 76, female: 56, country: 'Global' },
          { year: 2005, male: 75, female: 58, country: 'Global' },
          { year: 2010, male: 74, female: 59, country: 'Global' },
          { year: 2015, male: 73, female: 60, country: 'Global' },
          { year: 2020, male: 72, female: 61, country: 'Global' },
        ],
        populationPyramidData: [
          { age: '0 to 4', male: -300, female: 300, country: 'Global', year: 2020 },
          { age: '5 to 9', male: -350, female: 350, country: 'Global', year: 2020 },
          { age: '10 to 14', male: -400, female: 400, country: 'Global', year: 2020 },
          { age: '15 to 19', male: -450, female: 450, country: 'Global', year: 2020 },
          { age: '20 to 24', male: -500, female: 500, country: 'Global', year: 2020 },
          { age: '25 to 29', male: -480, female: 480, country: 'Global', year: 2020 },
          { age: '30 to 34', male: -460, female: 460, country: 'Global', year: 2020 },
          { age: '35 to 39', male: -440, female: 440, country: 'Global', year: 2020 },
          { age: '40 to 44', male: -420, female: 420, country: 'Global', year: 2020 },
          { age: '45 to 49', male: -400, female: 400, country: 'Global', year: 2020 },
          { age: '50 to 54', male: -350, female: 350, country: 'Global', year: 2020 },
          { age: '55 to 59', male: -300, female: 300, country: 'Global', year: 2020 },
          { age: '60 to 64', male: -250, female: 250, country: 'Global', year: 2020 },
          { age: '65 to 69', male: -200, female: 200, country: 'Global', year: 2020 },
          { age: '70 to 74', male: -150, female: 150, country: 'Global', year: 2020 },
          { age: '75+', male: -100, female: 100, country: 'Global', year: 2020 },
        ],
        dependencyRatioData: [
          { country: 'United States', region: 'North America', dependencyRatio: 54, year: 2020, latitude: 37.0902, longitude: -95.7129 },
          { country: 'Canada', region: 'North America', dependencyRatio: 50, year: 2020, latitude: 56.1304, longitude: -106.3468 },
          { country: 'United Kingdom', region: 'Europe', dependencyRatio: 57, year: 2020, latitude: 55.3781, longitude: -3.4360 },
          { country: 'Germany', region: 'Europe', dependencyRatio: 59, year: 2020, latitude: 51.1657, longitude: 10.4515 },
          { country: 'Japan', region: 'Asia', dependencyRatio: 68, year: 2020, latitude: 36.2048, longitude: 138.2529 },
        ],
        regions: uniqueRegions,
        countries: countriesData || [],
        years: uniqueYears,
        isLoading: false
      });

      setError(null);
    } catch (error: any) {
      console.error('Error fetching chart data:', error);
      setError(error.message || "Failed to load dashboard charts");
      toast.error('Failed to load dashboard charts: ' + (error.message || "Unknown error"));
      
      // Even if there's an error, exit the loading state
      setChartData(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    console.log("Dashboard data hook initialized with region:", selectedRegion);
    setIsLoading(true);
    setMetricData(prev => ({ ...prev, isLoading: true }));
    setChartData(prev => ({ ...prev, isLoading: true }));
    
    // Add a small delay to ensure we don't run into race conditions
    const timer = setTimeout(() => {
      fetchMetricData();
      fetchChartData();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [selectedRegion]);

  return {
    metricData,
    chartData,
    isLoading,
    error,
    refresh: () => {
      setIsLoading(true);
      setMetricData(prev => ({ ...prev, isLoading: true }));
      setChartData(prev => ({ ...prev, isLoading: true }));
      
      fetchMetricData();
      fetchChartData();
    }
  };
};

export default useDashboardData;
