
import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out", 
        scrolled ? "bg-white/80 backdrop-blur-md border-b shadow-sm" : "bg-transparent",
        className
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col gap-6 mt-8">
                <div className="px-2">
                  <h3 className="font-medium text-sm text-labor-500 mb-3">MENU</h3>
                  <div className="space-y-1">
                    <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-labor-50 text-labor-900">
                      Dashboard
                    </Link>
                    <Link to="/reports" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-labor-50 text-labor-900">
                      Reports
                    </Link>
                    <Link to="/analytics" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-labor-50 text-labor-900">
                      Analytics
                    </Link>
                    <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-labor-50 text-labor-900">
                      Subscriptions
                    </Link>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-labor-800 to-labor-accent">
              Labor Forecast
            </Link>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-1">
          <Link to="/" className="px-3 py-2 rounded-md hover:bg-labor-50 text-labor-700 transition-colors">
            Dashboard
          </Link>
          <Link to="/reports" className="px-3 py-2 rounded-md hover:bg-labor-50 text-labor-700 transition-colors">
            Reports
          </Link>
          <Link to="/analytics" className="px-3 py-2 rounded-md hover:bg-labor-50 text-labor-700 transition-colors">
            Analytics
          </Link>
          <Link to="/" className="px-3 py-2 rounded-md hover:bg-labor-50 text-labor-700 transition-colors">
            Subscriptions
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative hidden md:block">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-labor-400" />
            <Input 
              type="text" 
              placeholder="Search..." 
              className="w-48 pl-9 h-9 rounded-full bg-labor-50 border-labor-100 focus-visible:ring-labor-accent"
            />
          </div>
          
          <Button variant="ghost" size="icon" className="rounded-full text-labor-700">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Avatar className="h-9 w-9 transition-transform hover:scale-110">
            <AvatarFallback className="bg-labor-100 text-labor-700">LF</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
