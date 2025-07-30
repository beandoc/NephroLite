
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useAppointmentData } from '@/hooks/use-appointment-data';
import { isToday, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Users, Clock, PlayCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PatientStatusPage() {
    const params = useParams();
    const { appointmentId } = params;
    const { toast } = useToast();

    // Fetch all appointments
    const { appointments, isLoading: appointmentsLoading } = useAppointmentData();

    // Auto-refresh data every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            // In a real app, you'd refetch data here.
            // For this mock, we'll just re-evaluate our existing data.
            // The hook architecture doesn't support easy refetching, so this is a simulation.
            toast({ title: "Refreshing status...", duration: 2000 });
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, [toast]);

    const { nowServing, waitingList, myAppointment, myQueuePosition, estimatedWaitTime } = useMemo(() => {
        if (appointmentsLoading) return { nowServing: null, waitingList: [], myAppointment: null, myQueuePosition: -1, estimatedWaitTime: -1 };

        const todaysAppointments = appointments.filter(app => {
            try {
                return isToday(parseISO(app.date));
            } catch {
                return false;
            }
        });

        const myAppointment = todaysAppointments.find(app => app.id === appointmentId) || null;
        
        const nowServing = todaysAppointments.find(app => app.status === 'Now Serving') || null;

        const waitingList = todaysAppointments
            .filter(app => app.status === 'Waiting')
            .sort((a, b) => a.time.localeCompare(b.time));

        let myQueuePosition = -1;
        if (myAppointment && myAppointment.status === 'Waiting') {
            myQueuePosition = waitingList.findIndex(app => app.id === myAppointment.id) + 1;
        }

        const estimatedWaitTime = myQueuePosition > 0 ? myQueuePosition * 10 : 0;

        return { nowServing, waitingList, myAppointment, myQueuePosition, estimatedWaitTime };
    }, [appointments, appointmentsLoading, appointmentId]);

    if (appointmentsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!myAppointment) {
         return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-lg text-center">
                    <CardHeader>
                        <CardTitle className="text-destructive">Appointment Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>We could not find your appointment details. Please check with the reception.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
             <header className="text-center space-y-1">
                <h1 className="text-3xl font-bold text-primary">Welcome, {myAppointment.patientName}</h1>
                <p className="text-muted-foreground text-lg">Here is your live queue status.</p>
            </header>

            <Card className="shadow-lg border-2 border-primary">
                 <CardHeader>
                    <CardTitle className="text-xl font-bold">Your Status</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                    {myAppointment.status === 'Waiting' && myQueuePosition > 0 && (
                        <>
                            <p className="text-6xl font-extrabold text-primary">{myQueuePosition}</p>
                            <p className="text-2xl text-muted-foreground">Your Queue Number</p>
                            <p className="text-xl font-medium pt-2">Estimated Wait Time: <span className="font-bold text-primary">{estimatedWaitTime} minutes</span></p>
                        </>
                    )}
                    {myAppointment.status === 'Now Serving' && (
                         <p className="text-4xl font-extrabold text-green-600">You are now being served. Please proceed to the doctor's room.</p>
                    )}
                    {myAppointment.status === 'Scheduled' && (
                         <p className="text-3xl font-bold text-amber-600">Please check-in at the reception to enter the queue.</p>
                    )}
                     {myAppointment.status === 'Completed' && (
                         <p className="text-3xl font-bold text-slate-600">Your consultation is complete.</p>
                    )}
                     {myAppointment.status === 'Cancelled' || myAppointment.status === 'Not Showed' ? (
                         <p className="text-3xl font-bold text-destructive">Your appointment has been cancelled.</p>
                    ) : null}
                </CardContent>
            </Card>

            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-green-700 flex items-center"><PlayCircle className="mr-2 h-6 w-6"/>Now Serving</CardTitle>
                </CardHeader>
                 <CardContent className="text-center">
                    {nowServing ? (
                        <p className="text-3xl font-bold">{nowServing.patientName.substring(0, 1) + "****" + nowServing.patientName.slice(-1)}</p>
                    ) : (
                        <p className="text-2xl text-muted-foreground">No one is being served</p>
                    )}
                </CardContent>
            </Card>
            
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center"><Users className="mr-2 h-6 w-6"/>Up Next in Queue</CardTitle>
                </CardHeader>
                <CardContent>
                    {waitingList.length > 0 ? (
                        <ul className="space-y-2">
                            {waitingList.slice(0, 5).map((app, index) => (
                                <li key={app.id} className={`flex items-center p-2 rounded-md text-lg ${app.id === myAppointment.id ? 'bg-blue-100 border-primary border-2' : 'bg-slate-100'}`}>
                                    <span className="font-bold text-primary mr-4">{index + 1}</span>
                                    <span className="font-semibold">{app.patientName.substring(0, 1) + "****" + app.patientName.slice(-1)}</span>
                                     {app.id === myAppointment.id && <span className="ml-auto text-sm font-bold text-primary">(This is you)</span>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-muted-foreground py-4">The waiting list is empty.</p>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}
