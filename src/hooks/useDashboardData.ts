
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

const useDashboardData = (selectedRegion: string = '') => {
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
      // Fetch latest employment rate
      const { data: employmentRateData, error: employmentRateError } = await supabase
        .from('employment_rates')
        .select('*')
        .order('month', { ascending: false })
        .limit(2);
      
      if (employmentRateError) throw employmentRateError;
      
      // Fetch latest job openings
      const { data: jobOpeningsData, error: jobOpeningsError } = await supabase
        .from('job_openings')
        .select('*')
        .order('month', { ascending: false })
        .limit(2);
        
      if (jobOpeningsError) throw jobOpeningsError;
      
      // Fetch latest growth rate
      const { data: growthRateData, error: growthRateError } = await supabase
        .from('growth_rates')
        .select('*')
        .order('month', { ascending: false })
        .limit(2);
        
      if (growthRateError) throw growthRateError;
      
      // Fetch latest average salary
      const { data: salaryData, error: salaryError } = await supabase
        .from('average_salaries')
        .select('*')
        .order('month', { ascending: false })
        .limit(2);
        
      if (salaryError) throw salaryError;
      
      if (
        employmentRateData && employmentRateData.length > 0 &&
        jobOpeningsData && jobOpeningsData.length > 0 &&
        growthRateData && growthRateData.length > 0 &&
        salaryData && salaryData.length > 0
      ) {
        // Calculate trends
        const employmentTrend = employmentRateData.length > 1 
          ? (employmentRateData[0].rate - employmentRateData[1].rate)
          : 0;
          
        const jobOpeningsTrend = jobOpeningsData.length > 1
          ? ((jobOpeningsData[0].openings - jobOpeningsData[1].openings) / jobOpeningsData[1].openings) * 100
          : 0;
          
        const growthTrend = growthRateData.length > 1
          ? (growthRateData[0].rate - growthRateData[1].rate)
          : 0;
          
        const salaryTrend = salaryData.length > 1
          ? ((salaryData[0].amount - salaryData[1].amount) / salaryData[1].amount) * 100
          : 0;
          
        setMetricData({
          employmentRate: { 
            value: `${employmentRateData[0].rate}%`, 
            trend: parseFloat(employmentTrend.toFixed(1))
          },
          jobOpenings: { 
            value: jobOpeningsData[0].openings.toLocaleString(), 
            trend: parseFloat(jobOpeningsTrend.toFixed(1))
          },
          growthRate: { 
            value: `${growthRateData[0].rate}%`, 
            trend: parseFloat(growthTrend.toFixed(1))
          },
          averageSalary: { 
            value: `$${salaryData[0].amount.toLocaleString()}`, 
            trend: parseFloat(salaryTrend.toFixed(1))
          },
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error fetching metric data:', error);
      toast.error('Failed to load dashboard metrics');
      setMetricData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const fetchChartData = async () => {
    try {
      // Fetch employment data
      const { data: employmentData, error: employmentError } = await supabase
        .from('employment_rates')
        .select('*')
        .order('month', { ascending: true });
      
      if (employmentError) throw employmentError;
      
      // Fetch industry distribution data
      const { data: industryData, error: industryError } = await supabase
        .from('industry_distribution')
        .select('*');
        
      if (industryError) throw industryError;
      
      // Fetch salary data
      const { data: salaryData, error: salaryError } = await supabase
        .from('average_salaries')
        .select('*')
        .order('month', { ascending: true })
        .limit(6);
        
      if (salaryError) throw salaryError;

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

      if (selectedRegion) {
        populationQuery = populationQuery.eq('geo_data.un_region', selectedRegion);
      }

      const { data: populationData, error: populationError } = await populationQuery;
      
      if (populationError) throw populationError;

      // Build fertility query with optional region filter
      let fertilityQuery = supabase
        .from('fertility')
        .select('year, fertility_rate, geo_data!inner(un_region)')
        .order('year', { ascending: true });

      if (selectedRegion) {
        fertilityQuery = fertilityQuery.eq('geo_data.un_region', selectedRegion);
      }

      const { data: fertilityData, error: fertilityError } = await fertilityQuery;
      
      if (fertilityError) throw fertilityError;

      // Build labor force query with optional region filter
      let laborQuery = supabase
        .from('labor')
        .select('year, labour_force, sex, geo_data!inner(un_region)')
        .order('year', { ascending: true });

      if (selectedRegion) {
        laborQuery = laborQuery.eq('geo_data.un_region', selectedRegion);
      }

      const { data: laborData, error: laborError } = await laborQuery;
      
      if (laborError) throw laborError;
      
      // Format data for charts
      const formattedEmploymentData = employmentData.map(item => {
        const date = new Date(item.month);
        const unemployedRate = 100 - item.rate;
        return {
          month: date.toLocaleString('default', { month: 'short' }),
          employed: item.rate,
          unemployed: unemployedRate
        };
      });
      
      const formattedIndustryData = industryData.map(item => ({
        name: item.industry,
        value: item.percentage
      }));
      
      // Create formatted salary data by industry based on average salary
      const formattedSalaryData = salaryData.map(item => {
        const date = new Date(item.month);
        return {
          month: date.toLocaleString('default', { month: 'short' }),
          tech: item.amount * 1.2, // Tech gets 20% more than average
          health: item.amount * 1.1, // Healthcare gets 10% more than average
          retail: item.amount * 0.7 // Retail gets 30% less than average
        };
      });

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
        employmentData: formattedEmploymentData,
        industryData: formattedIndustryData,
        jobTypeData: [
          { name: 'Remote', value: 68 },
          { name: 'Hybrid', value: 45 },
          { name: 'On-site', value: 28 }
        ],
        salaryData: formattedSalaryData,
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
