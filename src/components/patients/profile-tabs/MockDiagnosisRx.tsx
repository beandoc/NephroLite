
// This file is being replaced by PatientDiagnosisRx.tsx and will be removed.
// The new file contains the real implementation for saving diagnosis and medication data.
// Keeping this file to avoid breaking imports during the transition, but it is now obsolete.
"use client";

import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Pill, PlusCircle } from "lucide-react";

interface MockDiagnosisRxProps {
    patientId: string;
}

export const MockDiagnosisRx = ({ patientId }: MockDiagnosisRxProps) => {
  const { toast } = useToast();
   const history = [
    { id: 'd1', date: '2024-01-20', diagnosis: 'Chronic Kidney Disease Stage 3a', medication: 'Telmisartan 40mg OD, Atorvastatin 10mg OD', doctor: 'Dr. Anya Sharma' },
    { id: 'd2', date: '2023-07-15', diagnosis: 'Hypertension', medication: 'Amlodipine 5mg OD (discontinued)', doctor: 'Dr. Vikram Singh' },
  ];

  const handleAddNew = (type: string) => {
    toast({ title: "Feature Under Development", description: `Adding new ${type} will be available soon.` });
  };

  return (
    <>
      <div className="flex justify-end gap-2 mb-4">
        <Button onClick={() => handleAddNew('Diagnosis')} variant="outline"><PlusCircle className="mr-2 h-4 w-4"/>Add New Diagnosis</Button>
        <Button onClick={() => handleAddNew('Medication')}><PlusCircle className="mr-2 h-4 w-4"/>Add New Medication</Button>
      </div>
      <div className="space-y-4">
        {history.map(item => (
          <Card key={item.id} className="shadow-sm">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-md font-semibold flex items-center"><Stethoscope className="w-5 h-5 mr-2 text-primary"/>{item.diagnosis}</CardTitle>
              <CardDescription>{format(new Date(item.date), 'PPP')} - Diagnosed by {item.doctor}</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm font-medium flex items-center text-muted-foreground"><Pill className="w-4 h-4 mr-2 text-primary"/>Medication:</p>
              <p className="text-sm text-foreground pl-6">{item.medication}</p>
            </CardContent>
          </Card>
        ))}
        {history.length === 0 && (
         <Card className="flex items-center justify-center h-32 border-dashed">
            <p className="text-muted-foreground text-center py-4">No diagnosis or medication history found.</p>
          </Card>
        )}
      </div>
    </>
  );
};
