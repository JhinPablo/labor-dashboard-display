
// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { AuthProvider } from "@/contexts/AuthContext";
// import Index from "./pages/Index";
// import Reports from "./pages/Reports";
// import Analytics from "./pages/Analytics";
// import Auth from "./pages/Auth";
// import NotFound from "./pages/NotFound";

// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />
//       <AuthProvider>
//         <BrowserRouter>
//           <Routes>
//             <Route path="/" element={<Index />} />
//             <Route path="/reports" element={<Reports />} />
//             <Route path="/analytics" element={<Analytics />} />
//             <Route path="/auth" element={<Auth />} />
//             {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//         </BrowserRouter>
//       </AuthProvider>
//     </TooltipProvider>
//   </QueryClientProvider>
// );

// export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import SubscriptionPlans from "./components/SubscriptionPlans";
import Analytics from "./pages/Analytics";
import PredictionTab from "./components/PredictionTab";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subscriptions" element={<SubscriptionPlans />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/predictions" element={<PredictionTab />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
