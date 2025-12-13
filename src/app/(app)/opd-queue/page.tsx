
"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOpdQueue } from '@/hooks/use-opd-queue';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Clock, ChevronRight, PlayCircle, Users, CheckCircle, Ban, Forward, Tv2, Copy, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function OpdQueuePage() {
  const { queueEntries, loading, nowServing, waiting, updateStatus, callNext } = useOpdQueue();
  const { toast } = useToast();
  const router = useRouter();

  const handleCallNext = async () => {
    try {
      await callNext();
      toast({
        title: "Next Patient Called",
        description: waiting[0] ? `${waiting[0].patientName} is now being served.` : '',
      });
    } catch (error: any) {
      toast({
        title: error.message || "Queue is empty",
        description: "No patients are currently waiting.",
        variant: "destructive"
      });
    }
  };

  const handleCopyDisplayLink = () => {
    const url = new URL('/opd-display/public', window.location.origin);
    navigator.clipboard.writeText(url.href);
    toast({
      title: "Link Copied",
      description: "The public waiting room display link has been copied to your clipboard.",
    });
  };

  const handleMarkCompleted = async (entryId: string) => {
    try {
      await updateStatus(entryId, 'completed');
      toast({ title: "Marked as Completed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const handleMarkNoShow = async (entryId: string) => {
    try {
      await updateStatus(entryId, 'no-show');
      toast({ title: "Marked as No Show" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-2">
        <PageHeader title="OPD Queue Management" description="Loading today's patient queue..." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-1"><Skeleton className="h-48 w-full" /></div>
          <div className="md:col-span-2"><Skeleton className="h-96 w-full" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="OPD Queue Management"
        description="Manage the live patient queue for today's outpatient department."
        actions={
          <div className="flex gap-2">
            <Button onClick={handleCopyDisplayLink} variant="secondary">
              <Copy className="mr-2 h-4 w-4" /> Copy Public Display Link
            </Button>
            <Button onClick={() => router.push('/opd-display/public')} variant="outline">
              <Tv2 className="mr-2 h-4 w-4" /> Open Public Display
            </Button>
          </div>
        }
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Control Panel & Now Serving */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Queue Control</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCallNext} size="lg" className="w-full" disabled={waiting.length === 0}>
                <Forward className="mr-2 h-5 w-5" /> Call Next Patient
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline flex items-center"><PlayCircle className="mr-2 h-5 w-5 text-green-500" />Now Serving</CardTitle>
            </CardHeader>
            <CardContent>
              {nowServing ? (
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-primary">{nowServing.patientName}</p>
                  {nowServing.time && (
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Clock className="mr-1.5 h-4 w-4" />Check-in: {nowServing.time}
                    </p>
                  )}
                  {nowServing.nephroId && (
                    <p className="text-sm text-muted-foreground flex items-center">
                      <User className="mr-1.5 h-4 w-4" />Nephro ID: {nowServing.nephroId}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">Type: {nowServing.appointmentType}</p>
                  {nowServing.checkedInBy === 'patient' && (
                    <Badge className="bg-green-500">
                      <UserCheck className="mr-1 h-3 w-3" />
                      Self Check-in
                    </Badge>
                  )}
                  <Button variant="link" asChild className="p-0 h-auto mt-2">
                    <Link href={`/patients/${nowServing.patientId}`}>View Patient Profile</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No patient is currently being served.</p>
                  <p className="text-sm">Click "Call Next" to begin.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Waiting List */}
        <div className="md:col-span-2">
          <Card className="shadow-lg h-full">
            <CardHeader>
              <CardTitle className="font-headline flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />Waiting List</CardTitle>
              <CardDescription>Patients who have checked in and are waiting to be seen. Total waiting: {waiting.length}</CardDescription>
            </CardHeader>
            <CardContent>
              {waiting.length > 0 ? (
                <ul className="space-y-3">
                  {waiting.map((entry, index) => (
                    <li key={entry.id} className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-muted/50">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-primary mr-4">{index + 1}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{entry.patientName}</p>
                            {entry.checkedInBy === 'patient' && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                <UserCheck className="mr-1 h-3 w-3" />
                                Self Check-in
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {entry.time ? `Check-in: ${entry.time}` : 'Time: N/A'} • Type: {entry.appointmentType}
                          </p>
                          {entry.nephroId && (
                            <p className="text-xs text-muted-foreground">Nephro ID: {entry.nephroId}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleMarkCompleted(entry.id)} title="Mark as Completed">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleMarkNoShow(entry.id)} title="Mark as No Show">
                          <Ban className="h-4 w-4 text-red-600" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/patients/${entry.patientId}`}><ChevronRight className="h-5 w-5" /></Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <p className="text-lg">The waiting list is empty.</p>
                  <p>Patients who check-in will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
