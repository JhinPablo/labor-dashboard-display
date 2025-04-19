
import React from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChartContainer } from './Chart';

export function PopulationAgeChart({ data = [] }: { data: any[] }) {
  return (
    <ChartContainer 
      title="Population by Age Group" 
      description="Distribution across age groups and gender"
      className="col-span-3"
    >
      <div className="p-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 12, fill: '#616E7C' }} />
            <YAxis 
              dataKey="age" 
              type="category" 
              tick={{ fontSize: 12, fill: '#616E7C' }}
              width={80}
            />
            <Tooltip 
              formatter={(value) => [value.toLocaleString(), 'Population']}
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
                border: 'none' 
              }}
            />
            <Legend />
            <Bar dataKey="male" name="Male" fill="#0088FE" radius={[0, 4, 4, 0]} barSize={20} />
            <Bar dataKey="female" name="Female" fill="#FF8042" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

export function FertilityRateChart({ data = [] }: { data: any[] }) {
  return (
    <ChartContainer 
      title="Fertility Rate Trends" 
      description="Changes in fertility rates over time"
      className="col-span-2"
    >
      <div className="p-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 12, fill: '#616E7C' }}
              axisLine={{ stroke: '#E4E7EB' }}
              tickLine={{ stroke: '#E4E7EB' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#616E7C' }}
              axisLine={{ stroke: '#E4E7EB' }}
              tickLine={{ stroke: '#E4E7EB' }}
              domain={[0, 'dataMax + 1']}
            />
            <Tooltip 
              formatter={(value) => [`${value.toFixed(2)}`, 'Fertility Rate']}
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
                border: 'none' 
              }}
              labelFormatter={(label) => `Year: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="rate" 
              stroke="#8884d8" 
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

export function LaborForceChart({ data = [] }: { data: any[] }) {
  return (
    <ChartContainer 
      title="Labor Force by Gender" 
      description="Trends in labor force participation"
      className="col-span-2"
    >
      <div className="p-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorMale" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0088FE" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorFemale" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF8042" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FF8042" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 12, fill: '#616E7C' }}
              axisLine={{ stroke: '#E4E7EB' }}
              tickLine={{ stroke: '#E4E7EB' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#616E7C' }}
              axisLine={{ stroke: '#E4E7EB' }}
              tickLine={{ stroke: '#E4E7EB' }}
              domain={[0, 'dataMax + 5']}
            />
            <Tooltip 
              formatter={(value) => [`${value.toFixed(2)}%`, 'Participation Rate']}
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
                border: 'none' 
              }}
              labelFormatter={(label) => `Year: ${label}`}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="male" 
              name="Male" 
              stroke="#0088FE" 
              fillOpacity={1} 
              fill="url(#colorMale)" 
            />
            <Area 
              type="monotone" 
              dataKey="female" 
              name="Female" 
              stroke="#FF8042" 
              fillOpacity={1}
              fill="url(#colorFemale)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}
