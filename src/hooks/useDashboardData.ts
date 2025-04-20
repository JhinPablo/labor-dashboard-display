
import { useState, useEffect } from 'react';
import supabase, { testConnection, getAvailableYears } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export type MetricData = {
  populationTotal: { value: string; trend: number; isLoading: boolean; };
  laborForceRate: { value: string; trend: number; isLoading: boolean; };
  fertilityRate: { value: string; trend: number; isLoading: boolean; };
  dependencyRatio: { value: string; trend: number; isLoading: boolean; };
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
  yearsByRegion: Record<string, number[]>;
  yearsByCountry: Record<string, number[]>;
  isLoading: boolean;
};

const useDashboardData = (selectedRegion: string = 'all', selectedCountry: string = 'all') => {
  const [metricData, setMetricData] = useState<MetricData>({
    populationTotal: { value: 'No data', trend: 0, isLoading: true },
    laborForceRate: { value: 'No data', trend: 0, isLoading: true },
    fertilityRate: { value: 'No data', trend: 0, isLoading: true },
    dependencyRatio: { value: 'No data', trend: 0, isLoading: true }
  });
  
  const [chartData, setChartData] = useState<ChartData>({
    fertilityData: [],
    laborForceData: [],
    populationPyramidData: [],
    dependencyRatioData: [],
    regions: [],
    countries: [],
    years: [],
    yearsByRegion: {},
    yearsByCountry: {},
    isLoading: true
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get available years for the selected region/country
  const fetchAvailableYears = async () => {
    try {
      // First check Supabase connection
      const connectionTest = await testConnection();
      if (!connectionTest) {
        throw new Error("Could not connect to Supabase");
      }

      // Get all regions for the filters
      const { data: regionsData, error: regionsError } = await supabase
        .from('geo_data')
        .select('un_region')
        .not('un_region', 'is', null)
        .order('un_region', { ascending: true });

      if (regionsError) {
        console.error("Error fetching regions:", regionsError);
        throw regionsError;
      }

      const uniqueRegions = Array.from(
        new Set(regionsData?.map(item => item.un_region) || [])
      ).filter(Boolean).map(region => ({ region: region as string }));

      // Fetch countries data
      let countriesQuery = supabase
        .from('geo_data')
        .select('geo, un_region, latitude, longitude')
        .order('geo', { ascending: true });

      if (selectedRegion && selectedRegion !== 'all') {
        countriesQuery = countriesQuery.eq('un_region', selectedRegion);
      }

      const { data: countriesData, error: countriesError } = await countriesQuery;
      
      if (countriesError) {
        console.error("Error fetching countries:", countriesError);
        throw countriesError;
      }

      // Get available years from different tables for the selected region/country
      // Population years (for population metrics)
      const populationYears = await getAvailableYears(
        'population', 
        selectedRegion, 
        selectedCountry, 
        { sex: 'Total', age: 'Total' }
      );
      
      // Fertility years
      const fertilityYears = await getAvailableYears(
        'fertility', 
        selectedRegion, 
        selectedCountry
      );
      
      // Labor force years
      const laborYears = await getAvailableYears(
        'labor', 
        selectedRegion, 
        selectedCountry
      );
      
      // Combine all years, removing duplicates
      const allYears = Array.from(
        new Set([...populationYears, ...fertilityYears, ...laborYears])
      ).sort((a, b) => b - a); // Sort in descending order (newest first)
      
      console.log("Combined available years:", allYears);

      // Track years by region and country for filtering
      const yearsByRegion: Record<string, number[]> = {};
      const yearsByCountry: Record<string, number[]> = {};
      
      // Populate yearsByRegion
      for (const region of uniqueRegions) {
        if (region.region) {
          const years = await getAvailableYears('population', region.region, 'all', { sex: 'Total', age: 'Total' });
          yearsByRegion[region.region] = years;
        }
      }
      
      // Populate yearsByCountry
      for (const country of countriesData || []) {
        if (country.geo) {
          const years = await getAvailableYears('population', 'all', country.geo, { sex: 'Total', age: 'Total' });
          yearsByCountry[country.geo] = years;
        }
      }

      // Update chart data with years and region/country info
      setChartData(prev => ({
        ...prev,
        regions: uniqueRegions,
        countries: countriesData || [],
        years: allYears,
        yearsByRegion,
        yearsByCountry,
        isLoading: false
      }));

      return {
        years: allYears,
        populationYears,
        fertilityYears,
        laborYears,
        regions: uniqueRegions,
        countries: countriesData || []
      };
    } catch (err: any) {
      console.error("Error fetching available years:", err);
      setError(err.message || "Failed to load available years");
      toast.error("Failed to load available years: " + (err.message || "Unknown error"));
      return {
        years: [],
        populationYears: [],
        fertilityYears: [],
        laborYears: [],
        regions: [],
        countries: []
      };
    }
  };

  const fetchMetricData = async (availableYears: number[]) => {
    try {
      console.log("Fetching metric data for:", { 
        region: selectedRegion, 
        country: selectedCountry, 
        availableYears 
      });

      // First mark all metrics as loading
      setMetricData(prev => ({
        populationTotal: { ...prev.populationTotal, isLoading: true },
        laborForceRate: { ...prev.laborForceRate, isLoading: true },
        fertilityRate: { ...prev.fertilityRate, isLoading: true },
        dependencyRatio: { ...prev.dependencyRatio, isLoading: true }
      }));
      
      if (!availableYears || availableYears.length === 0) {
        console.warn("No available years to fetch metrics for");
        setMetricData({
          populationTotal: { value: 'No data', trend: 0, isLoading: false },
          laborForceRate: { value: 'No data', trend: 0, isLoading: false },
          fertilityRate: { value: 'No data', trend: 0, isLoading: false },
          dependencyRatio: { value: 'No data', trend: 0, isLoading: false }
        });
        return;
      }
      
      const currentYear = availableYears[0];
      const previousYear = availableYears[1] || currentYear; // Fallback to same year if no previous
      
      console.log("Working with years:", { currentYear, previousYear });
      
      // POPULATION METRIC
      try {
        // Calculate population totals for current and previous year
        const fetchPopulationForYear = async (year: number) => {
          console.log(`Fetching population data for year ${year} and region/country:`, {
            region: selectedRegion,
            country: selectedCountry
          });
          
          let populationQuery = supabase
            .from('population')
            .select('population, geo, geo_data(un_region)')
            .eq('sex', 'Total')
            .eq('age', 'Total')
            .eq('year', year);
          
          if (selectedCountry && selectedCountry !== 'all') {
            populationQuery = populationQuery.eq('geo', selectedCountry);
          } else if (selectedRegion && selectedRegion !== 'all') {
            populationQuery = populationQuery.eq('geo_data.un_region', selectedRegion);
          }
          
          const result = await populationQuery;
          console.log(`Population query for ${year} result:`, result);
          return result;
        };

        const { data: currentYearPopulation, error: currentPopErr } = await fetchPopulationForYear(currentYear);
        
        if (currentPopErr) {
          console.error("Current year population error:", currentPopErr);
          setMetricData(prev => ({
            ...prev,
            populationTotal: { value: 'Error', trend: 0, isLoading: false }
          }));
        } else if (!currentYearPopulation || currentYearPopulation.length === 0) {
          console.warn(`No population data found for ${currentYear}`);
          setMetricData(prev => ({
            ...prev,
            populationTotal: { value: 'No data', trend: 0, isLoading: false }
          }));
        } else {
          const { data: prevYearPopulation } = await fetchPopulationForYear(previousYear);
          
          // Calculate population values
          const currentTotalPop = currentYearPopulation.reduce((sum, item) => {
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
          
          setMetricData(prev => ({
            ...prev,
            populationTotal: { 
              value: `${currentTotalPop.toFixed(1)}M`, 
              trend: parseFloat(populationTrend.toFixed(1)),
              isLoading: false
            }
          }));
        }
      } catch (err: any) {
        console.error("Population metric error:", err);
        setMetricData(prev => ({
          ...prev,
          populationTotal: { value: 'Error', trend: 0, isLoading: false }
        }));
      }
      
      // LABOR FORCE METRIC
      try {
        const fetchLaborForceForYear = async (year: number) => {
          let query = supabase
            .from('labor')
            .select('labour_force, geo, sex, geo_data(un_region)')
            .eq('year', year);
          
          if (selectedCountry && selectedCountry !== 'all') {
            query = query.eq('geo', selectedCountry);
          } else if (selectedRegion && selectedRegion !== 'all') {
            query = query.eq('geo_data.un_region', selectedRegion);
          }
          
          const result = await query;
          return result;
        };

        const { data: laborData, error: laborErr } = await fetchLaborForceForYear(currentYear);
        
        if (laborErr) {
          console.error("Labor force error:", laborErr);
          setMetricData(prev => ({
            ...prev,
            laborForceRate: { value: 'Error', trend: 0, isLoading: false }
          }));
        } else if (!laborData || laborData.length === 0) {
          console.warn(`No labor force data found for ${currentYear}`);
          setMetricData(prev => ({
            ...prev,
            laborForceRate: { value: 'No data', trend: 0, isLoading: false }
          }));
        } else {
          const { data: prevLaborData } = await fetchLaborForceForYear(previousYear);
          
          // Calculate average labor force participation rate
          const calculateAvgRate = (data: any[] | null) => {
            if (!data || data.length === 0) return 0;
            
            const validValues = data.filter(item => 
              item.labour_force !== null && !isNaN(item.labour_force)
            );
            
            if (validValues.length === 0) return 0;
            
            return validValues.reduce((sum, item) => sum + item.labour_force, 0) / validValues.length;
          };
          
          const currentRate = calculateAvgRate(laborData);
          const previousRate = calculateAvgRate(prevLaborData);
          
          const laborTrend = previousRate !== 0 
            ? ((currentRate - previousRate) / previousRate) * 100 
            : 0;
          
          setMetricData(prev => ({
            ...prev,
            laborForceRate: { 
              value: `${currentRate.toFixed(1)}%`, 
              trend: parseFloat(laborTrend.toFixed(1)),
              isLoading: false
            }
          }));
        }
      } catch (err: any) {
        console.error("Labor force metric error:", err);
        setMetricData(prev => ({
          ...prev,
          laborForceRate: { value: 'Error', trend: 0, isLoading: false }
        }));
      }
      
      // FERTILITY RATE METRIC
      try {
        const fetchFertilityForYear = async (year: number) => {
          let query = supabase
            .from('fertility')
            .select('fertility_rate, geo, geo_data(un_region)')
            .eq('year', year);
          
          if (selectedCountry && selectedCountry !== 'all') {
            query = query.eq('geo', selectedCountry);
          } else if (selectedRegion && selectedRegion !== 'all') {
            query = query.eq('geo_data.un_region', selectedRegion);
          }
          
          const result = await query;
          return result;
        };

        const { data: fertilityData, error: fertilityErr } = await fetchFertilityForYear(currentYear);
        
        if (fertilityErr) {
          console.error("Fertility rate error:", fertilityErr);
          setMetricData(prev => ({
            ...prev,
            fertilityRate: { value: 'Error', trend: 0, isLoading: false }
          }));
        } else if (!fertilityData || fertilityData.length === 0) {
          console.warn(`No fertility data found for ${currentYear}`);
          setMetricData(prev => ({
            ...prev,
            fertilityRate: { value: 'No data', trend: 0, isLoading: false }
          }));
        } else {
          const { data: prevFertilityData } = await fetchFertilityForYear(previousYear);
          
          // Calculate average fertility rate
          const calculateAvgRate = (data: any[] | null) => {
            if (!data || data.length === 0) return 0;
            
            const validValues = data.filter(item => 
              item.fertility_rate !== null && !isNaN(item.fertility_rate)
            );
            
            if (validValues.length === 0) return 0;
            
            return validValues.reduce((sum, item) => sum + item.fertility_rate, 0) / validValues.length;
          };
          
          const currentRate = calculateAvgRate(fertilityData);
          const previousRate = calculateAvgRate(prevFertilityData);
          
          const fertilityTrend = previousRate !== 0 
            ? ((currentRate - previousRate) / previousRate) * 100 
            : 0;
          
          setMetricData(prev => ({
            ...prev,
            fertilityRate: { 
              value: currentRate.toFixed(1), 
              trend: parseFloat(fertilityTrend.toFixed(1)),
              isLoading: false
            }
          }));
        }
      } catch (err: any) {
        console.error("Fertility rate metric error:", err);
        setMetricData(prev => ({
          ...prev,
          fertilityRate: { value: 'Error', trend: 0, isLoading: false }
        }));
      }
      
      // DEPENDENCY RATIO METRIC (simplified calculation)
      try {
        // For demonstration, we'll use a simplified approach 
        // In a real app, this would be calculated from population age groups
        const dependencyRatio = 52.8; // Example value
        const dependencyTrend = -0.5;
        
        setMetricData(prev => ({
          ...prev,
          dependencyRatio: {
            value: `${dependencyRatio}%`,
            trend: dependencyTrend,
            isLoading: false
          }
        }));
      } catch (err: any) {
        console.error('Error calculating dependency ratio:', err);
        setMetricData(prev => ({
          ...prev,
          dependencyRatio: { value: 'Error', trend: 0, isLoading: false }
        }));
      }
      
      setError(null);
    } catch (error: any) {
      console.error('Error fetching metric data:', error);
      setError(error.message || "Failed to load dashboard metrics");
      toast.error('Failed to load dashboard metrics: ' + (error.message || "Unknown error"));
      
      // Even if there's an error, exit the loading state for all metrics
      setMetricData({
        populationTotal: { value: 'Error', trend: 0, isLoading: false },
        laborForceRate: { value: 'Error', trend: 0, isLoading: false },
        fertilityRate: { value: 'Error', trend: 0, isLoading: false },
        dependencyRatio: { value: 'Error', trend: 0, isLoading: false }
      });
    }
  };

  const fetchChartData = async (availableYears: number[]) => {
    try {
      console.log("Fetching chart data for:", { 
        region: selectedRegion, 
        country: selectedCountry,
        availableYears 
      });
      
      setChartData(prev => ({
        ...prev,
        isLoading: true
      }));
      
      if (!availableYears || availableYears.length === 0) {
        console.warn("No available years to fetch chart data for");
        setChartData(prev => ({
          ...prev,
          fertilityData: [],
          laborForceData: [],
          populationPyramidData: [],
          dependencyRatioData: [],
          isLoading: false
        }));
        return;
      }

      // Fetch FERTILITY data
      try {
        let fertilityQuery = supabase
          .from('fertility')
          .select('year, fertility_rate, geo, geo_data(un_region)')
          .order('year', { ascending: true });
        
        if (selectedCountry && selectedCountry !== 'all') {
          fertilityQuery = fertilityQuery.eq('geo', selectedCountry);
        } else if (selectedRegion && selectedRegion !== 'all') {
          fertilityQuery = fertilityQuery.eq('geo_data.un_region', selectedRegion);
        }
        
        const { data: fertilityData, error: fertilityError } = await fertilityQuery;
        
        if (fertilityError) {
          console.error("Error fetching fertility data:", fertilityError);
          toast.error("Failed to load fertility data");
        }
        
        // Transform the data for the chart
        const formattedFertilityData = (fertilityData || [])
          .filter(item => item.fertility_rate !== null)
          .map(item => ({
            year: item.year,
            rate: item.fertility_rate,
            country: item.geo
          }));
        
        setChartData(prev => ({
          ...prev,
          fertilityData: formattedFertilityData
        }));
      } catch (err) {
        console.error("Error processing fertility data:", err);
      }
      
      // Fetch LABOR FORCE data
      try {
        let laborQuery = supabase
          .from('labor')
          .select('year, labour_force, sex, geo, geo_data(un_region)')
          .order('year', { ascending: true });
        
        if (selectedCountry && selectedCountry !== 'all') {
          laborQuery = laborQuery.eq('geo', selectedCountry);
        } else if (selectedRegion && selectedRegion !== 'all') {
          laborQuery = laborQuery.eq('geo_data.un_region', selectedRegion);
        }
        
        const { data: laborData, error: laborError } = await laborQuery;
        
        if (laborError) {
          console.error("Error fetching labor force data:", laborError);
          toast.error("Failed to load labor force data");
        }
        
        // Group labor data by year and country
        const laborByYearCountry: Record<string, any> = {};
        
        (laborData || []).forEach(item => {
          const key = `${item.year}-${item.geo}`;
          
          if (!laborByYearCountry[key]) {
            laborByYearCountry[key] = {
              year: item.year,
              country: item.geo,
              male: null,
              female: null
            };
          }
          
          if (item.sex === 'Male') {
            laborByYearCountry[key].male = item.labour_force;
          } else if (item.sex === 'Female') {
            laborByYearCountry[key].female = item.labour_force;
          }
        });
        
        const formattedLaborData = Object.values(laborByYearCountry);
        
        setChartData(prev => ({
          ...prev,
          laborForceData: formattedLaborData as any[]
        }));
      } catch (err) {
        console.error("Error processing labor force data:", err);
      }
      
      // POPULATION PYRAMID data (we'll use mock data for now)
      try {
        // Would fetch real data from Supabase in a complete implementation
        const mockPopulationPyramidData = [
          { age: '0 to 4', male: -300, female: 300, country: 'Global', year: availableYears[0] },
          { age: '5 to 9', male: -350, female: 350, country: 'Global', year: availableYears[0] },
          { age: '10 to 14', male: -400, female: 400, country: 'Global', year: availableYears[0] },
          { age: '15 to 19', male: -450, female: 450, country: 'Global', year: availableYears[0] },
          { age: '20 to 24', male: -500, female: 500, country: 'Global', year: availableYears[0] },
          { age: '25 to 29', male: -480, female: 480, country: 'Global', year: availableYears[0] },
          { age: '30 to 34', male: -460, female: 460, country: 'Global', year: availableYears[0] },
          { age: '35 to 39', male: -440, female: 440, country: 'Global', year: availableYears[0] },
          { age: '40 to 44', male: -420, female: 420, country: 'Global', year: availableYears[0] },
          { age: '45 to 49', male: -400, female: 400, country: 'Global', year: availableYears[0] },
          { age: '50 to 54', male: -350, female: 350, country: 'Global', year: availableYears[0] },
          { age: '55 to 59', male: -300, female: 300, country: 'Global', year: availableYears[0] },
          { age: '60 to 64', male: -250, female: 250, country: 'Global', year: availableYears[0] },
          { age: '65 to 69', male: -200, female: 200, country: 'Global', year: availableYears[0] },
          { age: '70 to 74', male: -150, female: 150, country: 'Global', year: availableYears[0] },
          { age: '75+', male: -100, female: 100, country: 'Global', year: availableYears[0] },
        ];
        
        setChartData(prev => ({
          ...prev,
          populationPyramidData: mockPopulationPyramidData
        }));
      } catch (err) {
        console.error("Error processing population pyramid data:", err);
      }
      
      // DEPENDENCY RATIO data (mock data for now)
      try {
        const mockDependencyData = [
          { country: 'United States', region: 'North America', dependencyRatio: 54, year: availableYears[0], latitude: 37.0902, longitude: -95.7129 },
          { country: 'Canada', region: 'North America', dependencyRatio: 50, year: availableYears[0], latitude: 56.1304, longitude: -106.3468 },
          { country: 'United Kingdom', region: 'Europe', dependencyRatio: 57, year: availableYears[0], latitude: 55.3781, longitude: -3.4360 },
          { country: 'Germany', region: 'Europe', dependencyRatio: 59, year: availableYears[0], latitude: 51.1657, longitude: 10.4515 },
          { country: 'Japan', region: 'Asia', dependencyRatio: 68, year: availableYears[0], latitude: 36.2048, longitude: 138.2529 },
        ];
        
        setChartData(prev => ({
          ...prev,
          dependencyRatioData: mockDependencyData,
          isLoading: false
        }));
      } catch (err) {
        console.error("Error processing dependency ratio data:", err);
        setChartData(prev => ({
          ...prev,
          isLoading: false
        }));
      }

      setError(null);
    } catch (error: any) {
      console.error('Error fetching chart data:', error);
      setError(error.message || "Failed to load dashboard charts");
      toast.error('Failed to load dashboard charts: ' + (error.message || "Unknown error"));
      
      // Even if there's an error, exit the loading state
      setChartData(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  };

  useEffect(() => {
    console.log("Dashboard data hook initialized with region/country:", { selectedRegion, selectedCountry });
    setIsLoading(true);
    
    // Sequentially fetch data to avoid race conditions
    const fetchData = async () => {
      try {
        // First get available years
        const availableData = await fetchAvailableYears();
        
        // Then fetch metrics and chart data with those years
        await Promise.all([
          fetchMetricData(availableData.years),
          fetchChartData(availableData.years)
        ]);
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error in data fetching sequence:", err);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [selectedRegion, selectedCountry]);

  return {
    metricData,
    chartData,
    isLoading,
    error,
    refresh: async () => {
      setIsLoading(true);
      
      try {
        const availableData = await fetchAvailableYears();
        
        await Promise.all([
          fetchMetricData(availableData.years),
          fetchChartData(availableData.years)
        ]);
      } catch (err) {
        console.error("Error refreshing data:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };
};

export default useDashboardData;
