
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subscriptions'>('dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-labor-50 to-white">
      <Navbar />
      
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-labor-900">Labor Market Analytics</h1>
              <p className="text-labor-500 mt-1">
                Track employment trends and forecast market changes
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant={activeTab === 'dashboard' ? 'default' : 'outline'} 
                onClick={() => setActiveTab('dashboard')}
                className={activeTab === 'dashboard' ? 'bg-labor-accent hover:bg-labor-accent/90' : ''}
              >
                Dashboard
              </Button>
              <Button 
                variant={activeTab === 'subscriptions' ? 'default' : 'outline'} 
                onClick={() => setActiveTab('subscriptions')}
                className={activeTab === 'subscriptions' ? 'bg-labor-accent hover:bg-labor-accent/90' : ''}
              >
                Subscription Plans
              </Button>
            </div>
          </div>
          
          <div className="transition-all duration-300 ease-in-out">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'subscriptions' && <SubscriptionPlans />}
          </div>
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

export default Index;
