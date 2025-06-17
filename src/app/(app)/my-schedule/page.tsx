
"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarRange } from 'lucide-react';

export default function MySchedulePage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="My Schedule"
        description="View and manage your upcoming appointments and events."
      />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <CalendarRange className="mr-2 h-5 w-5 text-primary" />
            Doctor's Calendar View
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col items-center justify-center">
          <CalendarRange className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground mb-2">Calendar Feature Under Development</p>
          <p className="text-sm text-muted-foreground text-center">
            This section will display your schedule in a calendar format.
            <br />
            Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
