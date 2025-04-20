// import React, { useState } from 'react';
// import Navbar from '@/components/Navbar';
// import { TrendingUp, Mail, Calendar, Lock, BarChart3, Activity } from 'lucide-react';
// import { Link } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// const Analytics = () => {
//   const [showContactOverlay, setShowContactOverlay] = useState(false);
//   const [openDialog, setOpenDialog] = useState(false);

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-br from-labor-50 to-white">
//       <Navbar />

//       <main className="flex-grow pt-16">
//         <div className="container mx-auto px-4 py-6">
//           <div className="mb-6">
//             <h1 className="text-2xl font-bold text-labor-900">Reports</h1>
//             <p className="text-labor-500 mt-1">
//               A snapshot of employment data trends and features under development.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
//             {/* DASHBOARD PREVIEW - occupies 2/3 width */}

//             <Card className="lg:col-span-2 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
//               <CardHeader className="pb-2">
//                 <div className="flex items-center justify-between">
//                   <BarChart3 className="h-6 w-6 text-labor-accent" />
//                 </div>
//                 <CardTitle className="text-lg mt-2">Labor Force Dashboard Report</CardTitle>
//                 <CardDescription>
//                   A written analysis based on metrics from the interactive dashboard.
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="text-sm text-gray-600 pt-0">
//                 In 2024, countries like Lithuania, Finland and Bulgaria exhibited high dependency ratios exceeding 50%, 
//                 while several nations maintained values closer to 45%. Fertility rates showed a general downward trend, 
//                 with the labor force rate increasing modestly. Explore this data through visualizations and detailed summaries.
//               </CardContent>
//               <CardFooter className="pt-0">
//                 <Dialog open={openDialog} onOpenChange={setOpenDialog}>
//                   <DialogTrigger asChild>
//                     <Button className="w-full bg-labor-accent hover:bg-labor-accent/90">
//                       View Report
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="max-w-3xl">
//                     <DialogHeader>
//                       <DialogTitle>Labor Force Dashboard Report</DialogTitle>
//                     </DialogHeader>
//                     <div className="space-y-4 text-sm text-gray-700 max-h-[70vh] overflow-y-auto">
//                       <p><strong>Overview:</strong> The 2024 labor force trends show a varied picture across European countries. The total population has grown modestly, while participation in the labor force has improved slightly, particularly among women in Central and Eastern Europe.</p>
//                       <p><strong>Fertility Rate:</strong> Fertility rates continued a gradual decline, especially in Western Europe, with countries like Spain and Italy experiencing the lowest averages. In contrast, Eastern countries maintain slightly higher rates but still below replacement level.</p>
//                       <p><strong>Dependency Ratio:</strong> Nations with aging populations—such as Finland, Lithuania, and France—display elevated dependency ratios, indicating greater economic pressure on the working population. This metric remains critical for future labor force planning.</p>
//                       <p><strong>Labor Force Participation:</strong> Gender disparity remains, although the gap is closing. Participation among women increased in most regions, driven by supportive policies and economic necessity.</p>
//                       <p><strong>Population Pyramid:</strong> Demographic pyramids reflect the aging trend, with noticeable bulges in the older age cohorts. This underscores the importance of migration and productivity improvements to sustain economic output.</p>
//                       <p>This report aggregates real-time data visualizations from the dashboard, providing a comprehensive overview for policymakers, economists, and planners.</p>
//                     </div>
//                     <a
//                       href="public/reports/labor_force_dashboard_report_2024.pdf"
//                       download
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       <Button className="mt-4 bg-labor-accent hover:bg-labor-accent/90">
//                         Download PDF
//                       </Button>
//                     </a>
//                   </DialogContent>
//                 </Dialog>
//               </CardFooter>
//             </Card>


//             {/* TWO DEVELOPMENT REPORTS */}
//             <div className="space-y-6">
//               {[
//                 {
//                   title: 'Predictive Employment Trends',
//                   desc: 'Forecasting labor participation based on AI and historical data.',
//                   icon: <Activity className="h-6 w-6 text-labor-accent" />
//                 },
//                 {
//                   title: 'Geographical Job Distribution',
//                   desc: 'Soon: Insights into regional employment clusters.',
//                   icon: <TrendingUp className="h-6 w-6 text-labor-accent" />
//                 }
//               ].map((tool, idx) => (
//                 <Card key={idx} className="hover:shadow-md transition-all duration-300">
//                   <CardHeader>
//                     <div className="flex items-center justify-between">
//                       {tool.icon}
//                       <Lock className="h-4 w-4 text-labor-500" />
//                     </div>
//                     <CardTitle className="text-lg">{tool.title}</CardTitle>
//                     <CardDescription>{tool.desc}</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="h-10 flex items-center justify-center">
//                       <p className="text-sm italic text-labor-400">In development</p>
//                     </div>
//                   </CardContent>
//                   <CardFooter>
//                     <Button className="w-full bg-labor-accent hover:bg-labor-accent/90" onClick={() => setShowContactOverlay(true)}>
//                       Get Notified
//                     </Button>
//                   </CardFooter>
//                 </Card>
//               ))}
//             </div>
//           </div>

//           {/* OVERLAY POPUP */}
//           {showContactOverlay && (
//             <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//               <Card className="max-w-md w-full">
//                 <CardHeader>
//                   <CardTitle>Coming Soon</CardTitle>
//                   <CardDescription>
//                     These features are in development. Want early access?
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <p className="text-labor-700">
//                     Reach out to our team to receive updates or request early previews as they become available.
//                   </p>
//                   <div className="flex flex-col gap-3 mt-4">
//                     <Button className="w-full bg-labor-accent hover:bg-labor-accent/90 gap-2">
//                       <Mail className="h-4 w-4" />
//                       Contact Enterprise Sales
//                     </Button>
//                     <Button variant="outline" className="w-full gap-2">
//                       <Calendar className="h-4 w-4" />
//                       Schedule Demo
//                     </Button>
//                     <Button variant="ghost" className="w-full mt-2" onClick={() => setShowContactOverlay(false)}>
//                       Return to Reports
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Analytics;

