
"use client";

import type { Patient, Vaccination } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stethoscope, ShieldQuestion, Leaf, Accessibility, Cigarette, Wine, ShieldAlert, PencilLine, TagsIcon, Syringe, HeartPulse, CheckCircle, XCircle, HelpingHand, CalendarClock, AlertCircle, PlusCircle } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { usePatientData } from '@/hooks/use-patient-data';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getDefaultVaccinations } from '@/lib/data-helpers';

interface ClinicalProfileCardProps {
  patient: Patient;
}

const DetailItem = ({ label, value, icon: Icon, className }: { label: string; value?: React.ReactNode | null; icon?: React.ElementType, className?: string }) => (
  <div className={className}>
    <h3 className="text-sm font-medium text-muted-foreground flex items-center">
      {Icon && <Icon className="w-4 h-4 mr-2 text-primary" />}
      {label}
    </h3>
    <div className="text-base pt-1">{value || 'N/A'}</div>
  </div>
);

const POMRDisplay = ({ pomrText }: { pomrText?: string }) => {
  if (!pomrText) return <p className="text-base text-muted-foreground italic">No POMR recorded.</p>;
  
  const paragraphs = pomrText.split('\n').map((para, index) => (
    <p key={index} className="mb-1 last:mb-0">{para}</p>
  ));

  return <div className="text-base prose prose-sm max-w-none">{paragraphs}</div>;
};

const getVaccineStatus = (vaccine: Vaccination) => {
    if (!vaccine.doses) return { text: 'Unknown', color: 'bg-muted-foreground', icon: AlertCircle };
    const administeredDoses = vaccine.doses.filter(d => d.administered).length;
    if(administeredDoses === vaccine.totalDoses) {
        return { text: 'Completed', color: 'bg-green-600', icon: CheckCircle };
    }
    if (vaccine.nextDoseDate && isPast(parseISO(vaccine.nextDoseDate))) {
         return { text: 'Overdue', color: 'bg-destructive', icon: AlertCircle };
    }
    if (administeredDoses > 0) {
        return { text: 'In Progress', color: 'bg-amber-500', icon: CalendarClock };
    }
    return { text: 'Pending', color: 'bg-muted-foreground', icon: CalendarClock };
}


