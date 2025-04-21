
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { feature } from 'topojson-client';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { scaleSequential } from 'd3-scale';
import { interpolateBlues } from 'd3-scale-chromatic';

const geoUrl = 'https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/TopoJSON/europe.topojson';

export default function PredictionTab() {
  const [data, setData] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2030);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('France');
  const [tooltipContent, setTooltipContent] = useState<string>('');
  const [geographies, setGeographies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch prediction data
        const { data: predictions, error: predError } = await supabase
          .from('predictions')
          .select('*');
        
        if (predError) {
          console.error('Error fetching predictions:', predError);
          return;
        }
        
        // Fetch geo data for country info
        const { data: geo, error: geoError } = await supabase
          .from('geo_data')
          .select('*');
        
        if (geoError) {
          console.error('Error fetching geo data:', geoError);
          return;
        }
        
        // Process the data
        if (predictions && geo) {
          setData(predictions);
          setGeoData(geo);
          
          // Extract unique countries and years
          const uniqueCountries = [...new Set(predictions.map(d => d.geo))].filter(Boolean);
          setCountries(uniqueCountries);
          
          const years = [...new Set(predictions.map(d => d.time_period))].filter(Boolean).sort();
          setAvailableYears(years);
          
          if (years.length > 0) {
            // Set the default selected year to the most recent one
            const maxYear = Math.max(...years);
            setSelectedYear(maxYear);
          }
        }
        
        // Fetch the map data
        fetch(geoUrl)
          .then(response => response.json())
          .then(jsonData => {
            if (jsonData && jsonData.objects && jsonData.objects.europe) {
              const countries = feature(jsonData, jsonData.objects.europe).features;
              setGeographies(countries);
            }
          })
          .catch(err => console.error('Error loading map data:', err));
      } catch (err) {
        console.error('Error in data fetching:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter data by selected country and year
  const filteredByCountry = data.filter(d => d.geo === selectedCountry);
  const filteredByYear = data.filter(d => d.time_period === selectedYear);

  // Create a mapping of country names to their labor force values for the map
  const dataMap = filteredByYear.reduce((acc, cur) => {
    if (cur.geo && cur.predicted_labour_force !== null) {
      acc[cur.geo] = cur.predicted_labour_force;
    }
    return acc;
  }, {});

  // Color scale for the map
  const colorScale = scaleSequential(interpolateBlues)
    .domain([30, 80]); // Adjust this range based on your data

  const handleYearChange = (value: string) => {
    setSelectedYear(parseInt(value));
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
  };

  // Format the data for the bar chart
  const barChartData = filteredByYear
    .filter(d => d.predicted_labour_force !== null)
    .sort((a, b) => (b.predicted_labour_force || 0) - (a.predicted_labour_force || 0))
    .slice(0, 15); // Top 15 countries

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-semibold text-labor-900">Labor Force Predictions</h2>
        <p className="text-labor-600">
          Explore forecasted participation rates across different countries and time periods.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Map Card */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-labor-800">Labor Force Participation by Country</h3>
              <Select 
                value={selectedYear.toString()} 
                onValueChange={handleYearChange}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {isLoading ? (
              <div className="h-[400px] flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-lg" />
              </div>
            ) : (
              <div className="h-[400px] relative">
                <ComposableMap
                  projectionConfig={{ scale: 700, center: [15, 52] }}
                  data-tip=""
                >
                  <Geographies geography={geographies}>
                    {({ geographies }) =>
                      geographies.map(geo => {
                        const countryName = geo.properties.NAME;
                        const value = dataMap[countryName];
                        const tooltipText = value !== undefined 
                          ? `${countryName}: ${value.toFixed(1)}%`
                          : `${countryName}: No data`;

                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            data-tooltip-id="map-tooltip"
                            data-tooltip-content={tooltipText}
                            onClick={() => setSelectedCountry(countryName)}
                            style={{
                              default: {
                                fill: value !== undefined ? colorScale(value) : '#EEE',
                                stroke: '#D6D6DA',
                                strokeWidth: 0.5,
                                outline: 'none'
                              },
                              hover: {
                                fill: '#F53',
                                stroke: '#D6D6DA',
                                strokeWidth: 0.5,
                                outline: 'none'
                              },
                              pressed: {
                                fill: '#E42',
                                stroke: '#D6D6DA',
                                strokeWidth: 0.5,
                                outline: 'none'
                              }
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ComposableMap>
                <ReactTooltip id="map-tooltip" />
                
                <div className="absolute bottom-2 left-2 bg-white/80 p-2 rounded-md shadow-sm">
                  <div className="flex items-center text-xs">
                    <div className="w-2 h-2 bg-[#f0f9ff] mr-1"></div>
                    <span>30%</span>
                    <div className="w-20 h-2 bg-gradient-to-r from-[#f0f9ff] to-[#0d47a1] mx-1"></div>
                    <div className="w-2 h-2 bg-[#0d47a1] mr-1"></div>
                    <span>80%</span>
                  </div>
                  <div className="text-xs text-labor-500 mt-1">Labor force participation rate</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historical Projection Chart */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-labor-800">Historical Projection</h3>
              <Select 
                value={selectedCountry} 
                onValueChange={handleCountryChange}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {isLoading ? (
              <div className="h-[300px]">
                <Skeleton className="h-full w-full rounded-lg" />
              </div>
            ) : filteredByCountry.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-labor-500">
                No projection data available for {selectedCountry}
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filteredByCountry.sort((a, b) => a.time_period - b.time_period)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis 
                      dataKey="time_period" 
                      label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      domain={[30, 'auto']}
                      label={{ value: 'Participation Rate (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Participation Rate']}
                      labelFormatter={(value) => `Year: ${value}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted_labour_force" 
                      stroke="#0284c7" 
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#0284c7' }}
                      activeDot={{ r: 6, fill: '#0284c7' }}
                      name="Labor Force Participation Rate"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Country Ranking Chart */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-labor-800">Top 15 Countries by Participation Rate</h3>
            <Select 
              value={selectedYear.toString()} 
              onValueChange={handleYearChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {isLoading ? (
            <div className="h-[400px]">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          ) : barChartData.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center text-labor-500">
              No data available for the selected year
            </div>
          ) : (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]}
                    label={{ value: 'Participation Rate (%)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    dataKey="geo" 
                    type="category" 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Participation Rate']}
                  />
                  <Bar 
                    dataKey="predicted_labour_force" 
                    name="Labor Force Participation Rate" 
                    fill="#10b981"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
