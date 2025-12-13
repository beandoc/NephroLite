"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClipboardList, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { PatientQueueStatus } from '@/components/patient/patient-queue-status';

export default function CheckInPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [appointmentType, setAppointmentType] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [checkedIn, setCheckedIn] = useState(false);
    const [queueNumber, setQueueNumber] = useState<number | null>(null);

    const appointmentTypes = [
        'Routine Follow-up',
        'Dialysis Session',
        'Consultation',
        'Investigation',
        'Emergency',
    ];

    const handleCheckIn = async () => {
        if (!appointmentType) {
            toast({
                title: "Error",
                description: "Please select appointment type",
                variant: "destructive",
            });
            return;
        }

        if (!user?.patientId) {
            toast({
                title: "Error",
                description: "Patient information not found",
                variant: "destructive",
            });
            return;
        }

        try {
            setSubmitting(true);

            const today = new Date().toISOString().split('T')[0];
            const queueRef = collection(db, `opdQueue/${today}/patients`);

            const docRef = await addDoc(queueRef, {
                patientId: user.patientId,
                patientName: user.displayName,
                nephroId: user.nephroId,
                appointmentType: appointmentType,
                checkInTime: serverTimestamp(),
                status: 'waiting',
                checkedInBy: 'patient',
            });

            // Simulate queue number (in real app, get from Firestore)
            const randomQueue = Math.floor(Math.random() * 20) + 1;
            setQueueNumber(randomQueue);
            setCheckedIn(true);

            toast({
                title: "Check-in Successful!",
                description: `You've been added to the queue. Please wait for your turn.`,
            });
        } catch (error) {
            console.error('Check-in error:', error);
            toast({
                title: "Check-in Failed",
                description: "Unable to check-in. Please try again or contact reception.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (checkedIn) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <Card className="border-green-200 bg-green-50">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
                            <CheckCircle className="h-10 w-10 text-white" />
                        </div>
                        <CardTitle className="text-2xl text-green-900">
                            Check-in Successful!
                        </CardTitle>
                        <CardDescription className="text-green-700">
                            You have been added to the OPD queue
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Live Queue Status Widget */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <PatientQueueStatus />
                        </div>

                        <Button onClick={() => {
                            setCheckedIn(false);
                            setAppointmentType('');
                            setQueueNumber(null);
                        }} variant="outline" className="w-full">
                            Check in another patient
                        </Button>

                        <Button onClick={() => window.location.href = '/patient/dashboard'} className="w-full bg-green-600 hover:bg-green-700 text-white">
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center">
                    <ClipboardList className="mr-3 h-8 w-8 text-green-500" />
                    OPD Check-In
                </h1>
                <p className="text-muted-foreground mt-1">
                    Join the queue for your appointment today
                </p>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                    Check-in early to reduce your waiting time. You'll receive a queue number after check-in.
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle>Check-In Details</CardTitle>
                    <CardDescription>
                        Please provide your appointment information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Patient Name:</span>
                            <span className="font-medium">
                                {user?.displayName && user.displayName !== 'undefined undefined' ? user.displayName : 'Patient'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Nephro ID:</span>
                            <span className="font-medium font-mono text-green-700">
                                {user?.nephroId || 'Pending'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-medium">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="appointment-type">Appointment Type *</Label>
                        <Select value={appointmentType} onValueChange={setAppointmentType}>
                            <SelectTrigger id="appointment-type">
                                <SelectValue placeholder="Select appointment type" />
                            </SelectTrigger>
                            <SelectContent>
                                {appointmentTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                            After check-in, please proceed to the waiting area. You'll be called by your queue number.
                        </AlertDescription>
                    </Alert>

                    <Button
                        onClick={handleCheckIn}
                        disabled={submitting || !appointmentType}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="lg"
                    >
                        {submitting ? 'Checking In...' : 'Check In Now'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{children}</span>;
}
