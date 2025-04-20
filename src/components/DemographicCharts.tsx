
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
  ComposedChart,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

// Helper function to safely format numbers
const safelyFormatNumber = (value: any): string => {
  if (typeof value === 'number') {
    return value.toFixed(1);
  }
  return String(value);
};

// Array of colors for consistency
const COLORS = {
  fertility: '#0284c7',
  laborForce: '#10b981',
  male: '#0284c7',
  female: '#f472b6',
  population: '#8b5cf6',
};

// Combine fertility rate and labor force rate charts
export const FertilityRateChart = ({ 
  data, 
  laborForceData,
  selectedCountry = 'all'
}: { 
  data: Array<{ year: number; rate: number; country: string }>;
  laborForceData: Array<{ year: number; male: number; female: number; country: string }>;
  selectedCountry: string;
}) => {
  // Filter and prepare data
  const filteredFertilityData = selectedCountry === 'all' 
    ? data 
    : data.filter(item => item.country === selectedCountry);
  
  const filteredLaborForceData = selectedCountry === 'all'
    ? laborForceData
    : laborForceData.filter(item => item.country === selectedCountry);
  
  // Combine the data for the composed chart
  const years = new Set([
    ...filteredFertilityData.map(item => item.year),
    ...filteredLaborForceData.map(item => item.year)
  ]);
  
  const combinedData = Array.from(years).map(year => {
    // Get fertility rate for this year
    const fertilityItems = filteredFertilityData.filter(item => item.year === year);
    const avgFertilityRate = fertilityItems.length > 0
      ? fertilityItems.reduce((sum, item) => sum + item.rate, 0) / fertilityItems.length
      : null;
    
    // Get labor force rate for this year
    const laborForceItems = filteredLaborForceData.filter(item => item.year === year);
    
    // Calculate average male and female labor force rates
    let avgMaleRate = 0;
    let maleCount = 0;
    let avgFemaleRate = 0;
    let femaleCount = 0;
    
    laborForceItems.forEach(item => {
      if (item.male > 0) {
        avgMaleRate += item.male;
        maleCount++;
      }
      if (item.female > 0) {
        avgFemaleRate += item.female;
        femaleCount++;
      }
    });
    
    // Calculate average labor force rate
    const avgMale = maleCount > 0 ? avgMaleRate / maleCount : null;
    const avgFemale = femaleCount > 0 ? avgFemaleRate / femaleCount : null;
    
    // Calculate total average labor force rate
    const validRatesCount = (avgMale !== null ? 1 : 0) + (avgFemale !== null ? 1 : 0);
    const avgLaborForceRate = validRatesCount > 0
      ? ((avgMale || 0) + (avgFemale || 0)) / validRatesCount
      : null;
    
    return {
      year,
      fertilityRate: avgFertilityRate,
      laborForceRate: avgLaborForceRate,
    };
  }).sort((a, b) => a.year - b.year);
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={combinedData}
        margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
        <XAxis 
          dataKey="year" 
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(value) => value.toString()}
          padding={{ left: 15, right: 15 }}
        />
        <YAxis 
          yAxisId="left" 
          orientation="left"
          domain={[0, 'auto']}
          label={{ 
            value: 'Fertility Rate', 
            angle: -90, 
            position: 'insideLeft',
            style: { fill: COLORS.fertility }
          }}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right"
          domain={[0, 100]}
          label={{ 
            value: 'Labor Force Rate (%)', 
            angle: 90, 
            position: 'insideRight',
            style: { fill: COLORS.laborForce } 
          }}
        />
        <Tooltip 
          formatter={(value, name) => {
            if (value === null) return ['No data', name];
            if (name === 'fertilityRate') return [safelyFormatNumber(value), 'Fertility Rate'];
            if (name === 'laborForceRate') return [safelyFormatNumber(value) + '%', 'Labor Force Rate'];
            return [safelyFormatNumber(value), name];
          }}
          labelFormatter={(value) => `Year: ${value}`}
        />
        <Legend />
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="fertilityRate" 
          name="Fertility Rate" 
          stroke={COLORS.fertility} 
          strokeWidth={3}
          dot={{ strokeWidth: 2, r: 4, stroke: COLORS.fertility, fill: 'white' }}
          activeDot={{ r: 6 }}
          connectNulls
        />
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="laborForceRate" 
          name="Labor Force Rate" 
          stroke={COLORS.laborForce} 
          strokeWidth={3}
          dot={{ strokeWidth: 2, r: 4, stroke: COLORS.laborForce, fill: 'white' }}
          activeDot={{ r: 6 }}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

