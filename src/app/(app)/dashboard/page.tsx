
import { OverviewMetrics } from '@/components/dashboard/overview-metrics';
import { PatientVisitsChart } from '@/components/dashboard/patient-visits-chart';
import { TodaysAppointments } from '@/components/dashboard/todays-appointments';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { QuickLinks } from '@/components/dashboard/quick-links';
import { MOCK_USER } from '@/lib/constants';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader 
        title="Nephrology Dashboard" 
        description={`Welcome back, ${MOCK_USER.name}. Here's your overview for today.`}
      />
      <OverviewMetrics />
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <PatientVisitsChart />
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
