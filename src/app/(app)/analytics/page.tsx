
"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PatientAnalysisChart } from '@/components/dashboard/patient-analysis-chart'; // Reusing this chart
import { KidneyFunctionChart } from '@/components/dashboard/kidney-function-chart'; // For GFR Tracker idea
import { AlertTriangle, TrendingDown, TrendingUp, Users2 } from 'lucide-react';

// Mock data for placeholder cards
const mockAnalyticsCounts = {
  ipdPatients: 12,
  opdPatients: 125,
  criticalAlerts: 3,
};

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Clinical Analytics" description="View detailed analytics, reports, and patient population insights." />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">IPD Patient Count</CardTitle>
            <Users2 className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockAnalyticsCounts.ipdPatients}</div>
            <p className="text-xs text-muted-foreground">Currently admitted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">OPD Patient Visits (Today)</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockAnalyticsCounts.opdPatients}</div>
            <p className="text-xs text-muted-foreground">+15% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Active Critical Alerts</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockAnalyticsCounts.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <PatientAnalysisChart />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">GFR Tracker (All Patients Average)</CardTitle>
              <CardDescription>Average eGFR trends over time for the patient population.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Using KidneyFunctionChart as a placeholder for GFR tracker */}
              <KidneyFunctionChart period="monthly" />
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-headline">Tag-Based Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Further analytics based on patient tags (e.g., 'High-Risk CKD', 'Post-Transplant') are under development.</p>
          <div className="mt-6 flex items-center justify-center h-40 border-2 border-dashed rounded-lg">
            <p className="text-lg text-muted-foreground">Tag-Specific Charts Coming Soon</p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
