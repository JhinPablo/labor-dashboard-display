
// import React from 'react';
// import { cn } from '@/lib/utils';
// import { Card } from '@/components/ui/card';
// import { cva, type VariantProps } from 'class-variance-authority';
// import { ArrowDown, ArrowUp } from 'lucide-react';

// const metricCardVariants = cva(
//   "overflow-hidden transition-all duration-300 hover:shadow-md",
//   {
//     variants: {
//       variant: {
//         default: "bg-white border",
//         glass: "glass-card",
//       },
//       size: {
//         default: "",
//         lg: ""
//       }
//     },
//     defaultVariants: {
//       variant: "default",
//       size: "default",
//     },
//   }
// );

// export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof metricCardVariants> {
//   title: string;
//   value: string | number;
//   description?: string;
//   icon?: React.ReactNode;
//   trend?: {
//     value: number;
//     isPositive: boolean;
//   }
// }

// export function MetricCard({ 
//   title, 
//   value, 
//   description, 
//   icon, 
//   trend,
//   variant, 
//   size, 
//   className, 
//   ...props 
// }: MetricCardProps) {
//   return (
//     <Card
//       className={cn(
//         metricCardVariants({ variant, size }),
//         "animate-scale-in",
//         className
//       )}
//       {...props}
//     >
//       <div className="relative p-6">
//         {icon && (
//           <div className="absolute top-6 right-6 h-12 w-12 flex items-center justify-center rounded-full bg-labor-50 text-labor-accent opacity-80">
//             {icon}
//           </div>
//         )}
        
//         <div className="space-y-3">
//           <p className="text-sm font-medium text-labor-500">{title}</p>
//           <div className="flex flex-col gap-1">
//             <h3 className="text-2xl sm:text-3xl font-bold text-labor-900">{value}</h3>
            
//             {trend && (
//               <div className="flex items-center text-sm font-medium">
//                 <span className={trend.isPositive ? "text-green-600 flex items-center" : "text-red-500 flex items-center"}>
//                   {trend.isPositive ? (
//                     <ArrowUp className="h-3 w-3 mr-1" />
//                   ) : (
//                     <ArrowDown className="h-3 w-3 mr-1" />
//                   )}
//                   {Math.abs(trend.value)}%
//                 </span>
//                 <span className="ml-1.5 text-labor-500">vs last month</span>
//               </div>
//             )}
//           </div>
          
//           {description && (
//             <p className="text-sm text-labor-500">{description}</p>
//           )}
//         </div>
//       </div>
//     </Card>
//   );
// }

// export default MetricCard;

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend }) => {
  return (
    <Card className="bg-white shadow-sm rounded-lg">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">{title}</span>
          {icon}
        </div>
        <div className="text-2xl font-semibold text-gray-800">
          {typeof value === 'object' ? JSON.stringify(value) : value}
        </div>
        {trend && (
          <div className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '▲' : '▼'} {Math.abs(trend.value).toFixed(1)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;