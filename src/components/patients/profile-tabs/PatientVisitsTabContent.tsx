
"use client";

import type { Patient, Visit } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { usePatientData } from '@/hooks/use-patient-data';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { CreateVisitWizard } from '@/components/visits/create-visit-wizard';
import { format } from 'date-fns';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { CalendarDays } from 'lucide-react';
import { ClinicalVisitDetails } from '@/components/visits/ClinicalVisitDetails';
import { OpinionReportButton } from '@/components/pdf/opinion-report/OpinionReportButton';
import { DischargeSummaryButton } from '@/components/pdf/DischargeSummaryButton';


interface PatientVisitsTabContentProps {
  patient: Patient;
}

export function PatientVisitsTabContent({ patient }: PatientVisitsTabContentProps) {
  const { toast } = useToast();
  const { currentPatient } = usePatientData();
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);

  // We need to get the latest patient data from the hook in case it was updated
  const currentPatientData = currentPatient(patient.id) || patient;
  const visits = [...(currentPatientData?.visits || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleVisitCreated = (patientId: string) => {
    setIsVisitDialogOpen(false);
    const patientName = [patient.firstName, patient.lastName].filter(Boolean).join(' ');
    toast({
      title: "New Visit Created",
      description: `A new visit has been added for ${patientName}.`,
    });
    // The data hook already triggers a re-render, so no need to force one here.
  };

  return (
    <>
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-headline text-xl">Visit History</CardTitle>
              <CardDescription>Chronological record of patient consultations and visits. Click on a visit to see details.</CardDescription>
            </div>
            <Button onClick={() => setIsVisitDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" />Add New Visit</Button>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-4 md:px-6">
          <Accordion type="single" collapsible className="w-full">
            {visits.map(visit => {
              // Safely format date or show fallback
              const visitDate = visit.date ? format(new Date(visit.date), 'PPP') : 'Date not set';

              return (
                <AccordionItem value={visit.id} key={visit.id} className="border-b last:border-b-0 rounded-md mb-2 shadow-sm bg-card">
                  <AccordionTrigger className="hover:bg-muted/50 px-4 py-3 text-left rounded-t-md">
                    <div className="flex items-center gap-4 w-full">
                      <CalendarDays className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-grow">
                        <p className="font-medium">{visitDate} - <span className="font-semibold">{visit.visitType}</span></p>
                        <p className="text-sm text-muted-foreground">Remark: {visit.visitRemark}</p>
                      </div>
                      {/* PDF Download Buttons */}
                      <div className="flex gap-2 ml-auto" onClick={(e) => e.stopPropagation()}>
                        <OpinionReportButton
                          patient={patient}
                          visit={{ ...visit, patientId: patient.id }}
                          variant="outline"
                          size="sm"
                        />
                        <DischargeSummaryButton
                          patient={patient}
                          visit={{ ...visit, patientId: patient.id }}
                          variant="outline"
                          size="sm"
                        />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-0 sm:px-4 pt-2 pb-4 bg-card rounded-b-md">
                    <ClinicalVisitDetails visit={{ ...visit, patientId: patient.id }} patient={patient} />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
            {visits.length === 0 && (
              <Card className="flex items-center justify-center h-32 border-dashed">
                <p className="text-muted-foreground text-center py-4">No visit history recorded.</p>
              </Card>
            )}
          </Accordion>
        </CardContent>
      </Card>

      {patient && (
        <CreateVisitWizard
          isOpen={isVisitDialogOpen}
          onOpenChange={setIsVisitDialogOpen}
          patient={patient}
          onVisitCreated={handleVisitCreated}
        />
      )}
    </>
  );
}
