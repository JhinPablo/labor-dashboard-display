
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Dashboard } from './components/Dashboard';
import SubscriptionPlans from "./components/SubscriptionPlans";
import Analytics from "./pages/Analytics";
import PredictionTab from "./components/PredictionTab";
import Auth from "./pages/Auth"; // Import Auth component
import { Toaster } from "sonner";

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
            <Route path="/auth" element={<Auth />} /> {/* Add Auth route */}
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
