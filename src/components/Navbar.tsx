
// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { cn } from '@/lib/utils';
// import { BarChart2, FileText, Home } from 'lucide-react';
// import AuthNav from './AuthNav';

// const Navbar = () => {
//   const location = useLocation();
  
//   const navItems = [
//     { 
//       name: 'Dashboard', 
//       path: '/', 
//       icon: <Home className="h-4 w-4 mr-2" /> 
//     },
//     { 
//       name: 'Reports', 
//       path: '/reports', 
//       icon: <FileText className="h-4 w-4 mr-2" /> 
//     },
//     { 
//       name: 'Analytics', 
//       path: '/analytics', 
//       icon: <BarChart2 className="h-4 w-4 mr-2" /> 
//     }
//   ];

//   return (
//     <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-labor-100">
//       <div className="container mx-auto px-4 flex justify-between items-center h-16">
//         <div className="flex items-center">
//           <Link to="/" className="flex items-center mr-8">
//             <span className="text-xl font-bold text-labor-900">LaborForecast</span>
//           </Link>
          
//           <nav className="hidden md:flex space-x-1">
//             {navItems.map((item) => (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={cn(
//                   "px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors",
//                   location.pathname === item.path 
//                     ? "bg-labor-50 text-labor-accent" 
//                     : "text-labor-600 hover:bg-labor-50 hover:text-labor-accent"
//                 )}
//               >
//                 {item.icon}
//                 {item.name}
//               </Link>
//             ))}
//           </nav>
//         </div>
        
//         <div className="flex items-center space-x-4">
//           <AuthNav />
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Navbar;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart2, FileText, Home, Activity } from 'lucide-react';
import AuthNav from './AuthNav';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: <Home className="h-4 w-4 mr-2" /> 
    },
    { 
      name: 'Reports', 
      path: '/reports', 
      icon: <FileText className="h-4 w-4 mr-2" /> 
    },
    { 
      name: 'Analytics', 
      path: '/analytics', 
      icon: <BarChart2 className="h-4 w-4 mr-2" /> 
    },
    { 
      name: 'Predictions', 
      path: '/predictions', 
      icon: <Activity className="h-4 w-4 mr-2" /> 
    }
  ];

  return (
    <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-labor-100">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <div className="flex items-center">
          <Link to="/" className="flex items-center mr-8">
            <span className="text-xl font-bold text-labor-900">LaborForecast</span>
          </Link>
          
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
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
