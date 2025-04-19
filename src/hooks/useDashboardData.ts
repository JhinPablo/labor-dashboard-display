
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type MetricData = {
  populationTotal: { value: string; trend: number };
  laborForceRate: { value: string; trend: number };
  fertilityRate: { value: string; trend: number };
  isLoading: boolean;
};

export type ChartData = {
  populationData: Array<{ age: string; male: number; female: number }>;
  fertilityData: Array<{ year: number; rate: number; country: string }>;
  laborForceData: Array<{ year: number; male: number; female: number; country: string }>;
  populationByCountry: Array<{ country: string; region: string; population: number; latitude: number | null; longitude: number | null }>;
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
    isLoading: true
  });
  
  const [chartData, setChartData] = useState<ChartData>({
    populationData: [],
    fertilityData: [],
    laborForceData: [],
    populationByCountry: [],
    regions: [],
    countries: [],
    years: [],
    isLoading: true
  });

  const fetchMetricData = async () => {
    try {
      // Get available years from population data
      const { data: yearsData, error: yearsError } = await supabase
        .from('population')
        .select('year')
        .order('year', { ascending: false })
        .limit(10);

      if (yearsError) throw yearsError;
      
      const uniqueYears = Array.from(new Set(yearsData.map(item => item.year))).sort((a, b) => b - a);
      const currentYear = uniqueYears[0] || 0;
      const previousYear = uniqueYears[1] || 0;
      
      // Calculate population totals for current and previous year
      const fetchPopulationForYear = async (year: number) => {
        let populationQuery = supabase
          .from('population')
          .select('population, geo, geo_data!inner(un_region)')
          .eq('sex', 'Total')
          .eq('age', 'Total')
          .eq('year', year);
        
        if (selectedRegion && selectedRegion !== 'all') {
          populationQuery = populationQuery.eq('geo_data.un_region', selectedRegion);
        } else if (selectedRegion === 'all') {
          // Exclude Western Asia if "all" is selected
          populationQuery = populationQuery.not('geo_data.un_region', 'eq', 'Western Asia');
        }

        return await populationQuery;
      };

      const { data: currentYearPopulation, error: currentPopErr } = await fetchPopulationForYear(currentYear);
      if (currentPopErr) throw currentPopErr;

      const { data: prevYearPopulation, error: prevPopErr } = await fetchPopulationForYear(previousYear);
      if (prevPopErr) throw prevPopErr;

      const currentTotalPop = currentYearPopulation.reduce((sum, item) => sum + (item.population || 0), 0) / 1000000;
      const prevTotalPop = prevYearPopulation.reduce((sum, item) => sum + (item.population || 0), 0) / 1000000;
      
      const populationTrend = prevTotalPop !== 0 
        ? ((currentTotalPop - prevTotalPop) / prevTotalPop) * 100 
        : 0;

      // Calculate labor force rate for current and previous year
      const fetchLaborForce = async (year: number) => {
        let laborQuery = supabase
          .from('labor')
          .select('labour_force, sex, geo, geo_data!inner(un_region)')
          .eq('year', year);
        
        let populationQuery = supabase
          .from('population')
          .select('population, sex, age, geo, geo_data!inner(un_region)')
          .eq('year', year)
          .or('age.in.(From 15 to 19 years,From 20 to 24 years,From 25 to 29 years,From 30 to 34 years,From 35 to 39 years,From 40 to 44 years,From 45 to 49 years,From 50 to 54 years,From 55 to 59 years,From 60 to 64 years)');

        if (selectedRegion && selectedRegion !== 'all') {
          laborQuery = laborQuery.eq('geo_data.un_region', selectedRegion);
          populationQuery = populationQuery.eq('geo_data.un_region', selectedRegion);
        } else if (selectedRegion === 'all') {
          // Exclude Western Asia if "all" is selected
          laborQuery = laborQuery.not('geo_data.un_region', 'eq', 'Western Asia');
          populationQuery = populationQuery.not('geo_data.un_region', 'eq', 'Western Asia');
        }

        const [laborResult, populationResult] = await Promise.all([
          laborQuery,
          populationQuery
        ]);

        return {
          labor: laborResult.data || [],
          population: populationResult.data || [],
          laborError: laborResult.error,
          populationError: populationResult.error
        };
      };

      const currentYearLaborData = await fetchLaborForce(currentYear);
      if (currentYearLaborData.laborError) throw currentYearLaborData.laborError;
      if (currentYearLaborData.populationError) throw currentYearLaborData.populationError;

      const prevYearLaborData = await fetchLaborForce(previousYear);
      if (prevYearLaborData.laborError) throw prevYearLaborData.laborError;
      if (prevYearLaborData.populationError) throw prevYearLaborData.populationError;

      // Group population by country
      const groupByCountry = (data) => {
        return data.reduce((acc, item) => {
          if (!acc[item.geo]) {
            acc[item.geo] = 0;
          }
          acc[item.geo] += (item.population || 0);
          return acc;
        }, {});
      };

      // Group labor force by country
      const groupLaborByCountry = (data) => {
        return data.reduce((acc, item) => {
          if (!acc[item.geo]) {
            acc[item.geo] = 0;
          }
          acc[item.geo] += (item.labour_force || 0);
          return acc;
        }, {});
      };

      const currentWorkingAgePop = groupByCountry(currentYearLaborData.population);
      const prevWorkingAgePop = groupByCountry(prevYearLaborData.population);
      
      const currentLaborForce = groupLaborByCountry(currentYearLaborData.labor);
      const prevLaborForce = groupLaborByCountry(prevYearLaborData.labor);

      // Calculate labor force rates
      let currentLaborForceRate = 0;
      let currentLaborForceRateCount = 0;
      let prevLaborForceRate = 0;
      let prevLaborForceRateCount = 0;

      for (const country in currentWorkingAgePop) {
        if (currentLaborForce[country] && currentWorkingAgePop[country]) {
          currentLaborForceRate += (currentLaborForce[country] * 1000 / currentWorkingAgePop[country]) * 100;
          currentLaborForceRateCount++;
        }
      }

      for (const country in prevWorkingAgePop) {
        if (prevLaborForce[country] && prevWorkingAgePop[country]) {
          prevLaborForceRate += (prevLaborForce[country] * 1000 / prevWorkingAgePop[country]) * 100;
          prevLaborForceRateCount++;
        }
      }

      // Get average rates
      const avgCurrentLaborForceRate = currentLaborForceRateCount > 0 
        ? currentLaborForceRate / currentLaborForceRateCount 
        : 0;
      
      const avgPrevLaborForceRate = prevLaborForceRateCount > 0 
        ? prevLaborForceRate / prevLaborForceRateCount 
        : 0;
      
      const laborForceTrend = avgPrevLaborForceRate !== 0 
        ? ((avgCurrentLaborForceRate - avgPrevLaborForceRate) / avgPrevLaborForceRate) * 100 
        : 0;
      
      // Calculate fertility rates for current and previous year
      const fetchFertilityRate = async (year: number) => {
        let fertilityQuery = supabase
          .from('fertility')
          .select('fertility_rate, geo, geo_data!inner(un_region)')
          .eq('year', year);
        
        if (selectedRegion && selectedRegion !== 'all') {
          fertilityQuery = fertilityQuery.eq('geo_data.un_region', selectedRegion);
        } else if (selectedRegion === 'all') {
          // Exclude Western Asia if "all" is selected
          fertilityQuery = fertilityQuery.not('geo_data.un_region', 'eq', 'Western Asia');
        }

        return await fertilityQuery;
      };

      const { data: currentFertilityData, error: currentFertErr } = await fetchFertilityRate(currentYear);
      if (currentFertErr) throw currentFertErr;

      const { data: prevFertilityData, error: prevFertErr } = await fetchFertilityRate(previousYear);
      if (prevFertErr) throw prevFertErr;

      const validCurrentFertility = currentFertilityData.filter(item => item.fertility_rate !== null);
      const validPrevFertility = prevFertilityData.filter(item => item.fertility_rate !== null);

      const avgCurrentFertility = validCurrentFertility.length > 0
        ? validCurrentFertility.reduce((sum, item) => sum + item.fertility_rate, 0) / validCurrentFertility.length
        : 0;
      
      const avgPrevFertility = validPrevFertility.length > 0
        ? validPrevFertility.reduce((sum, item) => sum + item.fertility_rate, 0) / validPrevFertility.length
        : 0;
      
      const fertilityTrend = avgPrevFertility !== 0 
        ? ((avgCurrentFertility - avgPrevFertility) / avgPrevFertility) * 100 
        : 0;

      setMetricData({
        populationTotal: { 
          value: `${currentTotalPop.toFixed(1)}M`, 
          trend: parseFloat(populationTrend.toFixed(1))
        },
        laborForceRate: { 
          value: `${avgCurrentLaborForceRate.toFixed(1)}%`, 
          trend: parseFloat(laborForceTrend.toFixed(1))
        },
        fertilityRate: { 
          value: avgCurrentFertility.toFixed(2), 
          trend: parseFloat(fertilityTrend.toFixed(1))
        },
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching metric data:', error);
      toast.error('Failed to load dashboard metrics');
      setMetricData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const fetchChartData = async () => {
    try {
      // Fetch unique regions excluding Western Asia
      const { data: regionsData, error: regionsError } = await supabase
        .from('geo_data')
        .select('un_region')
        .not('un_region', 'is', null)
        .not('un_region', 'eq', 'Western Asia')
        .order('un_region', { ascending: true });

      if (regionsError) throw regionsError;
      
      // Format regions data (unique values)
      const uniqueRegions = Array.from(
        new Set(regionsData.map(item => item.un_region))
      ).filter(Boolean).map(region => ({ region: region as string }));

      // Fetch countries data
      let countriesQuery = supabase
        .from('geo_data')
        .select('geo, un_region, latitude, longitude')
        .not('un_region', 'eq', 'Western Asia')
        .order('geo', { ascending: true });

      if (selectedRegion && selectedRegion !== 'all') {
        countriesQuery = countriesQuery.eq('un_region', selectedRegion);
      }

      const { data: countriesData, error: countriesError } = await countriesQuery;
      
      if (countriesError) throw countriesError;

      // Fetch years data
      const { data: yearsData, error: yearsError } = await supabase
        .from('population')
        .select('year')
        .order('year', { ascending: true });

      if (yearsError) throw yearsError;
      
      const uniqueYears = Array.from(new Set(yearsData.map(item => item.year))).sort((a, b) => a - b);

      // Fetch population data
      let populationQuery = supabase
        .from('population')
        .select('age, sex, population, year, geo, geo_data!inner(un_region)')
        .eq('sex', 'Total')
        .eq('age', 'Total')
        .order('year', { ascending: false });

      if (selectedRegion && selectedRegion !== 'all') {
        populationQuery = populationQuery.eq('geo_data.un_region', selectedRegion);
      } else {
        populationQuery = populationQuery.not('geo_data.un_region', 'eq', 'Western Asia');
      }

      const { data: populationData, error: populationError } = await populationQuery;
      
      if (populationError) throw populationError;

      // Fetch fertility data
      let fertilityQuery = supabase
        .from('fertility')
        .select('year, fertility_rate, geo, geo_data!inner(un_region)')
        .order('year', { ascending: true });

      if (selectedRegion && selectedRegion !== 'all') {
        fertilityQuery = fertilityQuery.eq('geo_data.un_region', selectedRegion);
      } else {
        fertilityQuery = fertilityQuery.not('geo_data.un_region', 'eq', 'Western Asia');
      }

      const { data: fertilityData, error: fertilityError } = await fertilityQuery;
      
      if (fertilityError) throw fertilityError;

      // Fetch labor force data
      let laborQuery = supabase
        .from('labor')
        .select('year, labour_force, sex, geo, geo_data!inner(un_region)')
        .order('year', { ascending: true });

      if (selectedRegion && selectedRegion !== 'all') {
        laborQuery = laborQuery.eq('geo_data.un_region', selectedRegion);
      } else {
        laborQuery = laborQuery.not('geo_data.un_region', 'eq', 'Western Asia');
      }

      const { data: laborData, error: laborError } = await laborQuery;
      
      if (laborError) throw laborError;

      // Format population by country data
      const latestYear = uniqueYears[uniqueYears.length - 1];
      const populationByCountry = populationData
        .filter(item => item.year === latestYear)
        .map(item => {
          const countryInfo = countriesData.find(c => c.geo === item.geo) || {
            latitude: null,
            longitude: null
          };
          
          return {
            country: item.geo,
            region: item.geo_data.un_region,
            population: item.population || 0,
            latitude: countryInfo.latitude,
            longitude: countryInfo.longitude
          };
        });

      // Format fertility data
      const formattedFertilityData = fertilityData
        .filter(item => item.fertility_rate !== null)
        .map(item => ({
          year: item.year,
          rate: item.fertility_rate || 0,
          country: item.geo
        }));

      // Calculate labor force rates by country and year
      const laborForceRates: Record<string, Record<number, Record<string, number>>> = {};
      
      // First, gather working age population by country, year, and gender
      const workingAgePop: Record<string, Record<number, Record<string, number>>> = {};
      
      // Fetch working age population
      let workingAgeQuery = supabase
        .from('population')
        .select('population, sex, age, year, geo, geo_data!inner(un_region)')
        .or('age.in.(From 15 to 19 years,From 20 to 24 years,From 25 to 29 years,From 30 to 34 years,From 35 to 39 years,From 40 to 44 years,From 45 to 49 years,From 50 to 54 years,From 55 to 59 years,From 60 to 64 years)');

      if (selectedRegion && selectedRegion !== 'all') {
        workingAgeQuery = workingAgeQuery.eq('geo_data.un_region', selectedRegion);
      } else {
        workingAgeQuery = workingAgeQuery.not('geo_data.un_region', 'eq', 'Western Asia');
      }

      const { data: workingAgeData, error: workingAgeError } = await workingAgeQuery;
      
      if (workingAgeError) throw workingAgeError;
      
      // Calculate working age population per country/year/gender
      workingAgeData.forEach(item => {
        const country = item.geo;
        const year = item.year;
        const sex = item.sex;
        
        if (!workingAgePop[country]) workingAgePop[country] = {};
        if (!workingAgePop[country][year]) workingAgePop[country][year] = { male: 0, female: 0, total: 0 };
        
        if (sex === 'Male') {
          workingAgePop[country][year].male += (item.population || 0);
        } else if (sex === 'Female') {
          workingAgePop[country][year].female += (item.population || 0);
        }
        workingAgePop[country][year].total += (item.population || 0);
      });
      
      // Calculate labor force per country/year/gender
      laborData.forEach(item => {
        const country = item.geo;
        const year = item.year;
        const sex = item.sex;
        
        if (!laborForceRates[country]) laborForceRates[country] = {};
        if (!laborForceRates[country][year]) laborForceRates[country][year] = { male: 0, female: 0 };
        
        // Convert from thousands to individuals for calculation
        const laborForce = (item.labour_force || 0) * 1000;
        
        if (workingAgePop[country] && workingAgePop[country][year]) {
          if (sex === 'Male' && workingAgePop[country][year].male > 0) {
            laborForceRates[country][year].male = (laborForce / workingAgePop[country][year].male) * 100;
          } else if (sex === 'Female' && workingAgePop[country][year].female > 0) {
            laborForceRates[country][year].female = (laborForce / workingAgePop[country][year].female) * 100;
          }
        }
      });
      
      // Format labor force data for charts
      const processedLaborForceData: Array<{ year: number; male: number; female: number; country: string }> = [];
      
      // Calculate average across all countries if no specific country is selected
      Object.entries(laborForceRates).forEach(([country, yearData]) => {
        Object.entries(yearData).forEach(([yearStr, rates]) => {
          const year = parseInt(yearStr);
          processedLaborForceData.push({
            year,
            male: rates.male,
            female: rates.female,
            country
          });
        });
      });
      
      // Sort by year for proper display
      processedLaborForceData.sort((a, b) => a.year - b.year);

      setChartData({
        populationData: [], // Not using this chart anymore
        fertilityData: formattedFertilityData,
        laborForceData: processedLaborForceData,
        populationByCountry,
        regions: uniqueRegions,
        countries: countriesData,
        years: uniqueYears,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
      toast.error('Failed to load dashboard charts');
      setChartData(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchMetricData();
    fetchChartData();
  }, [selectedRegion]);

  return {
    metricData,
    chartData,
    refresh: () => {
      setMetricData(prev => ({ ...prev, isLoading: true }));
      setChartData(prev => ({ ...prev, isLoading: true }));
      fetchMetricData();
      fetchChartData();
    }
  };
};

export default useDashboardData;
