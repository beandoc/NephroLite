
"use client";

import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserCircleIcon, Hospital, LogOut, MapPin, ShieldCheck, CalendarDays, MessageSquare, Info, Droplet, User, CheckCircle, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { usePatientData } from '@/hooks/use-patient-data';
import { admitPatient, dischargePatient } from '@/lib/firestore-helpers';
import { useAuth } from '@/context/auth-provider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAppointmentData } from '@/hooks/use-appointment-data';
import { useMemo } from 'react';

interface DemographicsCardProps {
  patient: Patient;
}

const DetailItem = ({ label, value, icon: Icon, className }: { label: string; value?: string | null; icon?: React.ElementType, className?: string }) => (
  <div className={className}>
    <h3 className="text-sm font-medium text-muted-foreground flex items-center">
      {Icon && <Icon className="w-4 h-4 mr-2 text-primary" />}
      {label}
    </h3>
    <p className="text-base">{value || 'N/A'}</p>
  </div>
);

export function DemographicsCard({ patient }: DemographicsCardProps) {
  const { toast } = useToast();
  const { updatePatient } = usePatientData();
  const { appointments } = useAppointmentData();
  const { user } = useAuth();

  const patientFullName = [patient.firstName, patient.lastName].filter(Boolean).join(' ');

  const handleAdmitPatient = async () => {
    if (!user) return;

    try {
      await admitPatient(user.uid, patient.id);
      toast({
        title: "Patient Admitted",
        description: `${patientFullName} admitted on ${format(new Date(), 'PPP')}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to admit patient",
        variant: "destructive"
      });
    }
  };

  const handleDischargePatient = async () => {
    if (!user) return;

    try {
      await dischargePatient(user.uid, patient.id);
      toast({
        title: "Patient Discharged",
        description: `${patientFullName} discharged on ${format(new Date(), 'PPP')}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to discharge patient",
        variant: "destructive"
      });
    }
  };

  const handleTrackingToggle = (isToggled: boolean) => {
    updatePatient(patient.id, { isTracked: isToggled });
    toast({
      title: `Patient Tracking ${isToggled ? 'Enabled' : 'Disabled'}`,
      description: `${patientFullName}'s tracking status has been updated.`
    });
  }

  const nextAppointment = useMemo(() => {
    return appointments
      .filter(a => a.patientId === patient.id && a.status === 'Scheduled' && parseISO(a.date) >= new Date())
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())[0];
  }, [appointments, patient.id]);


  return (
    <Card className="shadow-md">
      <CardHeader className="bg-muted/30 flex flex-row items-center justify-between">
        <CardTitle className="font-headline text-xl flex items-center">
          <UserCircleIcon className="w-6 h-6 mr-3 text-primary" />Demographic Information
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button onClick={handleAdmitPatient} size="sm" variant="outline" disabled={patient.patientStatus === 'IPD'}>
            <Hospital className="mr-2 h-4 w-4" /> Admit
          </Button>
          <Button onClick={handleDischargePatient} size="sm" variant="outline" disabled={patient.patientStatus !== 'IPD'}>
            <LogOut className="mr-2 h-4 w-4" /> Discharge
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DetailItem label="Full Name" value={patientFullName} />
        <DetailItem label="Nephro ID" value={patient.nephroId} />
        <div className="flex items-center">
          <DetailItem label="Patient Status" value={patient.patientStatus} className="mr-2" />
          {patient.patientStatus === 'IPD' && <Badge variant="destructive">IPD</Badge>}
          {patient.patientStatus === 'OPD' && <Badge variant="secondary">OPD</Badge>}
          {patient.patientStatus === 'Discharged' && <Badge variant="outline">Discharged</Badge>}
        </div>
        <DetailItem label="Date of Birth" value={patient.dob ? format(parseISO(patient.dob), 'PPP') : 'N/A'} />
        <DetailItem label="Age" value={patient.dob ? `${new Date().getFullYear() - new Date(patient.dob).getFullYear()} years` : 'N/A'} />
        <DetailItem label="Gender" value={patient.gender} />
        <DetailItem label="Contact Number" value={patient.contact} />
        <DetailItem label="Email Address" value={patient.email} />
        <DetailItem label="WhatsApp Number" value={patient.clinicalProfile.whatsappNumber} icon={MessageSquare} />
        <DetailItem label="Aabha Number" value={patient.clinicalProfile.aabhaNumber} icon={Info} />
        <DetailItem label="Blood Group" value={patient.clinicalProfile.bloodGroup} icon={Droplet} />
        <DetailItem label="Registration Date" value={patient.registrationDate ? format(parseISO(patient.registrationDate), 'PPP') : 'N/A'} />
        {patient.admissionDate && (
          <DetailItem
            label="Admission Date"
            value={format(parseISO(patient.admissionDate), 'PPP p')}
            icon={Hospital}
          />
        )}
        {patient.dischargeDate && patient.patientStatus !== 'IPD' && (
          <DetailItem
            label="Last Discharge Date"
            value={format(parseISO(patient.dischargeDate), 'PPP p')}
            icon={LogOut}
          />
        )}
        <DetailItem label="Next Appointment" value={nextAppointment ? `${format(parseISO(nextAppointment.date), 'PPP')} at ${nextAppointment.time}` : 'N/A'} icon={CalendarDays} />
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="patient-tracking-switch" className="text-sm font-medium text-muted-foreground flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-primary" /> Tracked Patient
          </Label>
          <div className="flex items-center space-x-2">
            <Switch id="patient-tracking-switch" checked={patient.isTracked} onCheckedChange={handleTrackingToggle} />
            <span className="text-sm">{patient.isTracked ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