// Labor Force Chart by Gender
export const LaborForceChart = ({ 
  data,
  selectedCountry = 'all'
}: { 
  data: Array<{ year: number; male: number; female: number; country: string }>;
  selectedCountry: string;
}) => {
  // Filter data based on selection
  const filteredData = selectedCountry === 'all'
    ? data
    : data.filter(item => item.country === selectedCountry);
  
  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>No labor force data available for the selected country/region</p>
      </div>
    );
  }
  
  // Group data by year and calculate averages if showing all countries
  const groupedData = filteredData.reduce((acc, item) => {
    if (!acc[item.year]) {
      acc[item.year] = {
        year: item.year,
        male: { sum: 0, count: 0 },
        female: { sum: 0, count: 0 }
      };
    }
    
    if (item.male > 0) {
      acc[item.year].male.sum += item.male;
      acc[item.year].male.count++;
    }
    
    if (item.female > 0) {
      acc[item.year].female.sum += item.female;
      acc[item.year].female.count++;
    }
    
    return acc;
  }, {} as Record<number, { year: number; male: { sum: number; count: number }; female: { sum: number; count: number } }>);
  
  // Convert to array format required for chart
  const chartData = Object.values(groupedData)
    .map(item => ({
      year: item.year,
      male: item.male.count > 0 ? item.male.sum / item.male.count : null,
      female: item.female.count > 0 ? item.female.sum / item.female.count : null,
    }))
    .sort((a, b) => a.year - b.year);

  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>No labor force data available for the selected country/region</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
        barGap={2}
        barSize={20}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
        <XAxis 
          dataKey="year" 
          padding={{ left: 10, right: 10 }}
        />
        <YAxis 
          domain={[0, 100]}
          label={{ 
            value: 'Participation Rate (%)', 
            angle: -90, 
            position: 'insideLeft' 
          }}
        />
        <Tooltip
          formatter={(value, name) => {
            if (value === null) return ['No data', name];
            return [`${safelyFormatNumber(value)}%`, name === 'male' ? 'Male' : 'Female'];
          }}
          labelFormatter={(value) => `Year: ${value}`}
        />
        <Legend />
        <Bar 
          dataKey="male" 
          name="Male" 
          fill={COLORS.male} 
          radius={[3, 3, 0, 0]} 
        />
        <Bar 
          dataKey="female" 
          name="Female" 
          fill={COLORS.female} 
          radius={[3, 3, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Population Map Chart
export const PopulationMapChart = ({ 
  data = [],
  icon
}: { 
  data: Array<{ 
    country: string; 
    region: string; 
    population: number; 
    latitude: number | null; 
    longitude: number | null; 
  }>;
  icon?: React.ReactNode;
}) => {
  // This is a placeholder for the map
  // In a real implementation, we would use a mapping library like react-simple-maps
  
  // Sort countries by population
  const sortedData = [...data].sort((a, b) => b.population - a.population);
  const topCountries = sortedData.slice(0, 20);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center text-labor-500">
        <div className="text-center">
          {icon}
          <p className="mt-2">Map visualization would go here (requires mapping library)</p>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Top 20 Countries by Population</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {topCountries.map((item, index) => (
            <Card key={item.country} className="bg-labor-50 border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="text-xs text-labor-500">{index + 1}</div>
                <div className="font-medium truncate" title={item.country}>
                  {item.country}
                </div>
                <div className="text-labor-600 text-sm">
                  {(item.population / 1000000).toFixed(2)}M
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// Add a population pyramid chart component
export const PopulationPyramidChart = ({ 
  data = [],
  selectedCountry = 'all',
  year = 0
}: { 
  data: Array<{ age: string; male: number; female: number; country: string; year: number }>;
  selectedCountry: string;
  year: number;
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>No population data available for the selected filters</p>
      </div>
    );
  }

  // Filter data based on selection
  const filteredData = data.filter(item => 
    (selectedCountry === 'all' || item.country === selectedCountry) &&
    (!year || item.year === year)
  );

  if (filteredData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>No population data available for {selectedCountry} in {year}</p>
      </div>
    );
  }
  
  // Sort age groups for proper display
  const ageOrder = [
    'From 0 to 4 years',
    'From 5 to 9 years',
    'From 10 to 14 years',
    'From 15 to 19 years',
    'From 20 to 24 years',
    'From 25 to 29 years',
    'From 30 to 34 years',
    'From 35 to 39 years',
    'From 40 to 44 years',
    'From 45 to 49 years',
    'From 50 to 54 years',
    'From 55 to 59 years',
    'From 60 to 64 years',
    'From 65 to 69 years',
    'From 70 to 74 years',
    'From 75 to 79 years',
    'From 80 to 84 years',
    'From 85 to 89 years',
    'From 90 to 94 years',
    'From 95 to 99 years',
    '100 years and over'
  ];
  
  // Group by age
  const pyramidData = ageOrder.map(age => {
    const ageGroup = filteredData.filter(item => item.age === age);
    let totalMale = 0;
    let totalFemale = 0;
    let count = 0;
    
    ageGroup.forEach(item => {
      if (!isNaN(item.male)) {
        totalMale += item.male;
        count++;
      }
      if (!isNaN(item.female)) {
        totalFemale += item.female;
        count++;
      }
    });
    
    const avgMale = count > 0 ? -1 * (totalMale / (selectedCountry === 'all' ? Math.max(1, ageGroup.length) : 1)) : 0;
    const avgFemale = count > 0 ? totalFemale / (selectedCountry === 'all' ? Math.max(1, ageGroup.length) : 1) : 0;
    
    return {
      age: age.replace('From ', '').replace(' years', ''),
      male: avgMale,
      female: avgFemale
    };
  });
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        layout="vertical"
        data={pyramidData}
        margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
        barGap={0}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
        <XAxis 
          type="number"
          tickFormatter={(value) => `${Math.abs(value).toLocaleString()}`}
        />
        <YAxis 
          type="category"
          dataKey="age" 
          width={80}
          tickSize={0}
        />
        <Tooltip 
          formatter={(value, name) => {
            return [Math.abs(Number(value)).toLocaleString(), name === 'male' ? 'Male' : 'Female'];
          }}
          labelFormatter={(value) => `Age: ${value}`}
        />
        <Legend />
        <Bar 
          dataKey="male" 
          name="Male" 
          fill={COLORS.male} 
          radius={[0, 3, 3, 0]} 
        />
        <Bar 
          dataKey="female" 
          name="Female" 
          fill={COLORS.female}
          radius={[3, 0, 0, 3]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Dependency Ratio chart component
export const DependencyRatioMap = ({ 
  data = [],
  year = 0,
  icon
}: { 
  data: Array<{ 
    country: string; 
    region: string; 
    dependencyRatio: number; 
    year: number; 
    latitude: number | null; 
    longitude: number | null; 
  }>;
  year: number;
  icon?: React.ReactNode;
}) => {
  // Filter data for the selected year
  const filteredData = data.filter(item => !year || item.year === year);
  
  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>No dependency ratio data available for the selected year</p>
      </div>
    );
  }
  
  // Sort countries by dependency ratio
  const sortedData = [...filteredData].sort((a, b) => b.dependencyRatio - a.dependencyRatio);
  const topCountries = sortedData.slice(0, 20);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center text-labor-500">
        <div className="text-center">
          {icon}
          <p className="mt-2">Map visualization would go here (requires mapping library)</p>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Top 20 Countries by Dependency Ratio</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {topCountries.map((item) => (
            <Card key={item.country} className="bg-labor-50 border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="font-medium truncate" title={item.country}>
                  {item.country}
                </div>
                <div className="text-labor-600 text-sm">
                  {item.dependencyRatio.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
