
import React, { useState } from 'react';
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Legend, 
  Line, 
  LineChart, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const timeRanges = ['1W', '1M', '3M', '6M', '1Y', 'All'] as const;
type TimeRange = typeof timeRanges[number];

interface ChartContainerProps {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
  enableTimeRanges?: boolean;
}

export function ChartContainer({ 
  title, 
  description, 
  className, 
  children, 
  enableTimeRanges = false 
}: ChartContainerProps) {
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>('1M');
  
  return (
    <Card className={cn("overflow-hidden animate-scale-in", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-labor-800">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          
          {enableTimeRanges && (
            <div className="flex space-x-1">
              {timeRanges.map((range) => (
                <Button
                  key={range}
                  variant={activeTimeRange === range ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => setActiveTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {children}
      </CardContent>
    </Card>
  );
}

export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A4A4A4'];

export function EmploymentTrendChart({ data = [] }: { data: any[] }) {
  return (
    <ChartContainer 
      title="Employment Trends" 
      description="Monthly changes in employment metrics"
      enableTimeRanges
      className="col-span-3"
    >
      <div className="p-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorEmployed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorUnemployed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#F97316" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: '#616E7C' }}
              axisLine={{ stroke: '#E4E7EB' }}
              tickLine={{ stroke: '#E4E7EB' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#616E7C' }}
              axisLine={{ stroke: '#E4E7EB' }}
              tickLine={{ stroke: '#E4E7EB' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
                border: 'none' 
              }}
            />
            <Area 
              type="monotone" 
              dataKey="employed" 
              stroke="#0EA5E9" 
              fillOpacity={1} 
              fill="url(#colorEmployed)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="unemployed" 
              stroke="#F97316" 
              fillOpacity={1} 
              fill="url(#colorUnemployed)" 
              strokeWidth={2}
            />
            <Legend />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

export function IndustryDistributionChart({ data = [] }: { data: any[] }) {
  return (
    <ChartContainer title="Industry Distribution">
      <div className="p-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Percentage']}
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
                border: 'none' 
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

export function JobGrowthChart({ data = [] }: { data: any[] }) {
  return (
    <ChartContainer title="Job Market by Location Type">
      <div className="p-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal stroke="#f0f0f0" />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: '#616E7C' }}
              axisLine={{ stroke: '#E4E7EB' }}
              tickLine={{ stroke: '#E4E7EB' }}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 12, fill: '#616E7C' }}
              axisLine={{ stroke: '#E4E7EB' }}
              tickLine={{ stroke: '#E4E7EB' }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
                border: 'none' 
              }}
            />
            <Bar 
              dataKey="value" 
              fill="#0EA5E9" 
              radius={[0, 4, 4, 0]} 
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

export function SalaryTrendsChart({ data = [] }: { data: any[] }) {
  return (
    <ChartContainer 
      title="Salary Trends" 
      description="Average salaries by industry" 
      enableTimeRanges
      className="col-span-3"
    >
      <div className="p-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: '#616E7C' }}
              axisLine={{ stroke: '#E4E7EB' }}
              tickLine={{ stroke: '#E4E7EB' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#616E7C' }}
              axisLine={{ stroke: '#E4E7EB' }}
              tickLine={{ stroke: '#E4E7EB' }}
              tickFormatter={(value) => `$${value/1000}k`}
            />
            <Tooltip 
              formatter={(value) => [`$${value.toLocaleString()}`, 'Salary']}
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
                border: 'none' 
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="tech" 
              stroke="#0EA5E9" 
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="health" 
              stroke="#10B981" 
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="retail" 
              stroke="#F97316" 
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}
