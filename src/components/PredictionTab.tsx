import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { json } from 'd3-fetch';
import { feature } from 'topojson-client';

const geoUrl = 'https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/TopoJSON/europe.topojson';

export default function PredictionTab() {
  const [data, setData] = useState([]);
  const [geoData, setGeoData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2030);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('France');
  const [tooltipContent, setTooltipContent] = useState('');
  const [geographies, setGeographies] = useState([]);
  const [maxYear, setMaxYear] = useState(2050);

  useEffect(() => {
    const fetchData = async () => {
      const { data: predictions, error: error1 } = await supabase.from('predictions').select('*');
      const { data: geo, error: error2 } = await supabase.from('geo_data').select('*');

      if (error1) console.error('Predictions error:', error1);
      if (error2) console.error('Geo error:', error2);

      if (predictions && geo) {
        setData(predictions);
        setGeoData(geo);
        const uniqueCountries = [...new Set(predictions.map(d => d.geo))];
        setCountries(uniqueCountries);
        const max = Math.max(...predictions.map(p => p.time_period));
        setMaxYear(max);
        setSelectedYear(max); // default to most recent
      }
    };

    const fetchGeo = async () => {
      const europe = await json(geoUrl);
      const countries = feature(europe, europe.objects.europe).features;
      setGeographies(countries);
    };

    fetchData();
    fetchGeo();
  }, []);

  const filteredByCountry = data.filter(d => d.geo === selectedCountry);
  const filteredByYear = data.filter(d => d.time_period === selectedYear);

  const dataMap = filteredByYear.reduce((acc, cur) => {
    acc[cur.geo] = cur.predicted_labour_force;
    return acc;
  }, {});

  return (
    <div className="p-4 space-y-8">
      <h2 className="text-2xl font-semibold">Labor Force Forecasts</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Map Card */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Map of Participation Rates</h3>
            <div>
              <label className="mr-2 font-medium">Year:</label>
              <input
                type="number"
                className="border rounded px-2 py-1"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                min={1990}
                max={maxYear}
              />
            </div>
          </div>

          <div className="h-[32rem]">
            <ComposableMap
              data-tip=""
              projectionConfig={{ scale: 800, center: [15, 47] }}
            >
              <Geographies geography={geographies}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const countryName = geo.properties.NAME;
                    const value = dataMap[countryName];
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        data-tooltip-id="map-tooltip"
                        data-tooltip-content={`${countryName}: ${value ? value.toFixed(2) + '%' : 'No data'}`}
                        onMouseEnter={() => {
                          setTooltipContent(`${countryName}: ${value ? value.toFixed(2) + '%' : 'No data'}`);
                        }}
                        onMouseLeave={() => setTooltipContent('')}
                        onClick={() => setSelectedCountry(countryName)}
                        style={{
                          default: {
                            // fill: value ? `rgba(0,102,204,${value / 100})` : '#EEE',
                            fill: value
                              ? `rgba(0, 51, 153, ${Math.min(1, 0.5 + (value / 100) * 0.5)})`
                              : '#DDD',
                            outline: 'none'
                          },
                          hover: {
                            fill: '#F53',
                            outline: 'none'
                          },
                          pressed: {
                            fill: '#E42',
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
          </div>
        </div>

        {/* Charts Card */}
        <div className="flex flex-col space-y-8">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Historical Projection for Selected Country</h3>
              <div>
                <label className="mr-2 font-medium">Country:</label>
                <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredByCountry}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time_period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="predicted_labour_force" stroke="#8884d8" name="Labor force participation rate (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="text-lg font-semibold mb-2">Country Ranking by Participation Rate</h3>
            <div className="mb-2">
              <label className="mr-2 font-medium">Year:</label>
              <input
                type="number"
                className="border rounded px-2 py-1"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                min={1990}
                max={maxYear}
              />
            </div>
            <div className="h-72 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredByYear.sort((a, b) => b.predicted_labour_force - a.predicted_labour_force)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="geo" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="predicted_labour_force" fill="#82ca9d" name="Labor force participation rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}