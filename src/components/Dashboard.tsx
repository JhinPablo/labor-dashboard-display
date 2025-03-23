
import React from 'react';
import { 
  Users, 
  BriefcaseIcon, 
  TrendingUp, 
  DollarSign, 
  BarChart2, 
  PieChart 
} from 'lucide-react';
import MetricCard from './MetricCard';
import { 
  EmploymentTrendChart, 
  IndustryDistributionChart, 
  JobGrowthChart,
  SalaryTrendsChart
} from './Chart';

export function Dashboard() {
  return (
    <div className="space-y-8 p-6 animate-fade-in">
      <section>
        <h2 className="text-xl font-medium text-labor-800 mb-5">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-animation">
          <MetricCard
            title="Employment Rate"
            value="94.2%"
            icon={<Users className="h-6 w-6" />}
            trend={{ value: 1.2, isPositive: true }}
          />
          <MetricCard
            title="Job Openings"
            value="12,543"
            icon={<BriefcaseIcon className="h-6 w-6" />}
            trend={{ value: 3.7, isPositive: true }}
          />
          <MetricCard
            title="Growth Rate"
            value="2.8%"
            icon={<TrendingUp className="h-6 w-6" />}
            trend={{ value: 0.4, isPositive: true }}
          />
          <MetricCard
            title="Avg. Salary"
            value="$86,420"
            icon={<DollarSign className="h-6 w-6" />}
            trend={{ value: 1.5, isPositive: true }}
          />
        </div>
      </section>
      
      <section className="space-y-5">
        <h2 className="text-xl font-medium text-labor-800 mb-5">Market Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          <EmploymentTrendChart />
          <IndustryDistributionChart />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          <JobGrowthChart />
          <SalaryTrendsChart />
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
