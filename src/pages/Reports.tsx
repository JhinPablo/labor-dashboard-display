
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Lock, FileBarChart, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Reports = () => {
  const [showContactOverlay, setShowContactOverlay] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-labor-50 to-white">
      <Navbar />
      
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-labor-900">Employment Reports</h1>
            <p className="text-labor-500 mt-1">
              Comprehensive employment data and customized reports
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {[
              {
                title: "Quarterly Employment Forecast",
                description: "Employment projections for the next quarter based on current market trends",
                icon: <FileBarChart className="h-6 w-6 text-labor-accent" />
              },
              {
                title: "Salary Range Analysis",
                description: "Detailed breakdown of salary ranges by industry, experience level, and location",
                icon: <FileBarChart className="h-6 w-6 text-labor-accent" />
              },
              {
                title: "Industry Growth Report",
                description: "Analysis of the fastest growing and declining industries in the current market",
                icon: <FileBarChart className="h-6 w-6 text-labor-accent" />
              },
              {
                title: "Regional Employment Analysis",
                description: "Comparison of employment rates and job openings across different regions",
                icon: <FileBarChart className="h-6 w-6 text-labor-accent" />
              },
              {
                title: "Skills Demand Forecast",
                description: "Projection of the most in-demand skills for the upcoming year",
                icon: <FileBarChart className="h-6 w-6 text-labor-accent" />
              },
              {
                title: "Labor Market Health Index",
                description: "Comprehensive assessment of overall labor market conditions",
                icon: <FileBarChart className="h-6 w-6 text-labor-accent" />
              }
            ].map((report, index) => (
              <Card key={index} className="hover:shadow-md transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    {report.icon}
                    <Lock className="h-4 w-4 text-labor-500" />
                  </div>
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setShowContactOverlay(true)}>
                    View Report
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {showContactOverlay && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <Card className="max-w-md w-full">
                <CardHeader>
                  <CardTitle>Premium Content</CardTitle>
                  <CardDescription>
                    This report is available exclusively for premium subscribers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-labor-700">
                    Contact our sales team to schedule a demonstration and discuss 
                    subscription options tailored to your organization's needs.
                  </p>
                  <div className="flex flex-col gap-3 mt-4">
                    <Button className="w-full bg-labor-accent hover:bg-labor-accent/90 gap-2">
                      <Mail className="h-4 w-4" />
                      Contact Sales
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <Calendar className="h-4 w-4" />
                      Schedule Demo
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full mt-2"
                      onClick={() => setShowContactOverlay(false)}
                    >
                      Return to Reports
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

export default Reports;