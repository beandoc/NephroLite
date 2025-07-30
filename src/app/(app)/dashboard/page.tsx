
import { OverviewMetrics } from '@/components/dashboard/overview-metrics';
import { KidneyFunctionChart } from '@/components/dashboard/kidney-function-chart';
import { TodaysAppointments } from '@/components/dashboard/todays-appointments';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { QuickLinks } from '@/components/dashboard/quick-links';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader 
        title="Nephrology Dashboard" 
        description="Welcome back, Dr. Sachin. Here's your overview for today."
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
        <RecentActivity />
        <QuickLinks />
      </div>
    </div>
  );
}
