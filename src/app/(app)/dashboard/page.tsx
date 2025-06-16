
import { OverviewMetrics } from '@/components/dashboard/overview-metrics';
import { PatientAnalysisChart } from '@/components/dashboard/patient-analysis-chart';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Dashboard" description="Welcome to NephroLite, Dr. User!" />
      <OverviewMetrics />
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Patient Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <PatientAnalysisChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
