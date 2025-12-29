"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-provider';
import { useOpdQueue } from '@/hooks/use-opd-queue';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Users, RefreshCw, CheckCircle2, AlertCircle, Calendar, CalendarX } from 'lucide-react';
import { format, addMinutes, isPast, isFuture, isToday, parseISO } from 'date-fns';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AVG_CONSULTATION_MINUTES = 15;

export default function PatientQueueStatusPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { queueEntries, loading, waiting, nowServing } = useOpdQueue();
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [upcomingAppointment, setUpcomingAppointment] = useState<any>(null);
    const [missedAppointment, setMissedAppointment] = useState<any>(null);
    const [loadingAppointments, setLoadingAppointments] = useState(true);

    // Update last refresh timestamp when queue data changes (real-time)
    useEffect(() => {
        if (!loading && queueEntries.length >= 0) {
            setLastRefresh(new Date());
        }
    }, [queueEntries, loading]);

    // Update timestamp display every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            setLastRefresh(new Date());
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Fetch patient's appointments
    useEffect(() => {
        if (!user?.uid) return;

        const fetchAppointments = async () => {
            try {
                // Get upcoming appointment
                const upcomingQuery = query(
                    collection(db, `users/${user.uid}/appointments`),
                    where('date', '>=', format(new Date(), 'yyyy-MM-dd')),
                    orderBy('date', 'asc'),
                    limit(1)
                );
                const upcomingSnap = await getDocs(upcomingQuery);
                if (!upcomingSnap.empty) {
                    const doc = upcomingSnap.docs[0];
                    setUpcomingAppointment({ id: doc.id, ...doc.data() });
                }

                // Get most recent past appointment (potential missed)
                const today = format(new Date(), 'yyyy-MM-dd');
                const missedQuery = query(
                    collection(db, `users/${user.uid}/appointments`),
                    where('date', '<', today),
                    orderBy('date', 'desc'),
                    limit(1)
                );
                const missedSnap = await getDocs(missedQuery);
                if (!missedSnap.empty) {
                    const doc = missedSnap.docs[0];
                    const data = doc.data();
                    // Only consider as "missed" if status is not 'completed'
                    if (data.status !== 'completed' && data.status !== 'cancelled') {
                        setMissedAppointment({ id: doc.id, ...data });
                    }
                }

                setLoadingAppointments(false);
            } catch (error) {
                console.error('Error fetching appointments:', error);
                setLoadingAppointments(false);
            }
        };

        fetchAppointments();
    }, [user]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!user) {
            router.push('/login/patient');
        }
    }, [user, router]);

    const handleRefresh = () => {
        setLastRefresh(new Date());
    };

    // Find patient's queue entry
    const myEntry = queueEntries.find(entry => entry.patientId === user?.uid);
    const myPosition = myEntry ? waiting.findIndex(entry => entry.id === myEntry.id) + 1 : null;
    const isBeingServed = nowServing?.id === myEntry?.id;
    const isInQueue = !!myEntry;

    // Calculate estimated time
    const calculateEstimatedTime = () => {
        if (!myPosition || myPosition <= 0) return null;
        const now = new Date();
        const estimatedMinutes = myPosition * AVG_CONSULTATION_MINUTES;
        const estimatedTime = addMinutes(now, estimatedMinutes);
        return {
            absoluteTime: format(estimatedTime, 'h:mm a'),
            relativeTime: estimatedMinutes < 60
                ? `in ~${estimatedMinutes} minutes`
                : `in ~${Math.round(estimatedMinutes / 60)} hours`
        };
    };

    const estimatedTime = calculateEstimatedTime();

    if (loading || loadingAppointments) {
        return (
            <div className="container mx-auto py-6 max-w-2xl">
                <PageHeader title="Queue Status" description="Loading your queue information..." />
                <div className="space-y-4 mt-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        );
    }

    // Not in queue - show appointment info
    if (!isInQueue) {
        return (
            <div className="container mx-auto py-6 max-w-2xl">
                <PageHeader
                    title="Queue Status"
                    description="Your OPD queue and appointment information"
                    actions={
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Last updated: {format(lastRefresh, 'h:mm a')}</span>
                        </div>
                    }
                />

                <div className="space-y-4 mt-6">
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center py-6">
                                <AlertCircle className="h-14 w-14 text-yellow-600 mb-4" />
                                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Not in Queue Today</h3>
                                <p className="text-yellow-800 mb-4">
                                    You haven't checked in for today's OPD session.
                                </p>
                                <Button
                                    variant="default"
                                    onClick={() => router.push('/patient/checkin')}
                                >
                                    Check In Now
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Appointment */}
                    {upcomingAppointment && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-green-600" />
                                    Upcoming Appointment
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Date:</span>
                                        <span className="font-semibold text-lg">
                                            {format(parseISO(upcomingAppointment.date), 'EEEE, MMM dd, yyyy')}
                                        </span>
                                    </div>
                                    {upcomingAppointment.time && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Time:</span>
                                            <span className="font-semibold">{upcomingAppointment.time}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Type:</span>
                                        <span className="font-semibold">{upcomingAppointment.type || 'OPD Consultation'}</span>
                                    </div>
                                    {upcomingAppointment.notes && (
                                        <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
                                            <strong>Notes:</strong> {upcomingAppointment.notes}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Missed Appointment */}
                    {missedAppointment && (
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-900">
                                    <CalendarX className="h-5 w-5" />
                                    Missed Appointment
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-red-700">Date:</span>
                                        <span className="font-semibold text-red-900">
                                            {format(parseISO(missedAppointment.date), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-red-700 mt-3">
                                        Please contact the clinic to reschedule your appointment.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!upcomingAppointment && !missedAppointment && (
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-center text-muted-foreground py-8">
                                    No upcoming or recent appointments found.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        );
    }

    // In queue - show position
    return (
        <div className="container mx-auto py-6 max-w-2xl">
            <PageHeader
                title="Queue Status"
                description="Your current position in the OPD queue"
                actions={
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Last updated: {format(lastRefresh, 'h:mm a')}</span>
                    </div>
                }
            />

            <div className="space-y-4 mt-6">
                {isBeingServed ? (
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center py-8">
                                <CheckCircle2 className="h-20 w-20 text-green-600 mb-4 animate-pulse" />
                                <h2 className="text-3xl font-bold text-green-900 mb-2">It's Your Turn!</h2>
                                <p className="text-lg text-green-800">Please proceed to the consultation room</p>
                                <Badge className="mt-4 bg-green-600 text-white px-4 py-2 text-base">
                                    Currently Being Served
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-center text-2xl">Your Position</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center py-6">
                                    <div className="relative">
                                        <div className="text-8xl font-bold text-primary">{myPosition}</div>
                                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-primary/20 rounded-full" />
                                    </div>
                                    <p className="text-xl text-muted-foreground mt-6">
                                        out of {waiting.length} waiting
                                    </p>
                                    {myPosition && myPosition <= 2 && (
                                        <Badge className="mt-4 bg-orange-500 text-white px-4 py-2 text-base animate-pulse">
                                            Your Turn Soon!
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {estimatedTime && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Estimated Consultation Time
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-4">
                                        <p className="text-3xl font-bold text-green-600 mb-2">
                                            Around {estimatedTime.absoluteTime}
                                        </p>
                                        <p className="text-lg text-muted-foreground">
                                            {estimatedTime.relativeTime}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-4">
                                            Based on average {AVG_CONSULTATION_MINUTES} minutes per consultation
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Currently Serving
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-4">
                            {nowServing ? (
                                <p className="text-xl font-semibold text-primary">
                                    Position #{waiting.length > 0 ? (queueEntries.filter(e => e.status === 'waiting' || e.status === 'serving').length - waiting.length) : 1}
                                </p>
                            ) : (
                                <p className="text-muted-foreground">Waiting to start...</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-center pt-4">
                    <Button
                        onClick={handleRefresh}
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh Display
                    </Button>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    Queue updates automatically in real-time • Display refreshes every 5 minutes
                </p>
            </div>
        </div>
    );
}
