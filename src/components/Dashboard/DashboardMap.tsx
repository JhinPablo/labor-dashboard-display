
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { 
  ComposableMap, 
  Geographies, 
  Geography,
  Marker
} from "react-simple-maps";
import { scaleLinear } from 'd3-scale';
import { Tooltip as ReactTooltip } from 'react-tooltip';

// Europe GeoJSON map data
const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/continents/europe.json";

type MapDataPoint = {
  geo: string;
  region_name: string;
  labor_force: number;
  fertility_rate: number;
  population: number;
  latitude: number;
  longitude: number;
};

type DashboardMapProps = {
  isLoading: boolean;
  selectedYear: number;
  selectedRegion: string;
};

const DashboardMap: React.FC<DashboardMapProps> = ({ 
  isLoading, 
  selectedYear, 
  selectedRegion 
}) => {
  const [mapData, setMapData] = useState<MapDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [tooltipContent, setTooltipContent] = useState("");

  useEffect(() => {
    const fetchMapData = async () => {
      setLoading(true);
      try {
        // Create a query for the map data
        const query = supabase
          .from('geo_data')
          .select(`
            geo,
            region_name,
            latitude,
            longitude
          `)
          .order('geo');

        if (selectedRegion !== 'all') {
          query.eq('region_name', selectedRegion);
        }

        const { data: geoData, error: geoError } = await query;
        
        if (geoError) throw geoError;
        
        // Fetch labor force data
        const { data: laborData, error: laborError } = await supabase
          .from('labor')
          .select('geo, labour_force')
          .eq('year', selectedYear);
          
        if (laborError) throw laborError;
        
        // Fetch fertility rate data
        const { data: fertilityData, error: fertilityError } = await supabase
          .from('fertility')
          .select('geo, fertility_rate')
          .eq('year', selectedYear);
          
        if (fertilityError) throw fertilityError;
        
        // Fetch population data
        const { data: populationData, error: populationError } = await supabase
          .from('population')
          .select('geo, population')
          .eq('year', selectedYear)
          .eq('sex', 'Total')
          .eq('age', 'Total');
          
        if (populationError) throw populationError;
        
        // Combine the data
        const combinedData = geoData.map(geo => {
          const labor = laborData.find(l => l.geo === geo.geo);
          const fertility = fertilityData.find(f => f.geo === geo.geo);
          const population = populationData.find(p => p.geo === geo.geo);
          
          return {
            geo: geo.geo,
            region_name: geo.region_name || 'Unknown',
            labor_force: labor?.labour_force || 0,
            fertility_rate: fertility?.fertility_rate || 0,
            population: population?.population || 0,
            latitude: geo.latitude || 0,
            longitude: geo.longitude || 0
          };
        }).filter(item => item.latitude && item.longitude); // Filter out points without coordinates
        
        setMapData(combinedData);
      } catch (error) {
        console.error('Error fetching map data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMapData();
  }, [selectedYear, selectedRegion]);

  // Scale for circle size based on labor force
  const maxLaborForce = Math.max(...mapData.map(d => d.labor_force), 1);
  const sizeScale = scaleLinear().domain([0, maxLaborForce]).range([5, 30]);
  
  // Scale for circle color based on fertility rate
  const colorScale = scaleLinear<string>()
    .domain([1, 2, 3])
    .range(['#ff9999', '#66c2a5', '#8da0cb']);

  if (loading || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Labor Force Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[500px]">
          <Skeleton className="h-full w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Labor Force Distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-[500px]">
        <div className="h-full relative">
          <ComposableMap
            projectionConfig={{ scale: 700 }}
            projection="geoMercator"
            width={800}
            height={500}
            data-tooltip-id="map-tooltip"
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#EAEAEC"
                    stroke="#D6D6DA"
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>
            {mapData.map((marker, i) => (
              <Marker 
                key={`marker-${i}`} 
                coordinates={[marker.longitude, marker.latitude]}
                data-tooltip-content={`
                  ${marker.geo}<br/>
                  Population: ${marker.population.toLocaleString()}<br/>
                  Labor Force: ${marker.labor_force.toLocaleString()}<br/>
                  Fertility Rate: ${marker.fertility_rate.toFixed(2)}
                `}
                onMouseEnter={() => setTooltipContent(`
                  ${marker.geo}<br/>
                  Population: ${marker.population.toLocaleString()}<br/>
                  Labor Force: ${marker.labor_force.toLocaleString()}<br/>
                  Fertility Rate: ${marker.fertility_rate.toFixed(2)}
                `)}
                onMouseLeave={() => setTooltipContent("")}
              >
                <circle
                  r={sizeScale(marker.labor_force)}
                  fill={colorScale(marker.fertility_rate)}
                  opacity={0.8}
                  stroke="#FFF"
                  strokeWidth={1}
                />
              </Marker>
            ))}
          </ComposableMap>
          <ReactTooltip 
            id="map-tooltip" 
            html={true}
          />

          {/* Legend */}
          <div className="absolute bottom-2 left-2 bg-white bg-opacity-80 p-4 rounded shadow-sm">
            <div className="text-xs text-gray-600 mb-2">Circle size: Labor Force</div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-[#ff9999]"></div>
              <span className="text-xs">Low Fertility Rate (&lt; 2)</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-[#66c2a5]"></div>
              <span className="text-xs">Medium Fertility Rate (2-3)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#8da0cb]"></div>
              <span className="text-xs">High Fertility Rate (&gt; 3)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardMap;
