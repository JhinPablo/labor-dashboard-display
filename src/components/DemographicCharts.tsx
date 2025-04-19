
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Helper function to safely format numbers
const safelyFormatNumber = (value: any): string => {
  if (typeof value === 'number') {
    return value.toFixed(1);
  }
  return String(value);
};

// Array of colors for pie chart
const COLORS = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#f472b6', '#fb7185', '#fda4af'];

export const PopulationAgeChart = ({ data }: { data: Array<{ age: string; male: number; female: number }> }) => {
  return (
    <Card className="col-span-2 shadow-md">
      <CardHeader>
        <CardTitle>Population by Age and Gender</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="age" type="category" />
              <Tooltip 
                formatter={(value) => [parseInt(safelyFormatNumber(value)).toLocaleString(), 'Population']}
                labelFormatter={(value) => `Age: ${value}`}
              />
              <Legend />
              <Bar dataKey="male" name="Male" fill="#0284c7" />
              <Bar dataKey="female" name="Female" fill="#f472b6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const FertilityRateChart = ({ data }: { data: Array<{ year: number; rate: number; region: string }> }) => {
  return (
    <Card className="col-span-2 shadow-md">
      <CardHeader>
        <CardTitle>Fertility Rate Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="year" 
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => value.toString()}
              />
              <YAxis domain={[0, 'auto']} />
              <Tooltip 
                formatter={(value) => [safelyFormatNumber(value), 'Children per woman']}
                labelFormatter={(value) => `Year: ${value}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="rate" 
                name="Fertility rate" 
                stroke="#0284c7" 
                activeDot={{ r: 8 }} 
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const LaborForceChart = ({ data }: { data: Array<{ year: number; male: number; female: number; region: string }> }) => {
  return (
    <Card className="col-span-4 shadow-md">
      <CardHeader>
        <CardTitle>Labor Force Participation by Gender</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="year" 
                type="number" 
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => value.toString()}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [(parseFloat(safelyFormatNumber(value)) / 1000000).toFixed(2) + 'M', 'Participation']}
                labelFormatter={(value) => `Year: ${value}`}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="male" 
                name="Male" 
                stackId="1"
                stroke="#0284c7" 
                fill="#0284c7" 
              />
              <Area 
                type="monotone" 
                dataKey="female" 
                name="Female" 
                stackId="1"
                stroke="#f472b6" 
                fill="#f472b6" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const PopulationByRegionChart = ({ data = [] }: { data: Array<{ region: string; population: number }> }) => {
  return (
    <Card className="col-span-2 shadow-md">
      <CardHeader>
        <CardTitle>Population by Region</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="population"
                nameKey="region"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => {
                  // Fix: Ensure value is a number before division
                  if (typeof value === 'number') {
                    return [(value / 1000000).toFixed(2) + 'M', 'Population'];
                  }
                  return [String(value), 'Population'];
                }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '8px', 
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
                  border: 'none' 
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
