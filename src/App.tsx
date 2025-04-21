
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import SubscriptionPlans from "./components/SubscriptionPlans";
import Analytics from "./pages/Analytics";
import PredictionTab from "./components/PredictionTab";
import Auth from "./pages/Auth";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import DashboardPage from "./pages/DashboardPage";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { user } = useAuth();
  
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/subscriptions" element={<SubscriptionPlans />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/predictions" element={<PredictionTab />} />
            <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
