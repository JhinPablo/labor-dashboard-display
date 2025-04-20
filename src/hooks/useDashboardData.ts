
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
  dependencyRatioData: Array<{ country: string; region: string; dependencyRatio: number; year: number; latitude: number | null; longitude: number | null }>;
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
        ? validCurrentFertility.reduce((sum, item) => sum + Number(item.fertility_rate), 0) / validCurrentFertility.length
        : 0;
      
      const avgPrevFertility = validPrevFertility.length > 0
        ? validPrevFertility.reduce((sum, item) => sum + Number(item.fertility_rate), 0) / validPrevFertility.length
        : 0;
      
      const fertilityTrend = avgPrevFertility !== 0 
        ? ((avgCurrentFertility - avgPrevFertility) / avgPrevFertility) * 100 
        : 0;

      // Calculate dependency ratio
      const fetchDependencyRatio = async (year: number) => {
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
        } else if (selectedRegion === 'all') {
          dependentPopQuery = dependentPopQuery.not('geo_data.un_region', 'eq', 'Western Asia');
          workingAgePopQuery = workingAgePopQuery.not('geo_data.un_region', 'eq', 'Western Asia');
        }

        const [dependentResult, workingAgeResult] = await Promise.all([
          dependentPopQuery,
          workingAgePopQuery
        ]);

        return {
          dependent: dependentResult.data || [],
          workingAge: workingAgeResult.data || [],
          dependentError: dependentResult.error,
          workingAgeError: workingAgeResult.error
        };
      };

      const currentYearDependencyData = await fetchDependencyRatio(currentYear);
      if (currentYearDependencyData.dependentError) throw currentYearDependencyData.dependentError;
      if (currentYearDependencyData.workingAgeError) throw currentYearDependencyData.workingAgeError;

      const prevYearDependencyData = await fetchDependencyRatio(previousYear);
      if (prevYearDependencyData.dependentError) throw prevYearDependencyData.dependentError;
      if (prevYearDependencyData.workingAgeError) throw prevYearDependencyData.workingAgeError;

      // Group dependent and working age population by country
      const groupDependentsByCountry = currentYearDependencyData.dependent.reduce((acc, item) => {
        if (!acc[item.geo]) acc[item.geo] = 0;
        acc[item.geo] += (item.population || 0);
        return acc;
      }, {});

      const groupWorkingAgeByCountry = currentYearDependencyData.workingAge.reduce((acc, item) => {
        if (!acc[item.geo]) acc[item.geo] = 0;
        acc[item.geo] += (item.population || 0);
        return acc;
      }, {});

      const prevGroupDependentsByCountry = prevYearDependencyData.dependent.reduce((acc, item) => {
        if (!acc[item.geo]) acc[item.geo] = 0;
        acc[item.geo] += (item.population || 0);
        return acc;
      }, {});

      const prevGroupWorkingAgeByCountry = prevYearDependencyData.workingAge.reduce((acc, item) => {
        if (!acc[item.geo]) acc[item.geo] = 0;
        acc[item.geo] += (item.population || 0);
        return acc;
      }, {});

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
        dependencyRatio: {
          value: `${avgCurrentDependencyRatio.toFixed(1)}%`,
          trend: parseFloat(dependencyTrend.toFixed(1))
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

      // Fetch population data for pyramid and dependency ratio
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
      
      if (populationError) throw populationError;

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
      const laborByCountryYearGender = laborData.reduce((acc, item) => {
        const key = `${item.geo}-${item.year}-${item.sex}`;
        if (!acc[key]) {
          acc[key] = {
            country: item.geo,
            year: item.year,
            sex: item.sex,
            laborForce: 0
          };
        }
        acc[key].laborForce += (item.labour_force || 0);
        return acc;
      }, {});
      
      // Get working age population by country, year and gender
      const populationByCountryYearGender = populationData.reduce((acc, item) => {
        if (item.age.startsWith('From') && 
            !item.age.includes('Total') && 
            (parseInt(item.age.split(' ')[1]) >= 15 && parseInt(item.age.split(' ')[1]) <= 64 || 
             parseInt(item.age.split(' ')[3]) >= 15 && parseInt(item.age.split(' ')[3]) <= 64)) {
          const key = `${item.geo}-${item.year}-${item.sex}`;
          if (!acc[key]) {
            acc[key] = {
              country: item.geo,
              year: item.year,
              sex: item.sex,
              population: 0
            };
          }
          acc[key].population += (item.population || 0);
        }
        return acc;
      }, {});
      
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
      const popByCountryYearAgeSex = populationData.reduce((acc, item) => {
        if (item.sex !== 'Total' && item.age !== 'Total') {
          const key = `${item.geo}-${item.year}-${item.age}`;
          if (!acc[key]) {
            acc[key] = {
              country: item.geo,
              year: item.year,
              age: item.age,
              male: 0,
              female: 0
            };
          }
          
          if (item.sex === 'Male') {
            acc[key].male = item.population || 0;
          } else if (item.sex === 'Female') {
            acc[key].female = item.population || 0;
          }
        }
        return acc;
      }, {});
      
      // Convert to array format
      Object.values(popByCountryYearAgeSex).forEach(item => {
        populationPyramidData.push(item);
      });

      // Calculate dependency ratio
      const dependencyRatioData: Array<{
        country: string;
        region: string;
        dependencyRatio: number;
        year: number;
        latitude: number | null;
        longitude: number | null;
      }> = [];

      // Group population by country, year and age group (dependent vs. working age)
      uniqueYears.forEach(year => {
        const dependentsByCountry = {};
        const workingAgeByCountry = {};
        
        populationData.forEach(item => {
          if (item.year === year && item.sex === 'Total') {
            const age = parseInt(item.age.split(' ')[1]);
            const country = item.geo;
            
            // Initialize if not already done
            if (!dependentsByCountry[country]) dependentsByCountry[country] = 0;
            if (!workingAgeByCountry[country]) workingAgeByCountry[country] = 0;
            
            if (item.age === 'Total') {
              // Skip total age group
            } else if ((age >= 0 && age < 15) || age >= 65) {
              dependentsByCountry[country] += (item.population || 0);
            } else if (age >= 15 && age <= 64) {
              workingAgeByCountry[country] += (item.population || 0);
            }
          }
        });
        
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
              region: countryInfo.un_region,
              dependencyRatio: ratio,
              year,
              latitude: countryInfo.latitude,
              longitude: countryInfo.longitude
            });
          }
        });
      });

      setChartData({
        fertilityData: formattedFertilityData,
        laborForceData: laborForceRates,
        populationPyramidData,
        dependencyRatioData,
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
    setIsLoading(true);
    fetchMetricData();
    fetchChartData();
  }, [selectedRegion]);

  return {
    metricData,
    chartData,
    isLoading,
    refresh: () => {
      setIsLoading(true);
      fetchMetricData();
      fetchChartData();
    }
  };
};

export default useDashboardData;
