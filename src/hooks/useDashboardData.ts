
import useDashboardAPI from './useDashboardAPI';

// Legacy hook for backward compatibility
const useDashboardData = (selectedRegion: string = 'all') => {
  const { metricData, chartData, isLoading, refresh } = useDashboardAPI(selectedRegion);

  return {
    metricData,
    chartData,
    isLoading,
    refresh
  };
};

export default useDashboardData;
