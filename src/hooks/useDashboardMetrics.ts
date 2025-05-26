
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useDashboardMetrics = (selectedRegion: string, selectedYear: number) => {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    laborForce: { value: 0, trend: 0 },
    fertilityRate: { value: 0, trend: 0 },
    population: { value: 0, trend: 0 },
    topCountries: [] as {country: string, value: number}[]
  });

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
            laborQuery.like('geo', `%${selectedRegion}%`);
          }
            
          const { data: laborData, error: laborError } = await laborQuery;
          
          if (laborError) {
            console.error('Error fetching labor data:', laborError);
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
              trend: dummyMetrics.fertilityRate.trend
            },
            population: { 
              value: totalPopulation, 
              trend: populationTrend 
            },
            topCountries: topCountries
          });
          
        } catch (error) {
          console.error('Error fetching dashboard metrics:', error);
          setMetrics(dummyMetrics);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchDashboardMetrics();
  }, [selectedRegion, selectedYear]);

  return { metrics, isLoading };
};
