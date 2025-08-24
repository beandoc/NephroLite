
"use client";

import { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useAppointmentData } from '@/hooks/use-appointment-data';
import { isToday, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Users, Clock, PlayCircle, Loader2, CheckCircle, Hourglass } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePatientData } from '@/hooks/use-patient-data';

const anonymizeName = (name: string) => {
    if (!name || name.length < 2) return "******";
    return `${name.charAt(0)}****${name.slice(-1)}`;
};

export default function PatientStatusPage() {
    const params = useParams();
    const { appointmentId } = params;
    const { toast } = useToast();

    const { appointments, isLoading: appointmentsLoading } = useAppointmentData();
    const { getPatientById } = usePatientData();

    // Auto-refresh data every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            // This is a placeholder for a potential refetch in a more advanced setup.
            // The onSnapshot listener in the hook handles real-time updates automatically.
            toast({ title: "Status refreshed", duration: 1500 });
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, [toast]);

    const { nowServing, waitingList, myAppointment, myQueuePosition, nowServingQueueNumber } = useMemo(() => {
        if (appointmentsLoading) return { nowServing: null, waitingList: [], myAppointment: null, myQueuePosition: -1, nowServingQueueNumber: 0 };

        const todaysAppointments = appointments.filter(app => {
            try { return isToday(parseISO(app.date)); } catch { return false; }
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

        const completedOrServing = todaysAppointments
            .filter(app => app.status === 'Completed' || app.status === 'Now Serving')
            .sort((a,b) => a.time.localeCompare(b.time));

        const nowServingQueueNumber = completedOrServing.findIndex(app => app.id === nowServing?.id) + 1;


        return { nowServing, waitingList, myAppointment, myQueuePosition, nowServingQueueNumber };
    }, [appointments, appointmentsLoading, appointmentId]);

    const getPatientFullName = (patientId: string) => {
        const patient = getPatientById(patientId);
        if (!patient) return "Patient";
        return [patient.firstName, patient.lastName].filter(Boolean).join(' ');
    }

    const getStatusContent = () => {
        if (!myAppointment) return null;

        switch (myAppointment.status) {
            case 'Waiting':
                if (myQueuePosition === 1) {
                     return <p className="text-4xl font-extrabold text-amber-500 animate-pulse">You are next! Please be ready.</p>;
                }
                return (
                    <>
                        <p className="text-6xl font-extrabold text-primary">{myQueuePosition > 0 ? myQueuePosition : '-'}</p>
                        <p className="text-2xl text-muted-foreground">Your Position in Queue</p>
                        <p className="text-xl font-medium pt-2">Please wait for your turn.</p>
                    </>
                );
            case 'Now Serving':
                return <p className="text-4xl font-extrabold text-green-600">You are now being served. Please proceed to the doctor's room.</p>;
            case 'Scheduled':
                return <p className="text-3xl font-bold text-amber-600">Please check-in at the reception to enter the queue.</p>;
            case 'Completed':
                return <p className="text-3xl font-bold text-slate-600 flex items-center justify-center gap-2"><CheckCircle/> Your consultation is complete.</p>;
            case 'Cancelled':
            case 'Not Showed':
                 return <p className="text-3xl font-bold text-destructive">Your appointment has been cancelled.</p>;
            default:
                return null;
        }
    }


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

    const patientFullName = getPatientFullName(myAppointment.patientId);

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
             <header className="text-center space-y-1">
                <h1 className="text-3xl font-bold text-primary">Welcome, {patientFullName}</h1>
                <p className="text-muted-foreground text-lg">Here is your live queue status.</p>
            </header>

            <Card className="shadow-lg border-2 border-primary">
                 <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
                       <Hourglass className="w-6 h-6"/> Your Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-2 py-8">
                   {getStatusContent()}
                </CardContent>
            </Card>

            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-green-700 flex items-center"><PlayCircle className="mr-2 h-6 w-6"/>Now Serving</CardTitle>
                </CardHeader>
                 <CardContent className="text-center">
                    {nowServing && nowServingQueueNumber > 0 ? (
                        <p className="text-5xl font-bold">{nowServingQueueNumber}</p>
                    ) : (
                        <p className="text-2xl text-muted-foreground">--</p>
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
                            {waitingList.slice(0, 5).map((app, index) => {
                                const appPatientName = getPatientFullName(app.patientId);
                                return (
                                    <li key={app.id} className={`flex items-center p-2 rounded-md text-lg ${app.id === myAppointment.id ? 'bg-blue-100 border-primary border-2' : 'bg-slate-100'}`}>
                                        <span className="font-bold text-primary mr-4">{nowServingQueueNumber > 0 ? nowServingQueueNumber + index + 1 : index + 1}</span>
                                        <span className="font-semibold">{anonymizeName(appPatientName)}</span>
                                         {app.id === myAppointment.id && <span className="ml-auto text-sm font-bold text-primary">(This is you)</span>}
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-center text-muted-foreground py-4">The waiting list is empty.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
