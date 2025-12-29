"use client";

import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Stethoscope, Pill } from "lucide-react";
import type { Patient } from "@/lib/types";
import { usePatientData } from "@/hooks/use-patient-data";

interface PatientDiagnosisRxProps {
  patient: Patient;
}

export const PatientDiagnosisRx = ({ patient: initialPatient }: PatientDiagnosisRxProps) => {
  const { currentPatient } = usePatientData();

  // Get the most up-to-date patient data
  const patient = currentPatient(initialPatient.id) || initialPatient;

  // Flatten and sort the history from all visits
  const history = (patient.visits || [])
    // Filter visits that have diagnosis OR medication OR advice
    .filter(visit => (visit.diagnoses && visit.diagnoses.length > 0) || (visit.clinicalData?.medications && visit.clinicalData.medications.length > 0) || (visit.clinicalData?.treatmentAdvised && visit.clinicalData.treatmentAdvised !== ''))
    .map(visit => {
      let medicationText = "No medication prescribed";

      // Prefer structured medication
      if (visit.clinicalData?.medications && visit.clinicalData.medications.length > 0) {
        medicationText = visit.clinicalData.medications.map(m => `${m.name} ${m.dosage || ''} ${m.frequency || ''}`.trim()).join(', ');
      }
      // Fallback to unstructured advice/HTML for imported users
      else if (visit.clinicalData?.treatmentAdvised) {
        // Simple regex to strip HTML tags for cleaner display, or we could use dangerouslySetInnerHTML if strict is needed
        // For now, let's keep it simple and just show the content, maybe stripping <p> tags
        medicationText = visit.clinicalData.treatmentAdvised.replace(/<[^>]*>?/gm, ' ').replace(/\s\s+/g, ' ').trim();
      }

      return {
        id: visit.id,
        date: visit.date,
        diagnosis: visit.diagnoses && visit.diagnoses.length > 0 ? visit.diagnoses[0].name : "N/A", // Display first diagnosis
        medication: medicationText,
        doctor: 'Dr. Sachin' // Placeholder
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


  return (
    <div className="space-y-4">
      {history.map(item => (
        <div key={item.id}>
          <Card className="shadow-sm">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-md font-semibold flex items-center"><Stethoscope className="w-5 h-5 mr-2 text-primary" />{item.diagnosis}</CardTitle>
              <CardDescription>{format(parseISO(item.date), 'PPP')} - Visit with {item.doctor}</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm font-medium flex items-center text-muted-foreground"><Pill className="w-4 h-4 mr-2 text-primary" />Medication:</p>
              <p className="text-sm text-foreground pl-6">{item.medication}</p>
            </CardContent>
          </Card>
        </div>
      ))}
      {history.length === 0 && (
        <Card className="flex items-center justify-center h-32 border-dashed">
          <p className="text-muted-foreground text-center py-4">No diagnosis or medication history found. <br />
            <span className="text-sm">Add diagnoses and medications through the Visit History tab.</span>
          </p>
        </Card>
      )}
    </div>
  );
};
