
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Region = {
  id: string;
  name: string;
};

const dummyRegions = [
  { id: 'region-1', name: 'Western Europe' },
  { id: 'region-2', name: 'Eastern Europe' },
  { id: 'region-3', name: 'Northern Europe' },
  { id: 'region-4', name: 'Southern Europe' }
];

const dummyYears = [2018, 2019, 2020, 2021, 2022];

export const useDashboardInitialData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(2020);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch available years
        const { data: yearsData, error: yearsError } = await supabase
          .from('labor')
          .select('year')
          .order('year', { ascending: false });
          
        if (yearsError) {
          console.error('Error fetching years:', yearsError);
          setAvailableYears(dummyYears);
          setSelectedYear(dummyYears[dummyYears.length - 1]);
        } else if (yearsData && yearsData.length > 0) {
          const years = [...new Set(yearsData.map(item => item.year))];
          setAvailableYears(years);
          
          if (years.length > 0) {
            setSelectedYear(years[0]);
          }
        } else {
          setAvailableYears(dummyYears);
          setSelectedYear(dummyYears[dummyYears.length - 1]);
        }
        
        // Fetch available regions
        const { data: regionsData, error: regionsError } = await supabase
          .from('geo_data')
          .select('*');
          
        if (regionsError) {
          console.error('Error fetching regions:', regionsError);
          setRegions(dummyRegions);
        } else if (regionsData && regionsData.length > 0) {
          if (regionsData[0] && 'un_region' in regionsData[0]) {
            const uniqueRegions = [...new Set(regionsData
              .map(item => item.un_region)
              .filter(Boolean))];
            setRegions(uniqueRegions.map((name, index) => ({ id: `region-${index}`, name })));
          } else {
            console.warn('un_region field not found in geo_data table, using dummy data');
            setRegions(dummyRegions);
          }
        } else {
          setRegions(dummyRegions);
        }
        
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setAvailableYears(dummyYears);
        setSelectedYear(dummyYears[dummyYears.length - 1]);
        setRegions(dummyRegions);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  return {
    isLoading,
    selectedYear,
    setSelectedYear,
    availableYears,
    regions
  };
};
