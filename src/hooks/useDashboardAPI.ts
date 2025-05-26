
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type MetricData = {
  populationTotal: { label: string; value: string; trend: number };
  laborForceRate: { label: string; value: string; trend: number };
  fertilityRate: { label: string; value: string; trend: number };
  dependencyRatio: { label: string; value: string; trend: number };
};

export type ChartData = {
  fertilityData: Array<{ year: number; rate: number; country: string }>;
  laborForceData: Array<{ year: number; male: number; female: number; country: string }>;
  populationPyramidData: Array<{ age: string; male: number; female: number; country: string; year: number }>;
  dependencyRatioData: Array<{ country: string; region: string; dependencyRatio: number; year: number; latitude: number; longitude: number }>;
  regions: Array<{ region: string }>;
  countries: Array<{ geo: string; un_region: string; latitude: number; longitude: number }>;
  years: number[];
};

export type DashboardData = {
  metrics: MetricData;
  chartData: ChartData;
  metadata: {
    selectedRegion: string;
    selectedYear: number;
    selectedCountry: string;
    totalCountries: number;
    dataPoints: {
      fertility: number;
      laborForce: number;
      population: number;
      dependency: number;
    };
  };
};

const useDashboardAPI = (selectedRegion: string = 'all', selectedYear?: number, selectedCountry: string = 'all') => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (region: string, year?: number, country: string = 'all') => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching dashboard data:', { region, year, country });
      
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const params = new URLSearchParams({
        region,
        country,
      });
      
      if (year) {
        params.append('year', year.toString());
      }
      
      const response = await fetch(
        `https://gtfbhtflgcqcvrkqpurv.supabase.co/functions/v1/dashboard-data?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }
      
      console.log('Dashboard data fetched successfully:', {
        metricsCount: Object.keys(result.data.metrics).length,
        dataPoints: result.data.metadata.dataPoints
      });
      
      setData(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching dashboard data:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedRegion, selectedYear, selectedCountry);
  }, [selectedRegion, selectedYear, selectedCountry]);

  const refresh = (year?: number) => {
    fetchData(selectedRegion, year, selectedCountry);
  };

  // Legacy compatibility - transform data to match old format
  const metricData = data ? {
    ...data.metrics,
    isLoading
  } : {
    populationTotal: { label: 'Population', value: '0', trend: 0 },
    laborForceRate: { label: 'Labor Force Rate', value: '0%', trend: 0 },
    fertilityRate: { label: 'Fertility Rate', value: '0', trend: 0 },
    dependencyRatio: { label: 'Dependency Ratio', value: '0%', trend: 0 },
    isLoading: true
  };

  const chartData = data ? {
    ...data.chartData,
    isLoading
  } : {
    fertilityData: [],
    laborForceData: [],
    populationPyramidData: [],
    dependencyRatioData: [],
    regions: [],
    countries: [],
    years: [],
    isLoading: true
  };

  return {
    data,
    metricData,
    chartData,
    isLoading,
    error,
    refresh: fetchData
  };
};

export default useDashboardAPI;
