
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { PlanCard } from './PlanCard';
import { Button } from '@/components/ui/button';

interface SubscriptionPlansProps {
  className?: string;
}

export function SubscriptionPlans({ className }: SubscriptionPlansProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  
  const basicFeatures = [
    { name: 'Basic employment metrics', included: true },
    { name: 'Monthly trend reports', included: true },
    { name: 'Single user license', included: true },
    { name: 'Email support', included: true },
    { name: 'API access', included: false },
    { name: 'Custom reports', included: false },
    { name: 'Regional data analysis', included: false },
    { name: 'Advanced forecasting', included: false },
  ];
  
  const professionalFeatures = [
    { name: 'Basic employment metrics', included: true },
    { name: 'Monthly trend reports', included: true },
    { name: 'Up to 5 user licenses', included: true },
    { name: 'Priority email support', included: true },
    { name: 'API access', included: true },
    { name: 'Custom reports', included: true },
    { name: 'Regional data analysis', included: true },
    { name: 'Advanced forecasting', included: false },
  ];
  
  const enterpriseFeatures = [
    { name: 'Basic employment metrics', included: true },
    { name: 'Monthly trend reports', included: true },
    { name: 'Unlimited user licenses', included: true },
    { name: 'Dedicated support manager', included: true },
    { name: 'API access', included: true },
    { name: 'Custom reports', included: true },
    { name: 'Regional data analysis', included: true },
    { name: 'Advanced forecasting', included: true },
  ];
  
  return (
    <div className={cn("p-6 space-y-8 animate-fade-in", className)}>
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl font-bold text-labor-900 mb-4">Find the Right Plan for Your Needs</h2>
        <p className="text-labor-600">
          Choose the plan that suits your business requirements. Unlock advanced features and detailed analytics with our premium plans.
        </p>
        
        <div className="mt-8 inline-flex items-center bg-labor-50 p-1 rounded-full">
          <Button
            variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
            className={cn(
              "rounded-full",
              billingPeriod === 'monthly' 
                ? "bg-white shadow-sm hover:bg-white" 
                : "hover:bg-white/50"
            )}
            onClick={() => setBillingPeriod('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={billingPeriod === 'yearly' ? 'default' : 'ghost'}
            className={cn(
              "rounded-full ml-1",
              billingPeriod === 'yearly' 
                ? "bg-white shadow-sm hover:bg-white" 
                : "hover:bg-white/50"
            )}
            onClick={() => setBillingPeriod('yearly')}
          >
            Yearly
            <span className="ml-1.5 text-xs font-medium bg-labor-accent text-white py-0.5 px-1.5 rounded-full">
              Save 20%
            </span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-animation">
        <PlanCard
          title="Basic"
          price={{
            monthly: 49,
            yearly: 470,
          }}
          description="Essential employment insights for small businesses"
          features={basicFeatures}
        />
        
        <PlanCard
          title="Professional"
          price={{
            monthly: 99,
            yearly: 950,
          }}
          description="Comprehensive data for growing organizations"
          features={professionalFeatures}
          highlighted={true}
          badge="Popular"
        />
        
        <PlanCard
          title="Enterprise"
          price={{
            monthly: 249,
            yearly: 2390,
          }}
          description="Advanced forecasting for large enterprises"
          features={enterpriseFeatures}
        />
      </div>
      
      <div className="mt-12 p-6 border border-labor-100 rounded-xl bg-labor-50/50 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-medium text-labor-900">Need a customized solution?</h3>
            <p className="text-labor-600 mt-2">
              Contact our sales team for a tailored package that fits your specific requirements.
            </p>
          </div>
          <Button size="lg" className="whitespace-nowrap">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPlans;
