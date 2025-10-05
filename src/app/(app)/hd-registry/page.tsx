
"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Droplets } from 'lucide-react';

export default function HdRegistryPage() {

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Hemodialysis Registry"
        description="Manage and review hemodialysis sessions for all patients."
      />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <Droplets className="mr-2 h-5 w-5 text-primary" />
            HD Patient Roster & Session Logs
          </CardTitle>
          <CardDescription>
            This section is under construction. It will display a list of all patients on hemodialysis and their session metrics.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground text-center">
            Hemodialysis registry content coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
