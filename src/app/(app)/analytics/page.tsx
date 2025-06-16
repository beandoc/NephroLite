
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Analytics" description="View detailed analytics and reports." />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-headline">Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Analytics features are under development. Check back soon!</p>
          <div className="mt-8 flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-xl text-muted-foreground">Chart Placeholders & Data Visualizations Coming Soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
