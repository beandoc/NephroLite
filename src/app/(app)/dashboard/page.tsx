
import { OverviewMetrics } from '@/components/dashboard/overview-metrics';
import { KidneyFunctionChart } from '@/components/dashboard/kidney-function-chart';
import { TodaysAppointments } from '@/components/dashboard/todays-appointments';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Link2 } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader 
        title="Nephrology Dashboard" 
        description="Welcome back, Dr. Sarah Johnson. Here's your overview for today."
        // Removed actions prop which contained the "Add New Patient" button
      />
      <OverviewMetrics />
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-headline">Patient Kidney Function Trends</CardTitle>
              <Tabs defaultValue="weekly" className="w-auto">
                <TabsList>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {/* Weekly Tab Content (Default) */}
              <Tabs defaultValue="weekly">
                <TabsContent value="weekly" className="mt-0">
                  <KidneyFunctionChart />
                </TabsContent>
                <TabsContent value="monthly" className="mt-0">
                  <KidneyFunctionChart period="monthly" />
                </TabsContent>
                <TabsContent value="yearly" className="mt-0">
                  <KidneyFunctionChart period="yearly" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <TodaysAppointments />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Activity className="mr-2 h-5 w-5 text-primary"/>Recent Activity</CardTitle>
            <CardDescription>Latest actions and updates in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Recent activity feed placeholder.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Link2 className="mr-2 h-5 w-5 text-primary"/>Quick Links</CardTitle>
            <CardDescription>Navigate to frequently used sections.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-40 flex items-center justify-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Quick links placeholder.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
