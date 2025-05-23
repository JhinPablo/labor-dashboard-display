import React, { useState } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';
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
} from 'recharts';
import { scaleLinear } from 'd3-scale';
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
  dependency: '#f97316',
};

// Fertility Trend Chart
export const FertilityTrendChart = ({ 
  data, 
  selectedCountry = 'all'
}: { 
  data: Array<{ year: number; rate: number; country: string }>;
  selectedCountry: string;
}) => {
  // Filter data based on selection
  const filteredData = selectedCountry === 'all' 
    ? data 
    : data.filter(item => item.country === selectedCountry);
  
  // Group data by year if showing all countries
  const groupedData = filteredData.reduce((acc, item) => {
    if (!acc[item.year]) {
      acc[item.year] = { year: item.year, avgRate: { sum: 0, count: 0 } };
    }
    
    if (item.rate !== null && !isNaN(item.rate)) {
      acc[item.year].avgRate.sum += Number(item.rate);
      acc[item.year].avgRate.count++;
    }
    
    return acc;
  }, {} as Record<number, { year: number; avgRate: { sum: number; count: number } }>);
  
  // Convert to array format required for chart
  const chartData = Object.values(groupedData)
    .map(item => ({
      year: item.year,
      rate: item.avgRate.count > 0 ? item.avgRate.sum / item.avgRate.count : null,
    }))
    .sort((a, b) => a.year - b.year);
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
        <XAxis 
          dataKey="year" 
          padding={{ left: 20, right: 20 }}
        />
        <YAxis 
          domain={[0, 'auto']}
          label={{ 
            value: 'Fertility Rate', 
            angle: -90, 
            position: 'insideLeft',
            style: { fill: COLORS.fertility } 
          }}
        />
        <Tooltip 
          formatter={(value) => {
            if (value === null) return ['No data', 'Fertility Rate'];
            return [safelyFormatNumber(value), 'Fertility Rate'];
          }}
          labelFormatter={(value) => `Year: ${value}`}
        />
        <Line 
          type="monotone" 
          dataKey="rate" 
          name="Fertility Rate" 
          stroke={COLORS.fertility} 
          strokeWidth={3}
          dot={{ strokeWidth: 2, r: 4, stroke: COLORS.fertility, fill: 'white' }}
          activeDot={{ r: 6 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Population Pyramid Chart
export const PopulationPyramidChart = ({ 
  data = [],
  selectedCountry = 'all',
  year
}: { 
  data: Array<{ age: string; male: number; female: number; country: string; year: number }>;
  selectedCountry: string;
  year: number;
}) => {
  // Filter data based on selection
  const filteredData = data.filter(item => 
    (selectedCountry === 'all' || item.country === selectedCountry) &&
    item.year === year
  );
  
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
      if (item.male !== null && !isNaN(item.male)) {
        totalMale += item.male;
        count++;
      }
      if (item.female !== null && !isNaN(item.female)) {
        totalFemale += item.female;
        count++;
      }
    });
    
    const avgMale = count > 0 ? -1 * (totalMale / (selectedCountry === 'all' ? count : 1)) : 0;
    const avgFemale = count > 0 ? totalFemale / (selectedCountry === 'all' ? count : 1) : 0;
    
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

// // Dependency Ratio Map Chart
// export const DependencyRatioMap = ({ 
//   data = [],
//   year,
//   icon
// }: { 
//   data: Array<{ 
//     country: string; 
//     region: string; 
//     dependencyRatio: number; 
//     year: number; 
//     latitude: number | null; 
//     longitude: number | null; 
//   }>;
//   year: number;
//   icon?: React.ReactNode;
// }) => {
//   // Filter data for the selected year
//   const filteredData = data.filter(item => item.year === year);
  
//   // Sort countries by dependency ratio
//   const sortedData = [...filteredData].sort((a, b) => b.dependencyRatio - a.dependencyRatio);
//   const topCountries = sortedData.slice(0, 20);
  
//   return (
//     <div className="h-full flex flex-col">
//       <div className="flex-1 flex items-center justify-center text-labor-500">
//         <div className="text-center">
//           {icon}
//           <p className="mt-2">Map visualization would go here (requires mapping library)</p>
//         </div>
//       </div>
      
//       <div className="mt-4">
//         <h4 className="text-sm font-medium mb-2">Top 20 Countries by Dependency Ratio</h4>
//         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
//           {topCountries.map((item) => (
//             <Card key={item.country} className="bg-labor-50 border-0 shadow-sm">
//               <CardContent className="p-4">
//                 <div className="font-medium truncate" title={item.country}>
//                   {item.country}
//                 </div>
//                 <div className="text-labor-600 text-sm">
//                   {item.dependencyRatio.toFixed(1)}%
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

const geoUrl = 'https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/TopoJSON/europe.topojson';

export const DependencyRatioMap = ({
  data = [],
  year,
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
}) => {
  const [tooltipContent, setTooltipContent] = useState('');

  const filteredData = data.filter((d) => d.year === year);

  // Color scale (azul)
  const colorScale = scaleLinear<string>()
    .domain([20, 60]) // min y max según tu dataset
    .range(['#dbeafe', '#2563eb']); // tonos azules

  const ratioMap = filteredData.reduce((acc, curr) => {
    acc[curr.country] = curr.dependencyRatio;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col space-y-6">
      {/* Mapa con altura fija y margen inferior */}
      <div className="h-[380px] w-full rounded-md border bg-white shadow-sm">
        <ComposableMap
          projection="geoEqualEarth"
          // projectionConfig={{ scale: 800, center: [15, 52] }}
          projectionConfig={{ scale: 1000, center: [20, 50] }}
          data-tip=""
          className="w-full h-full"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const country = geo.properties.NAME;
                const value = ratioMap[country];

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() =>
                      setTooltipContent(
                        `${country}: ${value ? value.toFixed(1) + '%' : 'No data'}`
                      )
                    }
                    onMouseLeave={() => setTooltipContent('')}
                    data-tooltip-id="dep-tooltip"
                    data-tooltip-content={`${country}: ${value ? value.toFixed(1) + '%' : 'No data'}`}
                    fill={value ? colorScale(value) : '#E5E7EB'} // gris si no hay datos
                    stroke="#D1D5DB"
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: '#facc15', outline: 'none' },
                      pressed: { fill: '#f59e0b', outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
        <ReactTooltip id="dep-tooltip" />
      </div>

      {/* Tarjetas del Top 20 */}
      <div>
        <h4 className="text-sm font-medium mb-2 text-labor-800">
          Top 20 Countries by Dependency Ratio
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...filteredData]
            .sort((a, b) => b.dependencyRatio - a.dependencyRatio)
            .slice(0, 20)
            .map((item) => (
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


// Labor Force by Gender Chart
export const LaborForceByGenderChart = ({ 
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
  
  // Group data by year and calculate averages if showing all countries
  const groupedData = filteredData.reduce((acc, item) => {
    if (!acc[item.year]) {
      acc[item.year] = {
        year: item.year,
        male: { sum: 0, count: 0 },
        female: { sum: 0, count: 0 }
      };
    }
    
    if (item.male !== null && !isNaN(item.male)) {
      acc[item.year].male.sum += Number(item.male);
      acc[item.year].male.count++;
    }
    
    if (item.female !== null && !isNaN(item.female)) {
      acc[item.year].female.sum += Number(item.female);
      acc[item.year].female.count++;
    }
    
    return acc;
  }, {} as Record<number, { year: number; male: { sum: number; count: number }; female: { sum: number; count: number } }>);
  
  // Convert to array format required for chart
  const chartData = Object.values(groupedData)
    .map(item => ({
      year: item.year,
      male: item.male.count > 0 ? item.male.sum / item.male.count : 0,
      female: item.female.count > 0 ? item.female.sum / item.female.count : 0,
    }))
    .sort((a, b) => a.year - b.year);

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
          formatter={(value) => {
            if (value === null || isNaN(Number(value))) return ['No data', ''];
            return [`${safelyFormatNumber(value)}%`, ''];
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