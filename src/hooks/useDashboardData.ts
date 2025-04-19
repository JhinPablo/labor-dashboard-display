
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type MetricData = {
  populationTotal: { value: string; trend: number };
  laborForceRate: { value: string; trend: number };
  fertilityRate: { value: string; trend: number };
  regionCount: { value: string; trend: number };
  isLoading: boolean;
};

export type ChartData = {
  populationData: Array<{ age: string; male: number; female: number }>;
  fertilityData: Array<{ year: number; rate: number; region: string }>;
  laborForceData: Array<{ year: number; male: number; female: number; region: string }>;
  populationByRegion: Array<{ region: string; population: number }>;
  regions: Array<{ region: string }>;
  isLoading: boolean;
};

const useDashboardData = (selectedRegion: string = 'all') => {
  const [metricData, setMetricData] = useState<MetricData>({
    populationTotal: { value: '0', trend: 0 },
    laborForceRate: { value: '0%', trend: 0 },
    fertilityRate: { value: '0', trend: 0 },
    regionCount: { value: '0', trend: 0 },
    isLoading: true
  });
  
  const [chartData, setChartData] = useState<ChartData>({
    populationData: [],
    fertilityData: [],
    laborForceData: [],
    populationByRegion: [],
    regions: [],
    isLoading: true
  });

  const fetchMetricData = async () => {
    try {
      // Calculate population total and trend
      let populationQuery = supabase
        .from('population')
        .select('population, geo_data!inner(un_region)');

      if (selectedRegion && selectedRegion !== 'all') {
        populationQuery = populationQuery.eq('geo_data.un_region', selectedRegion);
      }

      const { data: populationData, error: populationError } = await populationQuery;
      
      if (populationError) throw populationError;

      const totalPopulation = populationData.reduce((sum, item) => sum + (item.population || 0), 0) / 1000000;
      
      // Calculate labor force rate
      let laborQuery = supabase
        .from('labor')
        .select('labour_force, geo_data!inner(un_region)');

      if (selectedRegion && selectedRegion !== 'all') {
        laborQuery = laborQuery.eq('geo_data.un_region', selectedRegion);
      }

      const { data: laborData, error: laborError } = await laborQuery;
      
      if (laborError) throw laborError;

      const totalLaborForce = laborData.reduce((sum, item) => sum + (item.labour_force || 0), 0);
      const laborForceRate = totalPopulation > 0 ? (totalLaborForce / totalPopulation) * 100 : 0;
      
      // Get average fertility rate
      let fertilityQuery = supabase
        .from('fertility')
        .select('fertility_rate, geo_data!inner(un_region)')
        .order('year', { ascending: false })
        .limit(100);  // Get recent data

      if (selectedRegion && selectedRegion !== 'all') {
        fertilityQuery = fertilityQuery.eq('geo_data.un_region', selectedRegion);
      }

      const { data: fertilityData, error: fertilityError } = await fertilityQuery;
      
      if (fertilityError) throw fertilityError;

      const avgFertilityRate = fertilityData.length > 0 
        ? fertilityData.reduce((sum, item) => sum + (item.fertility_rate || 0), 0) / fertilityData.length
        : 0;

      // Get region count
      const { data: regionsData, error: regionsError } = await supabase
        .from('geo_data')
        .select('un_region')
        .not('un_region', 'is', null);

      if (regionsError) throw regionsError;
      
      const uniqueRegionsCount = new Set(regionsData.map(item => item.un_region)).size;

      setMetricData({
        populationTotal: { 
          value: `${totalPopulation.toFixed(1)}M`, 
          trend: 1.2 // Placeholder trend for demonstration
        },
        laborForceRate: { 
          value: `${laborForceRate.toFixed(1)}%`, 
          trend: 0.8
        },
        fertilityRate: { 
          value: avgFertilityRate.toFixed(2), 
          trend: -0.3
        },
        regionCount: { 
          value: String(uniqueRegionsCount), 
          trend: 0
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
      // Fetch unique regions
      const { data: regionsData, error: regionsError } = await supabase
        .from('geo_data')
        .select('un_region')
        .not('un_region', 'is', null)
        .order('un_region', { ascending: true });

      if (regionsError) throw regionsError;
      
      // Format regions data (unique values)
      const uniqueRegions = Array.from(
        new Set(regionsData.map(item => item.un_region))
      ).filter(Boolean).map(region => ({ region: region as string }));

      // Build population query with optional region filter
      let populationQuery = supabase
        .from('population')
        .select('age, sex, population, geo_data!inner(un_region)')
        .order('age', { ascending: true });

      if (selectedRegion && selectedRegion !== 'all') {
        populationQuery = populationQuery.eq('geo_data.un_region', selectedRegion);
      }

      const { data: populationData, error: populationError } = await populationQuery;
      
      if (populationError) throw populationError;

      // Build fertility query with optional region filter
      let fertilityQuery = supabase
        .from('fertility')
        .select('year, fertility_rate, geo_data!inner(un_region)')
        .order('year', { ascending: true });

      if (selectedRegion && selectedRegion !== 'all') {
        fertilityQuery = fertilityQuery.eq('geo_data.un_region', selectedRegion);
      }

      const { data: fertilityData, error: fertilityError } = await fertilityQuery;
      
      if (fertilityError) throw fertilityError;

      // Build labor force query with optional region filter
      let laborQuery = supabase
        .from('labor')
        .select('year, labour_force, sex, geo_data!inner(un_region)')
        .order('year', { ascending: true });

      if (selectedRegion && selectedRegion !== 'all') {
        laborQuery = laborQuery.eq('geo_data.un_region', selectedRegion);
      }

      const { data: laborData, error: laborError } = await laborQuery;
      
      if (laborError) throw laborError;

      // Format population data by age groups and gender
      const processedPopulationData = populationData.reduce((acc, item) => {
        const existingAgeGroup = acc.find(group => group.age === item.age);
        
        if (existingAgeGroup) {
          if (item.sex === 'male') {
            existingAgeGroup.male = (existingAgeGroup.male || 0) + (item.population || 0);
          } else if (item.sex === 'female') {
            existingAgeGroup.female = (existingAgeGroup.female || 0) + (item.population || 0);
          }
        } else {
          acc.push({
            age: item.age,
            male: item.sex === 'male' ? (item.population || 0) : 0,
            female: item.sex === 'female' ? (item.population || 0) : 0
          });
        }
        
        return acc;
      }, [] as Array<{ age: string; male: number; female: number }>);

      // Format fertility data
      const formattedFertilityData = fertilityData.map(item => ({
        year: item.year,
        rate: item.fertility_rate || 0,
        region: item.geo_data.un_region
      }));

      // Format labor force data
      const processedLaborForceData = laborData.reduce((acc, item) => {
        const existingYear = acc.find(group => group.year === item.year);
        
        if (existingYear) {
          if (item.sex === 'male') {
            existingYear.male = (existingYear.male || 0) + (item.labour_force || 0);
          } else if (item.sex === 'female') {
            existingYear.female = (existingYear.female || 0) + (item.labour_force || 0);
          }
        } else {
          acc.push({
            year: item.year,
            male: item.sex === 'male' ? (item.labour_force || 0) : 0,
            female: item.sex === 'female' ? (item.labour_force || 0) : 0,
            region: item.geo_data.un_region
          });
        }
        
        return acc;
      }, [] as Array<{ year: number; male: number; female: number; region: string }>);
      
      // Calculate population by region
      const populationByRegion = populationData.reduce((acc, item) => {
        const region = item.geo_data.un_region;
        const existingRegion = acc.find(r => r.region === region);
        
        if (existingRegion) {
          existingRegion.population += (item.population || 0);
        } else {
          acc.push({
            region,
            population: item.population || 0
          });
        }
        
        return acc;
      }, [] as Array<{ region: string; population: number }>);
      
      // Sort and limit to top regions
      const topRegions = [...populationByRegion]
        .sort((a, b) => b.population - a.population)
        .slice(0, 10);
      
      setChartData({
        populationData: processedPopulationData,
        fertilityData: formattedFertilityData,
        laborForceData: processedLaborForceData,
        populationByRegion: topRegions,
        regions: uniqueRegions,
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
