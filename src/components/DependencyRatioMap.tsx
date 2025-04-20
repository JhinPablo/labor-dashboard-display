import React from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const geoUrl =
  'https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json';

interface CountryPoint {
  country: string;
  latitude: number;
  longitude: number;
  dependencyRatio: number;
}

interface Props {
  data: CountryPoint[];
  year: number;
  icon?: React.ReactNode;
}

const DependencyRatioMap: React.FC<Props> = ({ data }) => {
  return (
    <ComposableMap projection="geoEqualEarth">
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography key={geo.rsmKey} geography={geo} fill="#EEE" stroke="#DDD" />
          ))
        }
      </Geographies>
      {data.map((d, i) => (
        <Marker key={i} coordinates={[d.longitude, d.latitude]}>
          <circle
            r={4}
            fill="#3b82f6"
            stroke="#fff"
            strokeWidth={1}
          />
          <text
            textAnchor="middle"
            y={-10}
            style={{ fontFamily: 'system-ui', fill: '#555', fontSize: '10px' }}
          >
            {d.country} ({d.dependencyRatio.toFixed(1)}%)
          </text>
        </Marker>
      ))}
    </ComposableMap>
  );
};

export default DependencyRatioMap;