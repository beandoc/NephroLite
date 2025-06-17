
"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Droplets, Activity, ShieldAlert, Users2, HeartPulse, Waves, Stethoscope, BarChart3, NotebookText, LinkIcon, FileText } from 'lucide-react'; // Added more icons

interface MetricCardProps {
  title: string;
  value?: string | number;
  description?: string;
  colorClass?: string; 
  icon?: React.ElementType;
  link?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, description, colorClass, icon: Icon, link }) => {
  const content = (
    <Card className={`shadow-lg relative overflow-hidden ${colorClass ? `border-t-4 ${colorClass}` : ''}`}>
      <CardHeader className="pb-2 pt-4">
        {Icon && <Icon className="h-7 w-7 text-muted-foreground mb-2" />}
        {value && <CardTitle className="text-3xl font-bold text-center">{value}</CardTitle>}
      </CardHeader>
      <CardContent className="pb-4">
        <p className={`text-sm ${value ? 'text-muted-foreground' : 'font-semibold'} text-center ${value ? 'font-medium' : ''}`}>{title}</p>
        {description && <p className="text-xs text-muted-foreground text-center mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
  
  if (link) {
    return <a href={link} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">{content}</a>;
  }
  return content;
};


export default function AnalyticsPage() {
  const patientGroupMetrics: MetricCardProps[] = [
    { title: "Peritoneal dialysis", value: 22, colorClass: "border-orange-500", icon: Waves },
    { title: "Hemodialysis", value: 10, colorClass: "border-blue-500", icon: Droplets },
    { title: "Glomerulonephritis", value: 11, colorClass: "border-green-500", icon: Stethoscope },
    { title: "Kidney transplant", value: 0, colorClass: "border-green-600", icon: HeartPulse }, 
    { title: "Chronic Kidney disease", value: 33, colorClass: "border-cyan-500", icon: Activity },
  ];

  const gnModuleAnalytics: MetricCardProps[] = [
    { title: "24hr Urine Protein Graph", icon: BarChart3, description: "Track proteinuria over time.", colorClass: "border-purple-500" },
    { title: "Diet Management Module", icon: NotebookText, description: "Access dietary planning tools.", colorClass: "border-teal-500" },
    { title: "Key Event Log Summary", icon: FileText, description: "View significant patient events.", colorClass: "border-indigo-500" },
    { title: "Disease Progression Models", icon: LinkIcon, description: "External prediction model links.", colorClass: "border-pink-500", link: "#" }
  ];


  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Nephrology Analytics Dashboard" description="Overview of patient data, trends, and clinical insights." />
      
      <Card className="mb-8 mt-6">
        <CardHeader>
          <CardTitle className="font-headline">Patient Group Distribution</CardTitle>
          <CardDescription>Overview of patient distribution by specific groups and conditions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {patientGroupMetrics.map(metric => (
              <MetricCard 
                key={metric.title}
                {...metric}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline">Glomerulonephritis (GN) Module Analytics</CardTitle>
          <CardDescription>Specific analytics and tools for managing GN patients.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gnModuleAnalytics.map(metric => (
              <MetricCard 
                key={metric.title}
                {...metric}
              />
            ))}
          </div>
        </CardContent>
      </Card>


      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="font-headline">Additional Analytics & Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Further sections for "Overall Patient Demographics", "Tagged Patient Analysis", and "Health Outcome Tracking" are planned for future updates.
            This area will provide more in-depth data visualizations and reporting capabilities.
          </p>
          <div className="mt-6 flex items-center justify-center h-40 border-2 border-dashed rounded-lg">
            <p className="text-lg text-muted-foreground">More Charts & Data Views Coming Soon</p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

