
"use client";

import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserCircleIcon, Hospital, LogOut, MapPin, ShieldCheck, CalendarDays, MessageSquare, Info, Droplet, User, CheckCircle, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { usePatientData } from '@/hooks/use-patient-data';

interface DemographicsCardProps {
  patient: Patient;
  onUpdate: () => void;
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

export function DemographicsCard({ patient, onUpdate }: DemographicsCardProps) {
  const { toast } = useToast();
  const { admitPatient, dischargePatient } = usePatientData();

  const handleAdmitPatient = () => {
    admitPatient(patient.id);
    onUpdate(); // Notify parent to refresh data
    toast({ title: "Patient Admitted", description: `${patient.name} is now marked as IPD.` });
  };

  const handleDischargePatient = () => {
    dischargePatient(patient.id);
    onUpdate(); // Notify parent to refresh data
    toast({ title: "Patient Discharged", description: `${patient.name} has been discharged.` });
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-muted/30 flex flex-row items-center justify-between">
        <CardTitle className="font-headline text-xl flex items-center">
          <UserCircleIcon className="w-6 h-6 mr-3 text-primary"/>Demographic Information
        </CardTitle>
        <div className="flex items-center gap-2">
          {(patient.patientStatus === 'OPD' || patient.patientStatus === 'Discharged') && (
            <Button onClick={handleAdmitPatient} size="sm" variant="outline">
              <Hospital className="mr-2 h-4 w-4" /> Admit Patient
            </Button>
          )}
          {patient.patientStatus === 'IPD' && (
            <Button onClick={handleDischargePatient} size="sm" variant="outline">
              <LogOut className="mr-2 h-4 w-4" /> Discharge Patient
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DetailItem label="Full Name" value={patient.name} />
        <DetailItem label="Nephro ID" value={patient.nephroId} />
        <div className="flex items-center">
          <DetailItem label="Patient Status" value={patient.patientStatus} className="mr-2"/>
          {patient.patientStatus === 'IPD' && <Badge variant="destructive">IPD</Badge>}
          {patient.patientStatus === 'OPD' && <Badge variant="secondary">OPD</Badge>}
          {patient.patientStatus === 'Discharged' && <Badge variant="outline">Discharged</Badge>}
        </div>
        <DetailItem label="Date of Birth" value={patient.dob ? format(parseISO(patient.dob), 'PPP') : 'N/A'} />
        <DetailItem label="Age" value={patient.dob ? `${new Date().getFullYear() - parseISO(patient.dob).getFullYear()} years` : 'N/A'} />
        <DetailItem label="Gender" value={patient.gender} />
        <DetailItem label="Contact Number" value={patient.contact} />
        <DetailItem label="Email Address" value={patient.email} />
        <DetailItem label="WhatsApp Number" value={patient.clinicalProfile.whatsappNumber} icon={MessageSquare}/>
        <DetailItem label="Aabha Number" value={patient.clinicalProfile.aabhaNumber} icon={Info}/>
        <DetailItem label="Blood Group" value={patient.clinicalProfile.bloodGroup} icon={Droplet}/>
        <DetailItem label="Registration Date" value={patient.registrationDate ? format(parseISO(patient.registrationDate), 'PPP') : 'N/A'} />
        <DetailItem label="Next Appointment" value={patient.nextAppointmentDate ? format(parseISO(patient.nextAppointmentDate), 'PPP') : 'N/A'} icon={CalendarDays}/>
        <DetailItem label="Tracked Patient" value={patient.isTracked ? 'Yes' : 'No'} icon={patient.isTracked ? CheckCircle : XCircle} />
      </CardContent>
    </Card>
  );
}
