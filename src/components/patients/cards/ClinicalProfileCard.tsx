
"use client";

import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, ShieldQuestion, Leaf, Accessibility, Cigarette, Wine, ShieldAlert, PencilLine, TagsIcon, Syringe, HeartPulse } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ClinicalProfileCardProps {
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

const POMRDisplay = ({ pomrText }: { pomrText?: string }) => {
  if (!pomrText) return <p className="text-base text-muted-foreground italic">No POMR recorded.</p>;
  
  const paragraphs = pomrText.split('\n').map((para, index) => (
    <p key={index} className="mb-1 last:mb-0">{para}</p>
  ));

  return <div className="text-base prose prose-sm max-w-none">{paragraphs}</div>;
};

export function ClinicalProfileCard({ patient }: ClinicalProfileCardProps) {
  const { clinicalProfile } = patient;

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
          <CardTitle className="font-headline text-xl flex items-center"><Syringe className="w-6 h-6 mr-3 text-primary"/>Vaccination Status</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-3">
          {(clinicalProfile.vaccinations && clinicalProfile.vaccinations.length > 0) ? (
            clinicalProfile.vaccinations.map((vaccination, index) => (
              <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border-b last:border-b-0 rounded-md bg-muted/20">
                <span className="font-medium mb-1 sm:mb-0">{vaccination.name}</span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                  {vaccination.administered ? (
                    <>
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700 whitespace-nowrap">
                        Administered {vaccination.date && `on ${format(parseISO(vaccination.date), 'PPP')}`}
                      </Badge>
                      {vaccination.nextDoseDate && (
                        <Badge variant="outline" className="whitespace-nowrap">
                          Next Dose: {format(parseISO(vaccination.nextDoseDate), 'PPP')}
                        </Badge>
                      )}
                    </>
                  ) : (
                    <Badge variant="destructive" className="whitespace-nowrap">Not Administered</Badge>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">No vaccination data recorded.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
