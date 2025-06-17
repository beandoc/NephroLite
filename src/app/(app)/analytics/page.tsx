
"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Droplets, Activity, ShieldAlert, Users2, HeartPulse, Waves, Stethoscope } from 'lucide-react'; // Added more icons

interface MetricCardProps {
  title: string;
  value: string | number;
  colorClass: string; // Tailwind class for border highlight
  icon?: React.ElementType;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, colorClass, icon: Icon }) => {
  return (
    <Card className={`shadow-lg relative overflow-hidden border-t-4 ${colorClass}`}>
      <CardHeader className="pb-2 pt-4">
        {Icon && <Icon className="h-6 w-6 text-muted-foreground mb-2" />}
        <CardTitle className="text-3xl font-bold text-center">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground text-center font-medium">{title}</p>
      </CardContent>
    </Card>
  );
};


export default function AnalyticsPage() {
  const patientGroupMetrics = [
    { title: "Peritoneal dialysis", value: 22, colorClass: "border-orange-500", icon: Waves },
    { title: "Hemodialysis", value: 10, colorClass: "border-blue-500", icon: Droplets },
    { title: "Glomerulonephritis", value: 11, colorClass: "border-green-500", icon: Stethoscope },
    { title: "Kidney transplant", value: 0, colorClass: "border-green-600", icon: HeartPulse }, // Slightly different green
    { title: "Chronic Kidney disease", value: 33, colorClass: "border-cyan-500", icon: Activity },
  ];

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Patient Group Analytics" description="Overview of patient distribution by specific groups and conditions." />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {patientGroupMetrics.map(metric => (
          <MetricCard 
            key={metric.title}
            title={metric.title}
            value={metric.value}
            colorClass={metric.colorClass}
            icon={metric.icon}
          />
        ))}
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="font-headline">Additional Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Tabs for "Overall Patient", "Tagged Patient", and "Health Tracking" analytics are planned for future updates.
            This section will provide more in-depth data visualizations and reporting capabilities.
          </p>
          <div className="mt-6 flex items-center justify-center h-40 border-2 border-dashed rounded-lg">
            <p className="text-lg text-muted-foreground">More Charts & Data Views Coming Soon</p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
