
import { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseClient';
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

  // Fetch available years based on selected region/country
  const fetchAvailableYears = async () => {
    try {
      let yearsQuery = supabase
        .from('population')
        .select('year')
        .eq('sex', 'Total')
        .eq('age', 'Total')
        .order('year', { ascending: true });
      
      if (selectedRegion && selectedRegion !== 'all') {
        const { data: geoData } = await supabase
          .from('geo_data')
          .select('geo')
          .eq('un_region', selectedRegion);
        
        if (geoData && geoData.length > 0) {
          const geoList = geoData.map(item => item.geo);
          yearsQuery = yearsQuery.in('geo', geoList);
        }
      } else if (selectedRegion === 'all') {
        // Exclude Western Asia if "all" is selected
        const { data: geoData } = await supabase
          .from('geo_data')
          .select('geo')
          .not('un_region', 'eq', 'Western Asia');
          
        if (geoData && geoData.length > 0) {
          const geoList = geoData.map(item => item.geo);
          yearsQuery = yearsQuery.in('geo', geoList);
        }
      }

      const { data: yearsData, error: yearsError } = await yearsQuery;
      
      if (yearsError) {
        console.error('Error fetching years:', yearsError);
        toast.error('Failed to load year data');
        return [];
      }
      
      // Extract unique years and sort them
      const uniqueYears = Array.from(new Set(yearsData.map(item => item.year))).sort((a, b) => a - b);
      return uniqueYears;
    } catch (error) {
      console.error('Error in fetchAvailableYears:', error);
      toast.error('Failed to load year data');
      return [];
    }
  };

  const fetchMetricData = async (year: number | null) => {
    try {
      // Get available years
      const availableYears = await fetchAvailableYears();
      
      if (!availableYears || availableYears.length === 0) {
        setMetricData(prev => ({
          ...prev,
          isLoading: false,
          populationTotal: { value: 'No data', trend: 0 },
          laborForceRate: { value: 'No data', trend: 0 },
          fertilityRate: { value: 'No data', trend: 0 },
          dependencyRatio: { value: 'No data', trend: 0 }
        }));
        return;
      }

      // If no year is provided, use the latest year
      const currentYear = year || availableYears[availableYears.length - 1];
      
      // Find previous year (not necessarily currentYear - 1, but the previous available year)
      const currentYearIndex = availableYears.indexOf(currentYear);
      const previousYear = currentYearIndex > 0 ? availableYears[currentYearIndex - 1] : null;

      // 1. Calculate population totals
      const fetchPopulationForYear = async (year: number) => {
        try {
          let populationQuery = supabase
            .from('population')
            .select('population, geo, geo_data!inner(un_region)')
            .eq('sex', 'Total')
            .eq('age', 'Total')
            .eq('year', year);
          
          if (selectedRegion && selectedRegion !== 'all') {
            populationQuery = populationQuery.eq('geo_data.un_region', selectedRegion);
          } else {
            populationQuery = populationQuery.not('geo_data.un_region', 'eq', 'Western Asia');
          }

          const { data, error } = await populationQuery;
          
          if (error) {
            console.error(`Error fetching population for year ${year}:`, error);
            return [];
          }
          
          return data || [];
        } catch (error) {
          console.error(`Error in fetchPopulationForYear for ${year}:`, error);
          return [];
        }
      };

      const currentYearPopulation = await fetchPopulationForYear(currentYear);
      const prevYearPopulation = previousYear ? await fetchPopulationForYear(previousYear) : [];
      
      const currentTotalPop = currentYearPopulation.reduce((sum, item) => sum + (item.population || 0), 0) / 1000000;
      const prevTotalPop = prevYearPopulation.reduce((sum, item) => sum + (item.population || 0), 0) / 1000000;
      
      const populationTrend = prevTotalPop !== 0 
        ? ((currentTotalPop - prevTotalPop) / prevTotalPop) * 100 
        : 0;

      // 2. Calculate labor force rate
      const fetchLaborForce = async (year: number) => {
        try {
          let laborQuery = supabase
            .from('labor')
            .select('labour_force, sex, geo, geo_data!inner(un_region)')
            .eq('year', year)
            .eq('sex', 'Total');
          
          let populationQuery = supabase
            .from('population')
            .select('population, sex, age, geo, geo_data!inner(un_region)')
            .eq('year', year)
            .eq('sex', 'Total')
            .or('age.in.(From 15 to 19 years,From 20 to 24 years,From 25 to 29 years,From 30 to 34 years,From 35 to 39 years,From 40 to 44 years,From 45 to 49 years,From 50 to 54 years,From 55 to 59 years,From 60 to 64 years)');

          if (selectedRegion && selectedRegion !== 'all') {
            laborQuery = laborQuery.eq('geo_data.un_region', selectedRegion);
            populationQuery = populationQuery.eq('geo_data.un_region', selectedRegion);
          } else {
            laborQuery = laborQuery.not('geo_data.un_region', 'eq', 'Western Asia');
            populationQuery = populationQuery.not('geo_data.un_region', 'eq', 'Western Asia');
          }

          const [laborResult, populationResult] = await Promise.all([
            laborQuery,
            populationQuery
          ]);
          
          if (laborResult.error) {
            console.error(`Error fetching labor force for year ${year}:`, laborResult.error);
            return { labor: [], population: [] };
          }
          
          if (populationResult.error) {
            console.error(`Error fetching population for labor force calc for year ${year}:`, populationResult.error);
            return { labor: [], population: [] };
          }

          return {
            labor: laborResult.data || [],
            population: populationResult.data || []
          };
        } catch (error) {
          console.error(`Error in fetchLaborForce for ${year}:`, error);
          return { labor: [], population: [] };
        }
      };

      const currentYearLaborData = await fetchLaborForce(currentYear);
      const prevYearLaborData = previousYear ? await fetchLaborForce(previousYear) : { labor: [], population: [] };

      // Group population by country for working age
      const groupByCountry = (data: any[]) => {
        return data.reduce((acc, item) => {
          if (!acc[item.geo]) {
            acc[item.geo] = 0;
          }
          acc[item.geo] += (item.population || 0);
          return acc;
        }, {});
      };

      // Group labor force by country
      const groupLaborByCountry = (data: any[]) => {
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
      
      // 3. Calculate fertility rates
      const fetchFertilityRate = async (year: number) => {
        try {
          let fertilityQuery = supabase
            .from('fertility')
            .select('fertility_rate, geo, geo_data!inner(un_region)')
            .eq('year', year);
          
          if (selectedRegion && selectedRegion !== 'all') {
            fertilityQuery = fertilityQuery.eq('geo_data.un_region', selectedRegion);
          } else {
            fertilityQuery = fertilityQuery.not('geo_data.un_region', 'eq', 'Western Asia');
          }

          const { data, error } = await fertilityQuery;
          
          if (error) {
            console.error(`Error fetching fertility rate for year ${year}:`, error);
            return [];
          }
          
          return data || [];
        } catch (error) {
          console.error(`Error in fetchFertilityRate for ${year}:`, error);
          return [];
        }
      };

      const currentFertilityData = await fetchFertilityRate(currentYear);
      const prevFertilityData = previousYear ? await fetchFertilityRate(previousYear) : [];

      const validCurrentFertility = currentFertilityData.filter(item => item.fertility_rate !== null);
      const validPrevFertility = prevFertilityData.filter(item => item.fertility_rate !== null);

      const avgCurrentFertility = validCurrentFertility.length > 0
        ? validCurrentFertility.reduce((sum, item) => sum + Number(item.fertility_rate), 0) / validCurrentFertility.length
        : 0;
      
      const avgPrevFertility = validPrevFertility.length > 0
        ? validPrevFertility.reduce((sum, item) => sum + Number(item.fertility_rate), 0) / validPrevFertility.length
        : 0;
      
      const fertilityTrend = avgPrevFertility !== 0 
        ? ((avgCurrentFertility - avgPrevFertility) / avgPrevFertility) * 100 
        : 0;

      // 4. Calculate dependency ratio
      const fetchDependencyRatio = async (year: number) => {
        try {
          let dependentPopQuery = supabase
            .from('population')
            .select('population, sex, age, geo, geo_data!inner(un_region)')
            .eq('year', year)
            .eq('sex', 'Total')
            .or('age.in.(From 0 to 4 years,From 5 to 9 years,From 10 to 14 years,From 65 to 69 years,From 70 to 74 years,From 75 to 79 years,From 80 to 84 years,From 85 to 89 years,From 90 to 94 years,From 95 to 99 years,100 years and over)');

          let workingAgePopQuery = supabase
            .from('population')
            .select('population, sex, age, geo, geo_data!inner(un_region)')
            .eq('year', year)
            .eq('sex', 'Total')
            .or('age.in.(From 15 to 19 years,From 20 to 24 years,From 25 to 29 years,From 30 to 34 years,From 35 to 39 years,From 40 to 44 years,From 45 to 49 years,From 50 to 54 years,From 55 to 59 years,From 60 to 64 years)');

          if (selectedRegion && selectedRegion !== 'all') {
            dependentPopQuery = dependentPopQuery.eq('geo_data.un_region', selectedRegion);
            workingAgePopQuery = workingAgePopQuery.eq('geo_data.un_region', selectedRegion);
          } else {
            dependentPopQuery = dependentPopQuery.not('geo_data.un_region', 'eq', 'Western Asia');
            workingAgePopQuery = workingAgePopQuery.not('geo_data.un_region', 'eq', 'Western Asia');
          }

          const [dependentResult, workingAgeResult] = await Promise.all([
            dependentPopQuery,
            workingAgePopQuery
          ]);
          
          if (dependentResult.error) {
            console.error(`Error fetching dependent population for year ${year}:`, dependentResult.error);
            return { dependent: [], workingAge: [] };
          }
          
          if (workingAgeResult.error) {
            console.error(`Error fetching working age population for year ${year}:`, workingAgeResult.error);
            return { dependent: [], workingAge: [] };
          }

          return {
            dependent: dependentResult.data || [],
            workingAge: workingAgeResult.data || []
          };
        } catch (error) {
          console.error(`Error in fetchDependencyRatio for ${year}:`, error);
          return { dependent: [], workingAge: [] };
        }
      };

      const currentYearDependencyData = await fetchDependencyRatio(currentYear);
      const prevYearDependencyData = previousYear ? await fetchDependencyRatio(previousYear) : { dependent: [], workingAge: [] };

      // Group dependent and working age population by country
      const groupDependentsByCountry = currentYearDependencyData.dependent.reduce((acc, item) => {
        if (!acc[item.geo]) acc[item.geo] = 0;
        acc[item.geo] += (item.population || 0);
        return acc;
      }, {} as Record<string, number>);

      const groupWorkingAgeByCountry = currentYearDependencyData.workingAge.reduce((acc, item) => {
        if (!acc[item.geo]) acc[item.geo] = 0;
        acc[item.geo] += (item.population || 0);
        return acc;
      }, {} as Record<string, number>);

      const prevGroupDependentsByCountry = prevYearDependencyData.dependent.reduce((acc, item) => {
        if (!acc[item.geo]) acc[item.geo] = 0;
        acc[item.geo] += (item.population || 0);
        return acc;
      }, {} as Record<string, number>);

      const prevGroupWorkingAgeByCountry = prevYearDependencyData.workingAge.reduce((acc, item) => {
        if (!acc[item.geo]) acc[item.geo] = 0;
        acc[item.geo] += (item.population || 0);
        return acc;
      }, {} as Record<string, number>);

      // Calculate dependency ratio for current year
      let currentDependencyRatio = 0;
      let currentDependencyCount = 0;

      for (const country in groupDependentsByCountry) {
        if (groupWorkingAgeByCountry[country] && groupWorkingAgeByCountry[country] > 0) {
          currentDependencyRatio += (groupDependentsByCountry[country] / groupWorkingAgeByCountry[country]) * 100;
          currentDependencyCount++;
        }
      }

      // Calculate dependency ratio for previous year
      let prevDependencyRatio = 0;
      let prevDependencyCount = 0;

      for (const country in prevGroupDependentsByCountry) {
        if (prevGroupWorkingAgeByCountry[country] && prevGroupWorkingAgeByCountry[country] > 0) {
          prevDependencyRatio += (prevGroupDependentsByCountry[country] / prevGroupWorkingAgeByCountry[country]) * 100;
          prevDependencyCount++;
        }
      }

      const avgCurrentDependencyRatio = currentDependencyCount > 0 
        ? currentDependencyRatio / currentDependencyCount 
        : 0;

      const avgPrevDependencyRatio = prevDependencyCount > 0 
        ? prevDependencyRatio / prevDependencyCount 
        : 0;

      const dependencyTrend = avgPrevDependencyRatio !== 0 
        ? ((avgCurrentDependencyRatio - avgPrevDependencyRatio) / avgPrevDependencyRatio) * 100 
        : 0;

      // Update the metric data
      setMetricData({
        populationTotal: { 
          value: currentTotalPop > 0 ? `${currentTotalPop.toFixed(1)}M` : 'No data', 
          trend: parseFloat(populationTrend.toFixed(1))
        },
        laborForceRate: { 
          value: avgCurrentLaborForceRate > 0 ? `${avgCurrentLaborForceRate.toFixed(1)}%` : 'No data', 
          trend: parseFloat(laborForceTrend.toFixed(1))
        },
        fertilityRate: { 
          value: avgCurrentFertility > 0 ? avgCurrentFertility.toFixed(2) : 'No data', 
          trend: parseFloat(fertilityTrend.toFixed(1))
        },
        dependencyRatio: {
          value: avgCurrentDependencyRatio > 0 ? `${avgCurrentDependencyRatio.toFixed(1)}%` : 'No data',
          trend: parseFloat(dependencyTrend.toFixed(1))
        },
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching metric data:', error);
      toast.error('Failed to load dashboard metrics');
      setMetricData(prev => ({ 
        ...prev, 
        isLoading: false,
        populationTotal: { value: 'Error', trend: 0 },
        laborForceRate: { value: 'Error', trend: 0 },
        fertilityRate: { value: 'Error', trend: 0 },
        dependencyRatio: { value: 'Error', trend: 0 }
      }));
    }
  };

  const fetchChartData = async (year: number | null = null) => {
    try {
      // 1. Fetch unique regions excluding Western Asia
      const { data: regionsData, error: regionsError } = await supabase
        .from('geo_data')
        .select('un_region')
        .not('un_region', 'is', null)
        .not('un_region', 'eq', 'Western Asia')
        .order('un_region', { ascending: true });

      if (regionsError) {
        console.error('Error fetching regions:', regionsError);
        toast.error('Failed to load regions data');
        setChartData(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      // Format regions data (unique values)
      const uniqueRegions = Array.from(
        new Set(regionsData.map(item => item.un_region))
      ).filter(Boolean).map(region => ({ region: region as string }));

      // 2. Fetch countries data
      let countriesQuery = supabase
        .from('geo_data')
        .select('geo, un_region, latitude, longitude')
        .not('un_region', 'eq', 'Western Asia')
        .order('geo', { ascending: true });

      if (selectedRegion && selectedRegion !== 'all') {
        countriesQuery = countriesQuery.eq('un_region', selectedRegion);
      }

      const { data: countriesData, error: countriesError } = await countriesQuery;
      
      if (countriesError) {
        console.error('Error fetching countries:', countriesError);
        toast.error('Failed to load countries data');
        setChartData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // 3. Fetch years data - this is the critical fix for the years dropdown
      const availableYears = await fetchAvailableYears();
      
      if (!availableYears || availableYears.length === 0) {
        setChartData(prev => ({ ...prev, isLoading: false, years: [] }));
        return;
      }
      
      // If no year is provided, use the latest year
      const selectedYear = year || availableYears[availableYears.length - 1];

      // 4. Fetch fertility data
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
      
      if (fertilityError) {
        console.error('Error fetching fertility data:', fertilityError);
        toast.error('Failed to load fertility data');
        setChartData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // 5. Fetch labor force data
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
      
      if (laborError) {
        console.error('Error fetching labor data:', laborError);
        toast.error('Failed to load labor force data');
        setChartData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // 6. Fetch population data for pyramid and dependency ratio
      let populationQuery = supabase
        .from('population')
        .select('year, sex, age, population, geo, geo_data!inner(un_region)')
        .order('year', { ascending: true });

      if (selectedRegion && selectedRegion !== 'all') {
        populationQuery = populationQuery.eq('geo_data.un_region', selectedRegion);
      } else {
        populationQuery = populationQuery.not('geo_data.un_region', 'eq', 'Western Asia');
      }

      const { data: populationData, error: populationError } = await populationQuery;
      
      if (populationError) {
        console.error('Error fetching population data:', populationError);
        toast.error('Failed to load population data');
        setChartData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Format fertility data
      const formattedFertilityData = fertilityData
        .filter(item => item.fertility_rate !== null)
        .map(item => ({
          year: item.year,
          rate: item.fertility_rate || 0,
          country: item.geo
        }));

      // Calculate labor force rates by gender
      const laborForceRates: Array<{ year: number; male: number; female: number; country: string }> = [];
      
      // Group by country, year and gender
      type LaborItem = {
        country: string;
        year: number;
        sex: string;
        laborForce: number;
      };

      const laborByCountryYearGender: Record<string, LaborItem> = {};
      
      laborData.forEach(item => {
        if (item && typeof item === 'object') {
          const geo = item.geo as string;
          const year = item.year as number;
          const sex = item.sex as string;
          const key = `${geo}-${year}-${sex}`;
          
          if (!laborByCountryYearGender[key]) {
            laborByCountryYearGender[key] = {
              country: geo,
              year: year,
              sex: sex,
              laborForce: 0
            };
          }
          
          laborByCountryYearGender[key].laborForce += (item.labour_force as number || 0);
        }
      });
      
      // Get working age population by country, year and gender
      type PopulationItem = {
        country: string;
        year: number;
        sex: string;
        population: number;
      };
      
      const populationByCountryYearGender: Record<string, PopulationItem> = {};
      
      populationData.forEach(item => {
        if (item && typeof item === 'object') {
          const age = item.age as string;
          if (age && age.startsWith('From') && 
              !age.includes('Total') && 
              (parseInt(age.split(' ')[1]) >= 15 && parseInt(age.split(' ')[1]) <= 64 || 
               parseInt(age.split(' ')[3]) >= 15 && parseInt(age.split(' ')[3]) <= 64)) {
            
            const geo = item.geo as string;
            const year = item.year as number;
            const sex = item.sex as string;
            const key = `${geo}-${year}-${sex}`;
            
            if (!populationByCountryYearGender[key]) {
              populationByCountryYearGender[key] = {
                country: geo,
                year: year,
                sex: sex,
                population: 0
              };
            }
            
            populationByCountryYearGender[key].population += (item.population as number || 0);
          }
        }
      });
      
      // Calculate labor force rates
      Object.values(laborByCountryYearGender).forEach(laborItem => {
        const popKey = `${laborItem.country}-${laborItem.year}-${laborItem.sex}`;
        if (populationByCountryYearGender[popKey] && 
            populationByCountryYearGender[popKey].population > 0) {
          const rate = (laborItem.laborForce * 1000 / populationByCountryYearGender[popKey].population) * 100;
          
          if (laborItem.sex === 'Male' || laborItem.sex === 'Female') {
            // Find existing entry or create new one
            let entry = laborForceRates.find(item => 
              item.country === laborItem.country && item.year === laborItem.year
            );
            
            if (!entry) {
              entry = { country: laborItem.country, year: laborItem.year, male: 0, female: 0 };
              laborForceRates.push(entry);
            }
            
            if (laborItem.sex === 'Male') {
              entry.male = rate;
            } else if (laborItem.sex === 'Female') {
              entry.female = rate;
            }
          }
        }
      });

      // Prepare population pyramid data
      const populationPyramidData: Array<{
        age: string;
        male: number;
        female: number;
        country: string;
        year: number;
      }> = [];

      // Group population data by country, year, age and sex
      type PyramidItem = {
        country: string;
        year: number;
        age: string;
        male: number;
        female: number;
      };
      
      const popByCountryYearAgeSex: Record<string, PyramidItem> = {};
      
      populationData.forEach(item => {
        if (item && typeof item === 'object' && item.year === selectedYear) {
          const sex = item.sex as string;
          const age = item.age as string;
          
          if (sex && sex !== 'Total' && age && age !== 'Total') {
            const geo = item.geo as string;
            const year = item.year as number;
            const key = `${geo}-${year}-${age}`;
            
            if (!popByCountryYearAgeSex[key]) {
              popByCountryYearAgeSex[key] = {
                country: geo,
                year: year,
                age: age,
                male: 0,
                female: 0
              };
            }
            
            if (sex === 'Male') {
              popByCountryYearAgeSex[key].male = item.population as number || 0;
            } else if (sex === 'Female') {
              popByCountryYearAgeSex[key].female = item.population as number || 0;
            }
          }
        }
      });
      
      // Convert to array format for the pyramid chart
      Object.values(popByCountryYearAgeSex).forEach(item => {
        populationPyramidData.push(item);
      });

      // Calculate dependency ratio for the map
      const dependencyRatioData: Array<{
        country: string;
        region: string;
        dependencyRatio: number;
        year: number;
        latitude: number | null;
        longitude: number | null;
      }> = [];

      // Group population by country, year and age group (dependent vs. working age)
      const groupPopulationByCountry = (data: any[], ageFilter: (age: string) => boolean) => {
        return data.reduce((acc, item) => {
          if (item && item.year === selectedYear && item.sex === 'Total') {
            const age = item.age as string;
            if (ageFilter(age)) {
              const country = item.geo as string;
              if (!acc[country]) acc[country] = 0;
              acc[country] += (item.population as number || 0);
            }
          }
          return acc;
        }, {} as Record<string, number>);
      };
      
      const dependentsByCountry = groupPopulationByCountry(
        populationData,
        (age) => {
          if (age === 'Total') return false;
          const ageNum = parseInt(age.split(' ')[1]);
          return (ageNum >= 0 && ageNum < 15) || ageNum >= 65;
        }
      );
      
      const workingAgeByCountry = groupPopulationByCountry(
        populationData,
        (age) => {
          if (age === 'Total') return false;
          const ageNum = parseInt(age.split(' ')[1]);
          return ageNum >= 15 && ageNum < 65;
        }
      );
      
      // Calculate dependency ratio for each country
      Object.keys(dependentsByCountry).forEach(country => {
        if (workingAgeByCountry[country] && workingAgeByCountry[country] > 0) {
          const countryInfo = countriesData.find(c => c.geo === country) || {
            un_region: '',
            latitude: null,
            longitude: null
          };
          
          const ratio = (dependentsByCountry[country] / workingAgeByCountry[country]) * 100;
          
          dependencyRatioData.push({
            country,
            region: countryInfo.un_region as string,
            dependencyRatio: ratio,
            year: selectedYear,
            latitude: countryInfo.latitude,
            longitude: countryInfo.longitude
          });
        }
      });

      // Update chart data
      setChartData({
        fertilityData: formattedFertilityData,
        laborForceData: laborForceRates,
        populationPyramidData,
        dependencyRatioData,
        regions: uniqueRegions,
        countries: countriesData as Array<{ geo: string; un_region: string }>,
        years: availableYears,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
      toast.error('Failed to load dashboard charts');
      setChartData(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    setIsLoading(true);
    
    // Reset states
    setMetricData(prev => ({ ...prev, isLoading: true }));
    setChartData(prev => ({ ...prev, isLoading: true }));
    
    // First fetch chart data to get available years
    fetchChartData()
      .then(() => {
        // Then fetch metric data using the first year if available
        fetchMetricData(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedRegion]);

  return {
    metricData,
    chartData,
    isLoading,
    refresh: (year: number | null = null) => {
      setIsLoading(true);
      setMetricData(prev => ({ ...prev, isLoading: true }));
      setChartData(prev => ({ ...prev, isLoading: true }));
      
      fetchChartData(year)
        .then(() => fetchMetricData(year))
        .finally(() => setIsLoading(false));
    }
  };
};

export default useDashboardData;
