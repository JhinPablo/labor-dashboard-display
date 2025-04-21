
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LineChart, 
  Users,
  BarChart2,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  
  return (
    <div className="py-12 px-4 md:px-6 space-y-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-labor-900 mb-4">
          Labor Market Analytics Platform
        </h1>
        <p className="text-xl text-labor-600 mb-8">
          Access comprehensive demographic and labor market data for informed decision-making
        </p>
        
        {!user ? (
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-labor-accent hover:bg-labor-accent/90">
              <Link to="/auth">Sign Up for Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/subscriptions">View Subscription Plans</Link>
            </Button>
          </div>
        ) : (
          <Button asChild size="lg" className="bg-labor-accent hover:bg-labor-accent/90">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        )}
      </section>
      
      {/* Features Section */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-labor-800 text-center mb-8">Key Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="mb-2 p-2 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <LineChart className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Interactive Charts</CardTitle>
              <CardDescription>Visualize complex demographic data through interactive charts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-labor-600">
                Our platform provides comprehensive visualizations that make understanding population trends, fertility rates, and labor market dynamics intuitive and accessible.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="mb-2 p-2 w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <BarChart2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Demographic Analysis</CardTitle>
              <CardDescription>Access detailed population and labor market statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-labor-600">
                Explore comprehensive demographic statistics including dependency ratios, gender distribution in labor markets, and population pyramids across different countries and regions.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="mb-2 p-2 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Market Predictions</CardTitle>
              <CardDescription>Forecast future labor market trends</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-labor-600">
                Utilize our advanced prediction models to forecast future labor market trends, helping businesses and policymakers make data-driven decisions.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Subscription Plans Preview */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-labor-800 text-center mb-8">Subscription Plans</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Basic access to demographic data</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal text-gray-500">/month</span></p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> Basic metrics and statistics
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> Global overview data
                </li>
                <li className="flex items-center text-gray-400">
                  <span className="mr-2">✗</span> Interactive charts
                </li>
                <li className="flex items-center text-gray-400">
                  <span className="mr-2">✗</span> Detailed reports
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/auth">Sign Up Free</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-2 border-blue-200 shadow-md relative">
            <div className="absolute -top-3 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Popular
            </div>
            <CardHeader>
              <CardTitle>Silver</CardTitle>
              <CardDescription>Enhanced analytics and visualizations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4">$29<span className="text-sm font-normal text-gray-500">/month</span></p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> All Free features
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> Interactive charts
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> Region-specific data
                </li>
                <li className="flex items-center text-gray-400">
                  <span className="mr-2">✗</span> Detailed custom reports
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link to="/subscriptions">Choose Silver</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-2 border-gold-200 bg-gradient-to-b from-white to-yellow-50">
            <CardHeader>
              <CardTitle>Gold</CardTitle>
              <CardDescription>Complete access with custom reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4">$79<span className="text-sm font-normal text-gray-500">/month</span></p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> All Silver features
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> Detailed custom reports
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> Prediction analytics
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> Data export capabilities
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white" asChild>
                <Link to="/subscriptions">Choose Gold</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
      
      {/* About Section */}
      <section className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-semibold text-labor-800 mb-4">About Labor Forecast</h2>
        <p className="text-labor-600 mb-6">
          Labor Forecast provides comprehensive demographic and labor market analytics to help researchers, 
          businesses, and government agencies make data-driven decisions. Our platform offers access to 
          global population data, labor force statistics, and predictive analytics through an intuitive interface.
        </p>
        <Button asChild variant="outline">
          <Link to="/analytics">Learn More</Link>
        </Button>
      </section>
    </div>
  );
};

export default Home;
