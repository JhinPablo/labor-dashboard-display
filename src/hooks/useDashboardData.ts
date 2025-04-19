
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type MetricData = {
  employmentRate: { value: string; trend: number };
  jobOpenings: { value: string; trend: number };
  growthRate: { value: string; trend: number };
  averageSalary: { value: string; trend: number };
  isLoading: boolean;
};

export type ChartData = {
  employmentData: Array<{ month: string; employed: number; unemployed: number }>;
  industryData: Array<{ name: string; value: number }>;
  jobTypeData: Array<{ name: string; value: number }>;
  salaryData: Array<{ month: string; tech: number; health: number; retail: number }>;
  populationData: Array<{ age: string; male: number; female: number }>;
  fertilityData: Array<{ year: number; rate: number; region: string }>;
  laborForceData: Array<{ year: number; male: number; female: number; region: string }>;
  regions: Array<{ region: string }>;
  isLoading: boolean;
};

const useDashboardData = (selectedRegion: string = 'all') => {
  const [metricData, setMetricData] = useState<MetricData>({
    employmentRate: { value: '0%', trend: 0 },
    jobOpenings: { value: '0', trend: 0 },
    growthRate: { value: '0%', trend: 0 },
    averageSalary: { value: '$0', trend: 0 },
    isLoading: true
  });
  
  const [chartData, setChartData] = useState<ChartData>({
    employmentData: [],
    industryData: [],
    jobTypeData: [
      { name: 'Remote', value: 68 },
      { name: 'Hybrid', value: 45 },
      { name: 'On-site', value: 28 }
    ],
    salaryData: [],
    populationData: [],
    fertilityData: [],
    laborForceData: [],
    regions: [],
    isLoading: true
  });

  const fetchMetricData = async () => {
    try {
      // For now, we'll use mock data since we don't have actual employment_rates tables
      setMetricData({
        employmentRate: { 
          value: '94.5%', 
          trend: 1.2
        },
        jobOpenings: { 
          value: '13,800', 
          trend: 3.5
        },
        growthRate: { 
          value: '3.2%', 
          trend: 0.4
        },
        averageSalary: { 
          value: '$87,900', 
          trend: 1.7
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
      // Generate mock employment data
      const mockEmploymentData = [
        { month: 'Jan', employed: 94.0, unemployed: 6.0 },
        { month: 'Feb', employed: 94.5, unemployed: 5.5 },
        { month: 'Mar', employed: 95.2, unemployed: 4.8 },
        { month: 'Apr', employed: 95.8, unemployed: 4.2 },
      ];
      
      // Generate mock industry data
      const mockIndustryData = [
        { name: 'Technology', value: 25.5 },
        { name: 'Healthcare', value: 18.3 },
        { name: 'Finance', value: 15.7 },
        { name: 'Manufacturing', value: 12.9 },
        { name: 'Retail', value: 10.2 },
        { name: 'Education', value: 8.6 },
        { name: 'Other', value: 8.8 },
      ];
      
      // Generate mock salary data
      const mockSalaryData = [
        { month: 'Jan', tech: 100200, health: 91900, retail: 58450 },
        { month: 'Feb', tech: 101040, health: 92620, retail: 58940 },
        { month: 'Mar', tech: 103704, health: 95062, retail: 60494 },
        { month: 'Apr', tech: 105480, health: 96690, retail: 61530 },
      ];
      
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
      ).map(region => ({ region }));

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
      
      setChartData({
        employmentData: mockEmploymentData,
        industryData: mockIndustryData,
        jobTypeData: [
          { name: 'Remote', value: 68 },
          { name: 'Hybrid', value: 45 },
          { name: 'On-site', value: 28 }
        ],
        salaryData: mockSalaryData,
        populationData: processedPopulationData,
        fertilityData: formattedFertilityData,
        laborForceData: processedLaborForceData,
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
