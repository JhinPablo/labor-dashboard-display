
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
  isLoading: boolean;
};

const useDashboardData = () => {
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
      
      // Format data for charts
      const formattedEmploymentData = employmentData.map(item => {
        const date = new Date(item.month);
        const unemployedRate = 100 - item.rate;
        return {
          month: date.toLocaleString('default', { month: 'short' }),
          employed: item.rate * 100,
          unemployed: unemployedRate * 100
        };
      });
      
      const formattedIndustryData = industryData.map(item => ({
        name: item.industry,
        value: item.percentage
      }));
      
      // Create mock salary data by industry based on average salary
      const formattedSalaryData = salaryData.map(item => {
        const date = new Date(item.month);
        return {
          month: date.toLocaleString('default', { month: 'short' }),
          tech: item.amount * 1.2, // Tech gets 20% more than average
          health: item.amount * 1.1, // Healthcare gets 10% more than average
          retail: item.amount * 0.7 // Retail gets 30% less than average
        };
      });
      
      setChartData({
        employmentData: formattedEmploymentData,
        industryData: formattedIndustryData,
        jobTypeData: [
          { name: 'Remote', value: 68 },
          { name: 'Hybrid', value: 45 },
          { name: 'On-site', value: 28 }
        ],
        salaryData: formattedSalaryData,
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
  }, []);

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
