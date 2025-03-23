
import React from 'react';
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PlanCardProps {
  title: string;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  features: PlanFeature[];
  highlighted?: boolean;
  className?: string;
  badge?: string;
}

export function PlanCard({
  title,
  price,
  description,
  features,
  highlighted = false,
  className,
  badge,
}: PlanCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px]",
        highlighted 
          ? "border-labor-accent shadow-md" 
          : "border-border hover:border-labor-200",
        className
      )}
    >
      <div className={cn(
        "p-6",
        highlighted ? "bg-gradient-to-br from-labor-accent/10 to-labor-accent/5" : ""
      )}>
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-xl text-labor-900">{title}</h3>
            {badge && (
              <Badge className="bg-labor-accent hover:bg-labor-accent/90">
                {badge}
              </Badge>
            )}
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-labor-900">
                ${price.monthly}
              </span>
              <span className="ml-1 text-labor-500">/month</span>
            </div>
            <div className="text-sm text-labor-500">
              ${price.yearly}/year (save ${price.monthly * 12 - price.yearly})
            </div>
          </div>
          <p className="text-labor-600 mt-3">{description}</p>
        </div>
      </div>
      
      <div className="flex-grow p-6 pt-0">
        <ul className="space-y-3 mt-6">
          {features.map((feature, i) => (
            <li 
              key={i} 
              className="flex items-start"
            >
              <div 
                className={cn(
                  "mr-3 mt-0.5 flex-shrink-0 rounded-full p-1", 
                  feature.included 
                    ? "text-labor-accent bg-labor-accent/10" 
                    : "text-labor-300 bg-labor-100"
                )}
              >
                <Check className="h-4 w-4" />
              </div>
              <span className={cn(
                feature.included ? "text-labor-700" : "text-labor-400 line-through"
              )}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-6 pt-0">
        <Button
          className={cn(
            "w-full",
            highlighted 
              ? "bg-labor-accent hover:bg-labor-accent/90" 
              : ""
          )}
        >
          Choose {title}
        </Button>
      </div>
    </Card>
  );
}

export default PlanCard;
