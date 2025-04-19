
import React, { useState } from 'react';
import { 
  Users, 
  BriefcaseIcon, 
  TrendingUp, 
  DollarSign,
  Filter
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
  EmploymentTrendChart, 
  IndustryDistributionChart, 
  JobGrowthChart,
  SalaryTrendsChart
} from './Chart';
import {
  PopulationAgeChart,
  FertilityRateChart,
  LaborForceChart
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
                  <SelectItem key={region.region} value={region.region || "unknown"}>
                    {region.region || "Unknown Region"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-animation">
          <MetricCard
            title="Employment Rate"
            value={metricData.employmentRate.value}
            icon={<Users className="h-6 w-6" />}
            trend={{ 
              value: metricData.employmentRate.trend, 
              isPositive: metricData.employmentRate.trend >= 0 
            }}
          />
          <MetricCard
            title="Job Openings"
            value={metricData.jobOpenings.value}
            icon={<BriefcaseIcon className="h-6 w-6" />}
            trend={{ 
              value: metricData.jobOpenings.trend, 
              isPositive: metricData.jobOpenings.trend >= 0 
            }}
          />
          <MetricCard
            title="Growth Rate"
            value={metricData.growthRate.value}
            icon={<TrendingUp className="h-6 w-6" />}
            trend={{ 
              value: metricData.growthRate.trend, 
              isPositive: metricData.growthRate.trend >= 0 
            }}
          />
          <MetricCard
            title="Avg. Salary"
            value={metricData.averageSalary.value}
            icon={<DollarSign className="h-6 w-6" />}
            trend={{ 
              value: metricData.averageSalary.trend, 
              isPositive: metricData.averageSalary.trend >= 0 
            }}
          />
        </div>
      </section>
      
      <section className="space-y-5">
        <h2 className="text-xl font-medium text-labor-800 mb-5">Market Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          <EmploymentTrendChart data={chartData.employmentData} />
          <IndustryDistributionChart data={chartData.industryData} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          <JobGrowthChart data={chartData.jobTypeData} />
          <SalaryTrendsChart data={chartData.salaryData} />
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-xl font-medium text-labor-800 mb-5">Demographic Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          <PopulationAgeChart data={chartData.populationData} />
          <FertilityRateChart data={chartData.fertilityData} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          <LaborForceChart data={chartData.laborForceData} />
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
