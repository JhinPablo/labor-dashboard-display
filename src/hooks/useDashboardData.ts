import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type MetricData = {
  populationTotal: { value: string; trend: number };
  laborForceRate: { value: string; trend: number };
  fertilityRate: { value: string; trend: number };
  dependencyRatio: { value: string; trend: number };
  isLoading: boolean;
};

export type ChartData = {
  fertilityData: any[];
  laborForceData: any[];
  populationPyramidData: any[];
  dependencyRatioData: any[];
  regions: { region: string }[];
  countries: { geo: string; un_region: string }[];
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

  const fetchData = async (year: number | null = null) => {
    setChartData(prev => ({ ...prev, isLoading: true }));
    setMetricData(prev => ({ ...prev, isLoading: true }));

    const { data: regionData } = await supabase
      .from('geo_data')
      .select('un_region')
      .neq('un_region', 'Western Asia');

    const regions = [...new Set(regionData?.map(r => r.un_region).filter(Boolean))]
      .map(region => ({ region }));

    const { data: countryData } = await supabase
      .from('geo_data')
      .select('geo, un_region, latitude, longitude')
      .neq('un_region', 'Western Asia');

    const countries = countryData || [];

    const { data: yearData } = await supabase
      .from('population')
      .select('year')
      .eq('sex', 'Total')
      .eq('age', 'Total');

    const years = [...new Set(yearData?.map(p => p.year))].sort((a, b) => a - b);
    const latestYear = years[years.length - 1];
    const selectedYear = year || latestYear;

    // Fertility Trend
    const { data: fertilityRaw } = await supabase
      .from('fertility')
      .select('year, fertility_rate, geo, geo_data!inner(un_region)')
      .order('year', { ascending: true });

    const fertilityData = fertilityRaw?.filter(item =>
      selectedRegion === 'all' || item.geo_data?.un_region === selectedRegion
    ) || [];


    const fertilityFormatted = fertilityData.map(item => ({
      year: item.year,
      rate: item.fertility_rate,
      country: item.geo
    }));

    // Labor Force by Gender
    const { data: laborRaw } = await supabase
      .from('labor')
      .select('year, sex, geo, labour_force, geo_data!inner(un_region)')
      .eq('sex', 'Males')
      .order('year', { ascending: true });

    const { data: laborFem } = await supabase
      .from('labor')
      .select('year, sex, geo, labour_force, geo_data!inner(un_region)')
      .eq('sex', 'Females')
      .order('year', { ascending: true });

    const combinedLabor = (laborRaw || []).map(male => {
      const female = laborFem?.find(f => f.year === male.year && f.geo === male.geo);
      if (selectedRegion !== 'all' && male.geo_data?.un_region !== selectedRegion) return null;
      return {
        year: male.year,
        country: male.geo,
        male: male.labour_force || 0,
        female: female?.labour_force || 0
      };
    }).filter(Boolean);

    // Population Pyramid
    const { data: popRaw } = await supabase
      .from('population')
      .select('year, sex, age, geo, population, geo_data!inner(un_region)')
      .eq('year', selectedYear)
      .not('age', 'eq', 'Total')
      .not('sex', 'eq', 'Total');

    const pyramidData = popRaw?.filter(p =>
      selectedRegion === 'all' || p.geo_data?.un_region === selectedRegion
    ).map(p => ({
      age: p.age,
      male: p.sex === 'Males' ? p.population : 0,
      female: p.sex === 'Females' ? p.population : 0,
      country: p.geo,
      year: p.year
    })) || [];

    // Dependency Ratio
    const depAgeGroups = ['From 0 to 4 years','From 5 to 9 years','From 10 to 14 years','From 65 to 69 years','From 70 to 74 years','From 75 to 79 years','From 80 to 84 years','From 85 to 89 years','From 90 to 94 years','From 95 to 99 years','100 years and over'];
    const workAgeGroups = ['From 15 to 19 years','From 20 to 24 years','From 25 to 29 years','From 30 to 34 years','From 35 to 39 years','From 40 to 44 years','From 45 to 49 years','From 50 to 54 years','From 55 to 59 years','From 60 to 64 years'];

    const { data: popTotal } = await supabase
      .from('population')
      .select('geo, age, population, year, geo_data!inner(un_region, latitude, longitude)')
      .eq('sex', 'Total')
      .eq('year', selectedYear);

    const dependencyRatioData = countries.map(country => {
      const dep = popTotal?.filter(p => depAgeGroups.includes(p.age) && p.geo === country.geo)
        .reduce((sum, d) => sum + (d.population || 0), 0) || 0;
      const work = popTotal?.filter(p => workAgeGroups.includes(p.age) && p.geo === country.geo)
        .reduce((sum, d) => sum + (d.population || 0), 0) || 0;
      const ratio = work > 0 ? (dep / work) * 100 : 0;

      return {
        country: country.geo,
        region: country.un_region,
        dependencyRatio: ratio,
        year: selectedYear,
        latitude: country.latitude,
        longitude: country.longitude
      };
    });

    // Metrics Calculation (Total Population and Trends)
    const getPop = async (yr: number) => {
      const { data } = await supabase
        .from('population')
        .select('population, geo, geo_data!inner(un_region)')
        .eq('sex', 'Total')
        .eq('age', 'Total')
        .eq('year', yr);
      return data?.filter(p => selectedRegion === 'all' || p.geo_data?.un_region === selectedRegion);
    };

    const popThisYear = await getPop(selectedYear);
    const popLastYear = await getPop(selectedYear - 1);

    const sum = (arr: any[]) => arr.reduce((acc, d) => acc + (d.population || 0), 0);
    const totalPop = sum(popThisYear);
    const prevPop = sum(popLastYear);
    const popTrend = prevPop > 0 ? ((totalPop - prevPop) / prevPop) * 100 : 0;

    // Fertility rate average + trend
    const fertNow = fertilityRaw?.filter(f => f.year === selectedYear && (selectedRegion === 'all' || f.geo_data?.un_region === selectedRegion)).map(f => f.fertility_rate || 0);
    const fertPrev = fertilityRaw?.filter(f => f.year === selectedYear - 1 && (selectedRegion === 'all' || f.geo_data?.un_region === selectedRegion)).map(f => f.fertility_rate || 0);
    const fertAvgNow = fertNow?.length ? fertNow.reduce((a, b) => a + b, 0) / fertNow.length : 0;
    const fertAvgPrev = fertPrev?.length ? fertPrev.reduce((a, b) => a + b, 0) / fertPrev.length : 0;
    const fertTrend = fertAvgPrev > 0 ? ((fertAvgNow - fertAvgPrev) / fertAvgPrev) * 100 : 0;

    // Labor rate (reuse laborRaw + fem)
    const laborByGeo = (arr: any[], sex: string) => {
      return arr?.filter(d => d.sex === sex && (selectedRegion === 'all' || d.geo_data?.un_region === selectedRegion)).map(d => d.labour_force || 0);
    };
    const laborNow = [...laborByGeo(laborRaw, 'Males'), ...laborByGeo(laborFem, 'Females')];
    const avgLabor = laborNow.length ? laborNow.reduce((a, b) => a + b, 0) / laborNow.length : 0;

    const laborBeforeRaw = await supabase
      .from('labor')
      .select('geo, sex, labour_force, geo_data!inner(un_region)')
      .eq('year', selectedYear - 1);

    const laborBefore = [...laborByGeo(laborBeforeRaw.data || [], 'Males'), ...laborByGeo(laborBeforeRaw.data || [], 'Females')];
    const avgLaborPrev = laborBefore.length ? laborBefore.reduce((a, b) => a + b, 0) / laborBefore.length : 0;
    const laborTrend = avgLaborPrev > 0 ? ((avgLabor - avgLaborPrev) / avgLaborPrev) * 100 : 0;

    // Dependency trend
    const dependencyPrevYear = await supabase
      .from('population')
      .select('geo, age, population, year, geo_data!inner(un_region)')
      .eq('sex', 'Total')
      .eq('year', selectedYear - 1);

    const dependencyRatioPrev = countries.map(country => {
      const dep = dependencyPrevYear.data?.filter(p => depAgeGroups.includes(p.age) && p.geo === country.geo)
        .reduce((sum, d) => sum + (d.population || 0), 0) || 0;
      const work = dependencyPrevYear.data?.filter(p => workAgeGroups.includes(p.age) && p.geo === country.geo)
        .reduce((sum, d) => sum + (d.population || 0), 0) || 0;
      return work > 0 ? (dep / work) * 100 : 0;
    });
    const avgDepNow = dependencyRatioData.map(d => d.dependencyRatio).reduce((a, b) => a + b, 0) / dependencyRatioData.length;
    const avgDepPrev = dependencyRatioPrev.reduce((a, b) => a + b, 0) / dependencyRatioPrev.length;
    const depTrend = avgDepPrev > 0 ? ((avgDepNow - avgDepPrev) / avgDepPrev) * 100 : 0;

    setMetricData({
      populationTotal: {
        value: `${(totalPop / 1_000_000).toFixed(1)}M`,
        trend: parseFloat(popTrend.toFixed(1))
      },
      laborForceRate: {
        value: `${avgLabor.toFixed(1)}%`,
        trend: parseFloat(laborTrend.toFixed(1))
      },
      fertilityRate: {
        value: fertAvgNow.toFixed(2),
        trend: parseFloat(fertTrend.toFixed(1))
      },
      dependencyRatio: {
        value: `${avgDepNow.toFixed(1)}%`,
        trend: parseFloat(depTrend.toFixed(1))
      },
      isLoading: false
    });

    setChartData({
      // fertilityData,
      fertilityData: fertilityFormatted,
      laborForceData: combinedLabor,
      populationPyramidData: pyramidData,
      dependencyRatioData,
      regions,
      countries,
      years,
      isLoading: false
    });
  };

  useEffect(() => {
    fetchData();
  }, [selectedRegion]);

  return {
    metricData,
    chartData,
    isLoading: chartData.isLoading,
    refresh: fetchData
  };
};

export default useDashboardData;