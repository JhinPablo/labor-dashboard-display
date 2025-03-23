
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Lock, PieChart, BarChart2, LineChart, TrendingUp, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Analytics = () => {
  const [showContactOverlay, setShowContactOverlay] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-labor-50 to-white">
      <Navbar />
      
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-labor-900">Advanced Analytics</h1>
            <p className="text-labor-500 mt-1">
              Interactive tools to visualize and analyze employment data
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {[
              {
                title: "Predictive Employment Trends",
                description: "AI-powered forecasting of employment trends based on historical data",
                icon: <TrendingUp className="h-6 w-6 text-labor-accent" />
              },
              {
                title: "Industry Comparison Tool",
                description: "Compare employment metrics across different industries and sectors",
                icon: <BarChart2 className="h-6 w-6 text-labor-accent" />
              },
              {
                title: "Geographical Job Distribution",
                description: "Interactive map showing job distribution and employment hotspots",
                icon: <PieChart className="h-6 w-6 text-labor-accent" />
              },
              {
                title: "Salary Benchmarking Tool",
                description: "Compare salary data against industry benchmarks and competitors",
                icon: <LineChart className="h-6 w-6 text-labor-accent" />
              }
            ].map((tool, index) => (
              <Card key={index} className="hover:shadow-md transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    {tool.icon}
                    <Lock className="h-4 w-4 text-labor-500" />
                  </div>
                  <CardTitle className="text-lg">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gray-100 rounded-md flex items-center justify-center">
                    <p className="text-labor-500">Interactive analytics preview</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-labor-accent hover:bg-labor-accent/90" onClick={() => setShowContactOverlay(true)}>
                    Access Analytics
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {showContactOverlay && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <Card className="max-w-md w-full">
                <CardHeader>
                  <CardTitle>Premium Analytics</CardTitle>
                  <CardDescription>
                    These advanced analytics tools are available exclusively for enterprise subscribers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-labor-700">
                    Our team of data specialists can provide personalized demonstrations and 
                    explain how these tools can benefit your organization's strategic planning.
                  </p>
                  <div className="flex flex-col gap-3 mt-4">
                    <Button className="w-full bg-labor-accent hover:bg-labor-accent/90 gap-2">
                      <Mail className="h-4 w-4" />
                      Contact Enterprise Sales
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <Calendar className="h-4 w-4" />
                      Schedule Consultation
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full mt-2"
                      onClick={() => setShowContactOverlay(false)}
                    >
                      Return to Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <footer className="border-t border-labor-100 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-labor-500 text-sm">
              © 2024 Labor Forecast. All rights reserved.
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-labor-500 hover:text-labor-700 text-sm">Terms</a>
              <a href="#" className="text-labor-500 hover:text-labor-700 text-sm">Privacy</a>
              <a href="#" className="text-labor-500 hover:text-labor-700 text-sm">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Analytics;
