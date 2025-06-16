
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from "next/image";

export default function AppointmentsPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader 
        title="Appointments" 
        description="Manage patient appointments schedule."
        actions={
          <Button>
            <CalendarPlus className="mr-2 h-4 w-4" /> Schedule New
          </Button>
        }
      />
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-headline">Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Image 
            src="https://placehold.co/600x300.png" 
            alt="Placeholder for appointments table" 
            width={600} 
            height={300}
            data-ai-hint="calendar schedule"
            className="opacity-60 mx-auto"
          />
          <p className="mt-6 text-lg text-muted-foreground">Appointments feature is under construction.</p>
          <p className="text-sm text-muted-foreground">A table view of appointments will be available here soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