import React, { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { TrendingUp, Mail, Calendar, Lock, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Analytics = () => {
  const [showContactOverlay, setShowContactOverlay] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('labor_force_dashboard_report.pdf');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-labor-50 to-white">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-labor-900 mb-1">LaborForce Reports</h1>
            <p className="text-labor-600 text-md max-w-2xl">
              Discover comprehensive labor statistics through detailed reports and visual insights.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Elegant Report Preview */}
            <Card className="lg:col-span-2 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <BarChart3 className="h-6 w-6 text-labor-accent" />
                </div>
                <CardTitle className="text-lg mt-2">Labor Force Dashboard Report</CardTitle>
                <CardDescription>
                  A professional summary analyzing key trends in fertility, labor participation, and population demographics.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 pt-0 space-y-2">
                <p><strong>Key Highlights:</strong> Population growth in 2024 was moderate. Labor force participation rose slightly across most regions, while fertility rates continued a downward trend. High dependency ratios persisted in aging nations.</p>
                <p>Click below to access the full written report, complete with detailed analysis and strategic implications.</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-labor-accent hover:bg-labor-accent/90">
                      View Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Labor Force Dashboard Report 2024</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 text-sm text-gray-700 max-h-[70vh] overflow-y-auto">
                      <section>
                        <h4 className="text-base font-semibold text-labor-800">1. Overview</h4>
                        <p>The 2024 labor market data across Europe reveals nuanced dynamics in population trends, labor force participation, fertility rates, and demographic pressures. These insights offer valuable guidance for policy development, workforce planning, and economic sustainability initiatives.</p>
                      </section>
                      <section>
                        <h4 className="text-base font-semibold text-labor-800">2. Fertility Trends</h4>
                        <p>Fertility rates declined steadily, particularly in Western and Southern Europe. Spain, Italy, and Portugal recorded some of the lowest rates, exacerbating long-term demographic decline. Meanwhile, countries in Eastern Europe maintained slightly higher rates, though still below replacement levels.</p>
                      </section>
                      <section>
                        <h4 className="text-base font-semibold text-labor-800">3. Labor Force Participation</h4>
                        <p>Labor force participation showed slight improvements. Women’s participation increased due to enhanced parental leave, flexible work policies, and economic necessity. Northern and Central Europe led these improvements, while Southern regions exhibited slower growth.</p>
                      </section>
                      <section>
                        <h4 className="text-base font-semibold text-labor-800">4. Dependency Ratios</h4>
                        <p>Countries such as Finland, Lithuania, and Bulgaria reported dependency ratios exceeding 50%, signaling the economic burden on working-age populations. This trend highlights the urgency for pension reform and youth employment strategies in aging societies.</p>
                      </section>
                      <section>
                        <h4 className="text-base font-semibold text-labor-800">5. Demographic Insights</h4>
                        <p>Population pyramids illustrate pronounced aging. Cohorts aged 65+ continue expanding, with fewer young entrants to the labor market. This reinforces the need for immigration, lifelong learning programs, and productivity improvements to sustain economic growth.</p>
                      </section>
                      <section>
                        <h4 className="text-base font-semibold text-labor-800">6. Conclusion</h4>
                        <p>The Labor Force Dashboard provides policymakers and researchers with comprehensive, data-driven insights. Strategic investments in family support, education, and employment inclusivity will be pivotal to addressing the evolving demographic landscape.</p>
                      </section>
                    </div>
                    <a
                      href="/reports/labor_force_dashboard_report_2024.pdf"
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="mt-4 bg-labor-accent hover:bg-labor-accent/90">
                        Download PDF
                      </Button>
                    </a>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>

            {/* Other Cards */}
            <div className="space-y-6">
              {[{
                title: 'Predictive Employment Trends',
                desc: 'Forecasting labor participation based on AI and historical data.',
                icon: <TrendingUp className="h-6 w-6 text-labor-accent" />
              }, {
                title: 'Geographical Job Distribution',
                desc: 'Soon: Insights into regional employment clusters.',
                icon: <TrendingUp className="h-6 w-6 text-labor-accent" />
              }].map((tool, idx) => (
                <Card key={idx} className="hover:shadow-md transition-all duration-300 border border-gray-200 rounded-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      {tool.icon}
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <CardTitle className="text-lg font-semibold">{tool.title}</CardTitle>
                    <CardDescription>{tool.desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center text-labor-400 italic text-sm py-2">
                    In development
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-labor-accent text-white hover:bg-labor-accent/90" onClick={() => setShowContactOverlay(true)}>
                      Get Notified
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {showContactOverlay && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <Card className="max-w-md w-full">
                <CardHeader>
                  <CardTitle>Coming Soon</CardTitle>
                  <CardDescription>These features are in development. Want early access?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-labor-700">Reach out to our team to receive updates or request early previews as they become available.</p>
                  <div className="flex flex-col gap-3 mt-4">
                    <Button className="w-full bg-labor-accent hover:bg-labor-accent/90 gap-2">
                      <Mail className="h-4 w-4" /> Contact Enterprise Sales
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <Calendar className="h-4 w-4" /> Schedule Demo
                    </Button>
                    <Button variant="ghost" className="w-full mt-2" onClick={() => setShowContactOverlay(false)}>
                      Return to Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analytics;