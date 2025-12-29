"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Clock, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-provider';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, addDays, isWeekend } from 'date-fns';

interface AppointmentRequestDialogProps {
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

const APPOINTMENT_TYPES = [
    'Follow-up Consultation',
    'New Issue',
    'Lab Review',
    'Prescription Refill',
    'PD Training',
    'Other'
];

export function AppointmentRequestDialog({ trigger, onSuccess }: AppointmentRequestDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form state
    const [requestedDate, setRequestedDate] = useState('');
    const [timePreference, setTimePreference] = useState('');
    const [appointmentType, setAppointmentType] = useState('');
    const [reason, setReason] = useState('');

    // Get minimum date (tomorrow, skip weekends)
    const getMinDate = () => {
        let minDate = addDays(new Date(), 1);
        while (isWeekend(minDate)) {
            minDate = addDays(minDate, 1);
        }
        return format(minDate, 'yyyy-MM-dd');
    };

    const handleSubmit = async () => {
        // Validation
        if (!requestedDate || !timePreference || !appointmentType || !reason.trim()) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }

        // Check if weekend
        const selectedDate = new Date(requestedDate);
        if (isWeekend(selectedDate)) {
            toast({
                title: "Invalid Date",
                description: "Please select a working day (Monday-Friday)",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);

            await addDoc(collection(db, 'appointmentRequests'), {
                patientId: user?.patientId,
                patientName: user?.displayName || 'Patient',
                patientNephroId: user?.nephroId || 'N/A',
                patientEmail: user?.email,
                requestedDate,
                timePreference,
                appointmentType,
                reason: reason.trim(),
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            toast({
                title: "Request Submitted!",
                description: "Your appointment request has been sent to the doctor. You'll be notified once it's reviewed.",
            });

            // Reset form
            setRequestedDate('');
            setTimePreference('');
            setAppointmentType('');
            setReason('');
            setOpen(false);

            onSuccess?.();
        } catch (error) {
            console.error('Error submitting appointment request:', error);
            toast({
                title: "Submission Failed",
                description: "Could not submit your request. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="w-full">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Request Appointment
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Request Appointment</DialogTitle>
                    <DialogDescription>
                        Submit a request for an appointment. The doctor will review and confirm your preferred time.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Preferred Date */}
                    <div className="space-y-2">
                        <Label htmlFor="date" className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                            Preferred Date *
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            min={getMinDate()}
                            value={requestedDate}
                            onChange={(e) => setRequestedDate(e.target.value)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Working days only (Mon-Fri)
                        </p>
                    </div>

                    {/* Time Preference */}
                    <div className="space-y-2">
                        <Label className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-green-500" />
                            Time Preference *
                        </Label>
                        <Select value={timePreference} onValueChange={setTimePreference}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select preferred time" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="morning">Morning (9:00 AM - 12:00 PM)</SelectItem>
                                <SelectItem value="afternoon">Afternoon (2:00 PM - 5:00 PM)</SelectItem>
                                <SelectItem value="evening">Evening (5:00 PM - 7:00 PM)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Appointment Type */}
                    <div className="space-y-2">
                        <Label className="flex items-center">
                            <FileText className="mr-2 h-4 w-4 text-purple-500" />
                            Appointment Type *
                        </Label>
                        <Select value={appointmentType} onValueChange={setAppointmentType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select appointment type" />
                            </SelectTrigger>
                            <SelectContent>
                                {APPOINTMENT_TYPES.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">
                            Reason for Visit *
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder="Please describe the reason for your appointment request..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            This helps the doctor prepare for your consultation
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
