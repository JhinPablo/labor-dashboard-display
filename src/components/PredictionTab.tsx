import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';

export default function PredictionTab() {
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2030);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('France');

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('predictions').select('*');
      if (error) console.error(error);
      else {
        setData(data);
        const uniqueCountries = [...new Set(data.map(d => d.geo))];
        setCountries(uniqueCountries);
      }
    };
    fetchData();
  }, []);

  const filteredByCountry = data.filter(d => d.geo === selectedCountry);
  const filteredByYear = data.filter(d => d.time_period === selectedYear);

  return (
    <div className="p-4 space-y-8">
      <h2 className="text-2xl font-semibold">Predicciones de fuerza laboral</h2>

      {/* Selector de país */}
      <div>
        <label className="mr-2 font-medium">País:</label>
        <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Gráfico 1: Línea temporal */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredByCountry}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time_period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="predicted_labour_force" stroke="#8884d8" name="% participación" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Selector de año para ranking */}
      <div>
        <label className="mr-2 font-medium">Año:</label>
        <input type="number" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} />
      </div>

      {/* Gráfico 2: Ranking de países por año */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredByYear.sort((a, b) => b.predicted_labour_force - a.predicted_labour_force)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="geo" type="category" />
            <Tooltip />
            <Bar dataKey="predicted_labour_force" fill="#82ca9d" name="% participación" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
