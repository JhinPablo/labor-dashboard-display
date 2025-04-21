
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart2, FileText, Home, Activity, LineChart } from 'lucide-react';
import AuthNav from './AuthNav';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { 
      name: 'Home', 
      path: '/', 
      icon: <Home className="h-4 w-4 mr-2" />,
      showAlways: true
    },
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: <LineChart className="h-4 w-4 mr-2" />,
      showAlways: false
    },
    { 
      name: 'Reports', 
      path: '/analytics', 
      icon: <BarChart2 className="h-4 w-4 mr-2" />,
      showAlways: true
    },    
    { 
      name: 'Predictions', 
      path: '/predictions', 
      icon: <Activity className="h-4 w-4 mr-2" />,
      showAlways: false
    },
    { 
      name: 'Subscriptions', 
      path: '/subscriptions', 
      icon: <FileText className="h-4 w-4 mr-2" />,
      showAlways: true
    }
  ];

  // Filter nav items based on authentication
  const filteredNavItems = navItems.filter(item => item.showAlways || user);

  return (
    <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-labor-100">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <div className="flex items-center">
          <Link to="/" className="flex items-center mr-8">
            <span className="text-xl font-bold text-labor-900">LaborForecast</span>
          </Link>
          
          <nav className="hidden md:flex space-x-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors",
                  location.pathname === item.path 
                    ? "bg-labor-50 text-labor-accent" 
                    : "text-labor-600 hover:bg-labor-50 hover:text-labor-accent"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <AuthNav />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
