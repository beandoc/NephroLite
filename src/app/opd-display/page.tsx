
"use client";

import { useState } from 'react';
import { useAppointmentData } from '@/hooks/use-appointment-data';
import { isToday, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, CircleUserRound } from 'lucide-react';
import { usePatientData } from '@/hooks/use-patient-data';
import { useRouter } from 'next/navigation';

export default function OpdLoginPage() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { appointments, isLoading: appointmentsLoading } = useAppointmentData();
  const { patients, isLoading: patientsLoading } = usePatientData();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const patientWithMobile = patients.find(p => p.phoneNumber === mobileNumber);
    if (!patientWithMobile) {
      toast({
        title: "Patient Not Found",
        description: "No patient record found with this mobile number.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const todaysAppointment = appointments.find(app =>
      app.patientId === patientWithMobile.id && isToday(parseISO(app.date))
    );

    if (!todaysAppointment) {
      toast({
        title: "No Appointment Today",
        description: "No appointment found for you today. Please check at the reception.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const patientFullName = [patientWithMobile.firstName, patientWithMobile.lastName].filter(Boolean).join(' ');
    toast({
      title: "Login Successful",
      description: `Welcome, ${patientFullName}. Your status page will open.`,
    });

    router.push(`/opd-display/status/${todaysAppointment.id}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CircleUserRound className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-bold text-primary">Patient Queue Status</CardTitle>
          <CardDescription>Enter your registered mobile number to view your queue details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">10-Digit Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="e.g., 9876543210"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                className="text-lg h-12 text-center tracking-widest"
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={isLoading || appointmentsLoading || patientsLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              View My Queue Status
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
