
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
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Helper function to safely format numbers
const safelyFormatNumber = (value: any): string => {
  if (typeof value === 'number') {
    return value.toFixed(1);
  }
  return String(value);
};

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
                formatter={(value) => [safelyFormatNumber(value), 'Population (millions)']}
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
              <XAxis dataKey="year" />
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
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [safelyFormatNumber(value), 'Participation Rate']}
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
