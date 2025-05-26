
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowUp, ArrowDown, Users, Baby, TrendingUp } from 'lucide-react';
import useDashboardAPI from '@/hooks/useDashboardAPI';

const SimpleDashboard = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<number>(2020);
  
  const { data, isLoading, error } = useDashboardAPI(selectedRegion, selectedYear);

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
  };
  
  const handleYearChange = (value: string) => {
    setSelectedYear(parseInt(value));
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container p-8 max-w-7xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading dashboard data: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) return null;

  const regions = data.chartData.regions || [];
  const availableYears = data.chartData.years || [];

  return (
    <div className="container p-8 max-w-7xl mx-auto space-y-8">
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Labor Force Dashboard</h1>
          <p className="text-gray-600">Track labor market trends and demographic indicators</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <Select value={selectedRegion} onValueChange={handleRegionChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region.region} value={region.region}>
                  {region.region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex items-center text-green-600">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{data.metrics.laborForceRate.trend}%</span>
              </div>
            </div>
            <h3 className="mt-4 text-2xl font-bold">{data.metrics.laborForceRate.value}</h3>
            <p className="text-gray-600 text-sm">{data.metrics.laborForceRate.label}</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-100">
                <Baby className="h-5 w-5 text-pink-600" />
              </div>
              <div className="flex items-center text-red-600">
                <ArrowDown className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{Math.abs(data.metrics.fertilityRate.trend)}%</span>
              </div>
            </div>
            <h3 className="mt-4 text-2xl font-bold">{data.metrics.fertilityRate.value}</h3>
            <p className="text-gray-600 text-sm">{data.metrics.fertilityRate.label}</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex items-center text-green-600">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{data.metrics.populationTotal.trend}%</span>
              </div>
            </div>
            <h3 className="mt-4 text-2xl font-bold">{data.metrics.populationTotal.value}</h3>
            <p className="text-gray-600 text-sm">{data.metrics.populationTotal.label}</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-100">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex items-center text-red-600">
                <ArrowDown className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{Math.abs(data.metrics.dependencyRatio.trend)}%</span>
              </div>
            </div>
            <h3 className="mt-4 text-2xl font-bold">{data.metrics.dependencyRatio.value}</h3>
            <p className="text-gray-600 text-sm">{data.metrics.dependencyRatio.label}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fertility Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Fertility Rate Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData.fertilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Labor Force by Gender */}
        <Card>
          <CardHeader>
            <CardTitle>Labor Force by Gender</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData.laborForceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="male" fill="#3b82f6" name="Male" />
                <Bar dataKey="female" fill="#ec4899" name="Female" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Summary */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Data Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium">Region:</span> {data.metadata.selectedRegion === 'all' ? 'All Regions' : data.metadata.selectedRegion}
            </div>
            <div>
              <span className="font-medium">Year:</span> {data.metadata.selectedYear}
            </div>
            <div>
              <span className="font-medium">Countries:</span> {data.metadata.totalCountries}
            </div>
            <div>
              <span className="font-medium">Data Points:</span> {Object.values(data.metadata.dataPoints).reduce((a, b) => a + b, 0)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleDashboard;
