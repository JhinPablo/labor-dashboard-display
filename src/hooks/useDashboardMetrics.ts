
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
          // Get countries for the selected region
          let countries: string[] = [];
          if (selectedRegion !== 'all') {
            const { data: geoData, error: geoError } = await supabase
              .from('geo_data')
              .select('geo')
              .eq('un_region', selectedRegion);
              
            if (geoError) {
              console.error('Error fetching geo data:', geoError);
              setIsLoading(false);
              return;
            }
            
            countries = geoData?.map(g => g.geo) || [];
          }
          
          // Fetch labor force data
          let laborQuery = supabase
            .from('labor')
            .select('geo, labour_force, year')
            .eq('year', selectedYear);
            
          if (selectedRegion !== 'all' && countries.length > 0) {
            laborQuery = laborQuery.in('geo', countries);
          }
            
          const { data: laborData, error: laborError } = await laborQuery;
          
          if (laborError) {
            console.error('Error fetching labor data:', laborError);
            setIsLoading(false);
            return;
          }
          
          if (!laborData || laborData.length === 0) {
            console.log('No labor data found for the selected criteria');
            setMetrics({
              laborForce: { value: 0, trend: 0 },
              fertilityRate: { value: 0, trend: 0 },
              population: { value: 0, trend: 0 },
              topCountries: []
            });
            setIsLoading(false);
            return;
          }
          
          // Calculate total labor force
          const totalLaborForce = laborData.reduce((sum, item) => sum + (item.labour_force || 0), 0);
          
          // Fetch previous year labor force for trend
          const prevYear = selectedYear - 1;
          let prevLaborQuery = supabase
            .from('labor')
            .select('labour_force')
            .eq('year', prevYear);
            
          if (selectedRegion !== 'all' && countries.length > 0) {
            prevLaborQuery = prevLaborQuery.in('geo', countries);
          }
            
          const { data: prevLaborData, error: prevLaborError } = await prevLaborQuery;
          
          if (prevLaborError) {
            console.error('Error fetching previous labor data:', prevLaborError);
          }
          
          // Calculate trend percentage
          const prevTotalLaborForce = prevLaborData?.reduce((sum, item) => sum + (item.labour_force || 0), 0) || 0;
          const laborForceTrend = prevTotalLaborForce ? ((totalLaborForce - prevTotalLaborForce) / prevTotalLaborForce) * 100 : 0;
          
          // Fetch fertility rate data
          let fertilityQuery = supabase
            .from('fertility')
            .select('geo, fertility_rate')
            .eq('year', selectedYear);
            
          if (selectedRegion !== 'all' && countries.length > 0) {
            fertilityQuery = fertilityQuery.in('geo', countries);
          }
            
          const { data: fertilityData, error: fertilityError } = await fertilityQuery;
          
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
            : 0;
          
          // Fetch top countries with highest labor force
          let topCountriesQuery = supabase
            .from('labor')
            .select('geo, labour_force')
            .eq('year', selectedYear)
            .order('labour_force', { ascending: false })
            .limit(3);
            
          if (selectedRegion !== 'all' && countries.length > 0) {
            topCountriesQuery = topCountriesQuery.in('geo', countries);
          }
            
          const { data: topCountriesData, error: topCountriesError } = await topCountriesQuery;
          
          if (topCountriesError) {
            console.error('Error fetching top countries:', topCountriesError);
          }
          
          const topCountries = topCountriesData && topCountriesData.length > 0
            ? topCountriesData.map(item => ({
                country: item.geo,
                value: item.labour_force || 0
              }))
            : [];
          
          // Fetch population data
          let populationQuery = supabase
            .from('population')
            .select('population')
            .eq('year', selectedYear)
            .eq('sex', 'Total')
            .eq('age', 'Total');
            
          if (selectedRegion !== 'all' && countries.length > 0) {
            populationQuery = populationQuery.in('geo', countries);
          }
            
          const { data: populationData, error: populationError } = await populationQuery;
          
          if (populationError) {
            console.error('Error fetching population data:', populationError);
          }
          
          const totalPopulation = populationData
            ? populationData.reduce((sum, item) => sum + (item.population || 0), 0)
            : 0;
          
          // Fetch previous year population for trend
          let prevPopQuery = supabase
            .from('population')
            .select('population')
            .eq('year', prevYear)
            .eq('sex', 'Total')
            .eq('age', 'Total');
            
          if (selectedRegion !== 'all' && countries.length > 0) {
            prevPopQuery = prevPopQuery.in('geo', countries);
          }
            
          const { data: prevPopData, error: prevPopError } = await prevPopQuery;
          
          if (prevPopError) {
            console.error('Error fetching previous population data:', prevPopError);
          }
          
          const prevTotalPopulation = prevPopData
            ? prevPopData.reduce((sum, item) => sum + (item.population || 0), 0)
            : 0;
            
          const populationTrend = prevTotalPopulation 
            ? ((totalPopulation - prevTotalPopulation) / prevTotalPopulation) * 100 
            : 0;
          
          setMetrics({
            laborForce: { 
              value: totalLaborForce, 
              trend: laborForceTrend 
            },
            fertilityRate: { 
              value: avgFertilityRate, 
              trend: 0 // Could calculate fertility trend if needed
            },
            population: { 
              value: totalPopulation, 
              trend: populationTrend 
            },
            topCountries: topCountries
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

  return { metrics, isLoading };
};
