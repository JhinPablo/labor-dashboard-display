
import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Filter,
  BarChart,
  LineChart,
  PieChart
} from 'lucide-react';
import MetricCard from './MetricCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PopulationAgeChart,
  FertilityRateChart,
  LaborForceChart,
  PopulationByRegionChart
} from './DemographicCharts';
import useDashboardData from '@/hooks/useDashboardData';

export function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const { metricData, chartData } = useDashboardData(selectedRegion);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
  };

  return (
    <div className="space-y-8 p-6 animate-fade-in">
      <section>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-medium text-labor-800">Overview</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-labor-500" />
            <Select value={selectedRegion} onValueChange={handleRegionChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {chartData.regions.map((region) => (
                  // Only render SelectItem if region.region is a non-empty string
                  region.region && region.region.trim() !== '' ? (
                    <SelectItem key={region.region} value={region.region}>
                      {region.region}
                    </SelectItem>
                  ) : null
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-animation">
          <MetricCard
            title="Population"
            value={metricData.populationTotal.value}
            icon={<Users className="h-6 w-6" />}
            trend={{ 
              value: metricData.populationTotal.trend, 
              isPositive: metricData.populationTotal.trend >= 0 
            }}
          />
          <MetricCard
            title="Labor Force Rate"
            value={metricData.laborForceRate.value}
            icon={<BarChart className="h-6 w-6" />}
            trend={{ 
              value: metricData.laborForceRate.trend, 
              isPositive: metricData.laborForceRate.trend >= 0 
            }}
          />
          <MetricCard
            title="Fertility Rate"
            value={metricData.fertilityRate.value}
            icon={<LineChart className="h-6 w-6" />}
            trend={{ 
              value: metricData.fertilityRate.trend, 
              isPositive: metricData.fertilityRate.trend >= 0 
            }}
          />
          <MetricCard
            title="Regions"
            value={metricData.regionCount.value}
            icon={<PieChart className="h-6 w-6" />}
            trend={{ 
              value: metricData.regionCount.trend, 
              isPositive: true
            }}
          />
        </div>
      </section>
      
      <section className="space-y-5">
        <h2 className="text-xl font-medium text-labor-800 mb-5">Demographic Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          <PopulationAgeChart data={chartData.populationData} />
          <PopulationByRegionChart data={chartData.populationByRegion} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          <FertilityRateChart data={chartData.fertilityData} />
          <LaborForceChart data={chartData.laborForceData} />
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