export function ClinicalProfileCard({ patient }: ClinicalProfileCardProps) {
  const { clinicalProfile } = patient;
  const { updateClinicalProfile } = usePatientData();
  const { toast } = useToast();

  const handleRiskFactorToggle = (factor: 'hasDiabetes' | 'onAntiHypertensiveMedication' | 'onLipidLoweringMedication', value: boolean) => {
    const updatedProfile = {
      ...clinicalProfile,
      [factor]: value,
    };
    updateClinicalProfile(patient.id, updatedProfile);
    toast({
        title: "Risk Factor Updated",
        description: `Patient's ${factor.replace(/([A-Z])/g, ' $1').toLowerCase()} status has been updated.`,
    });
  };
  
  const handleInitializeVaccinations = () => {
    const defaultVaccinations = getDefaultVaccinations();
    const updatedProfile = {
        ...clinicalProfile,
        vaccinations: defaultVaccinations,
    };
    updateClinicalProfile(patient.id, updatedProfile);
    toast({
        title: "Vaccination Schedule Initialized",
        description: "You can now edit the patient's vaccination records.",
    });
  };

  return (
    <>
      <Card className="shadow-md">
        <CardHeader className="bg-muted/30">
          <CardTitle className="font-headline text-xl flex items-center"><HeartPulse className="w-6 h-6 mr-3 text-primary"/>Clinical Profile</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
            <DetailItem label="Primary Diagnosis" icon={Stethoscope} value={clinicalProfile.primaryDiagnosis} />
            <DetailItem label="Subspeciality Follow-up" icon={ShieldQuestion} value={clinicalProfile.subspecialityFollowUp || 'NIL'} />
            <DetailItem label="Nutritional Status" icon={Leaf} value={clinicalProfile.nutritionalStatus} />
            <DetailItem label="Disability Profile" icon={Accessibility} value={clinicalProfile.disability} />
            <DetailItem label="Smoking Status" icon={Cigarette} value={clinicalProfile.smokingStatus || 'NIL'} />
            <DetailItem label="Alcohol Consumption" icon={Wine} value={clinicalProfile.alcoholConsumption || 'NIL'} />
            <DetailItem label="Drug Allergies" value={clinicalProfile.drugAllergies || "None reported"} icon={ShieldAlert} className="md:col-span-2 lg:col-span-1"/>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-1">
              <TagsIcon className="w-4 h-4 mr-2 text-primary" />
              Clinical Tags
            </h3>
            {clinicalProfile.tags && clinicalProfile.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {clinicalProfile.tags.map((tag, index) => <Badge key={index} variant="outline">{tag}</Badge>)}
              </div>
            ) : <p className="text-base text-muted-foreground italic">None</p>}
          </div>
          
          <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-1">
              <PencilLine className="w-4 h-4 mr-2 text-primary" />
              Problem Oriented Medical Record (POMR)
            </h3>
            <POMRDisplay pomrText={clinicalProfile.pomr} />
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader className="bg-muted/30">
            <CardTitle className="font-headline text-xl flex items-center"><HelpingHand className="w-6 h-6 mr-3 text-primary"/>Cardiovascular Risk Factors</CardTitle>
            <CardDescription>Key factors for the PREVENT cardiovascular risk score calculation. Changes are saved instantly.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
            <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label htmlFor="hasDiabetes-switch" className="font-medium">Diabetes Status</Label>
                <Switch id="hasDiabetes-switch" checked={clinicalProfile.hasDiabetes} onCheckedChange={(value) => handleRiskFactorToggle('hasDiabetes', value)} />
            </div>
             <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label htmlFor="onAntiHypertensiveMedication-switch" className="font-medium">On Anti-Hypertensive Meds</Label>
                <Switch id="onAntiHypertensiveMedication-switch" checked={clinicalProfile.onAntiHypertensiveMedication} onCheckedChange={(value) => handleRiskFactorToggle('onAntiHypertensiveMedication', value)} />
            </div>
             <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label htmlFor="onLipidLoweringMedication-switch" className="font-medium">On Lipid-Lowering Meds</Label>
                <Switch id="onLipidLoweringMedication-switch" checked={clinicalProfile.onLipidLoweringMedication} onCheckedChange={(value) => handleRiskFactorToggle('onLipidLoweringMedication', value)} />
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="bg-muted/30">
          <CardTitle className="font-headline text-xl flex items-center"><Syringe className="w-6 h-6 mr-3 text-primary"/>Vaccination Status</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {(clinicalProfile.vaccinations && clinicalProfile.vaccinations.length > 0) ? (
            clinicalProfile.vaccinations.map((vaccine) => {
              const doses = vaccine.doses || [];
              const administeredDoses = doses.filter(d => d.administered).length;
              const status = getVaccineStatus(vaccine);
              return (
                <div key={vaccine.name} className="p-4 border rounded-lg space-y-2 bg-muted/20">
                    <div className="flex justify-between items-start">
                        <h4 className="font-semibold">{vaccine.name}</h4>
                        <Badge variant="secondary" className={`${status.color} text-primary-foreground`}>
                            <status.icon className="w-3 h-3 mr-1.5"/>{status.text}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {administeredDoses} of {vaccine.totalDoses} dose(s) administered.
                    </p>
                    <ul className="text-xs list-disc pl-5 space-y-1">
                        {doses.map(dose => (
                            <li key={dose.id}>
                                Dose {dose.doseNumber}: {dose.administered && dose.date ? `Given on ${format(parseISO(dose.date), 'PPP')}` : 'Pending'}
                            </li>
                        ))}
                    </ul>
                    {vaccine.nextDoseDate && <p className="text-xs text-primary font-medium mt-1">Next Dose Due: {format(parseISO(vaccine.nextDoseDate), 'PPP')}</p>}
                </div>
              )
            })
          ) : (
            <div className="text-muted-foreground text-center py-4 md:col-span-2">
                <p>No vaccination data recorded for this patient.</p>
                <Button variant="link" onClick={handleInitializeVaccinations} className="mt-2">
                    <PlusCircle className="mr-2 h-4 w-4"/>Initialize Vaccination Schedule
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
