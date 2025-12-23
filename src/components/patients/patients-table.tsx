
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Patient } from "@/lib/types";
import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { usePatientData } from "@/hooks/use-patient-data";

interface PatientsTableProps {
  patients: Patient[];
}

export function PatientsTable({ patients }: PatientsTableProps) {
  const { toast } = useToast();
  const { deletePatient } = usePatientData();

  const handleDelete = async (patientId: string, patientName: string) => {
    if (!patientId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to delete patient: Invalid patient ID.",
      });
      return;
    }

    try {
      await deletePatient(patientId);
      toast({
        title: "Patient Deleted",
        description: `${patientName} has been removed from the records.`,
      });
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "An error occurred while deleting the patient.",
      });
    }
  };

  if (patients.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No patients found. Add a new patient or clear filters to get started.</p>;
  }

  return (
    <div className="rounded-md border shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[100px]">Nephro ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Primary Diagnosis</TableHead>
            <TableHead className="text-right w-[200px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => {
            const patientFullName = [patient.firstName, patient.lastName].filter(Boolean).join(' ');
            return (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.nephroId}</TableCell>
                <TableCell>{patientFullName}</TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>
                  <Badge
                    variant={patient.patientStatus === 'IPD' ? 'destructive' : 'secondary'}
                    className={patient.patientStatus === 'Discharged' ? 'opacity-70' : ''}
                  >
                    {patient.patientStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{patient.clinicalProfile?.primaryDiagnosis || 'N/A'}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild title="View Profile">
                    <Link href={`/patients/${patient.id}`}><Eye className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild title="Edit Patient">
                    <Link href={`/patients/${patient.id}/edit`}><Edit className="h-4 w-4" /></Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" title="Delete Patient" className="text-destructive hover:text-destructive/90">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete patient <span className="font-semibold">{patientFullName} ({patient.nephroId})</span> and all associated data, including appointments.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(patient.id, patientFullName)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
