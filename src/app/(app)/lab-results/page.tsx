
"use client";

import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, FlaskConical, Microscope, ArrowRight, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data for critical lab results
const criticalResults = [
  { id: 'res1', patientName: 'Priya Sharma', nephroId: '1002/0724', patientId: 'fixed-pd-patient-id-2', testName: 'Potassium', result: '6.2 mmol/L', normalRange: '3.5-5.1', isAcknowledged: false },
  { id: 'res2', patientName: 'Amit Singh', nephroId: '1003/0624', patientId: 'mock-patient-id-3', testName: 'Hemoglobin', result: '9.1 g/dL', normalRange: '13.5-17.5', isAcknowledged: false },
  { id: 'res3', patientName: 'Rajesh Kumar', nephroId: '1001/0724', patientId: 'fixed-pd-patient-id-1', testName: 'eGFR', result: '28 mL/min', normalRange: '>60', isAcknowledged: true },
  { id: 'res4', patientName: 'Priya Sharma', nephroId: '1002/0724', patientId: 'fixed-pd-patient-id-2', testName: 'Urine Alb/Crea Ratio', result: '350 mg/g', normalRange: '<30', isAcknowledged: false },
  { id: 'res5', patientName: 'Sunita Devi', nephroId: '1004/0624', patientId: 'mock-patient-id-4', testName: 'Phosphate', result: '5.8 mg/dL', normalRange: '2.5-4.5', isAcknowledged: false },
];

export default function LabResultsPage() {
  const { toast } = useToast();

  const handleAcknowledge = (resultId: string, patientName: string) => {
    toast({
      title: "Result Acknowledged",
      description: `Critical result for ${patientName} has been acknowledged. (This is a mock action)`,
    });
    // In a real app, you would update the state here.
  };

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Review Critical Lab Results"
        description="Acknowledge critical results and order follow-up tests."
        backHref="/dashboard"
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <FlaskConical className="mr-2 h-5 w-5 text-primary" />
            Pending Review ({criticalResults.filter(r => !r.isAcknowledged).length})
          </CardTitle>
          <CardDescription>
            These critical lab results require your immediate attention.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Normal Range</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criticalResults.map(result => (
                  <TableRow key={result.id} className={result.isAcknowledged ? 'bg-muted/50 text-muted-foreground' : ''}>
                    <TableCell>
                      <Link href={`/patients/${result.patientId}`} className="font-medium text-primary hover:underline">{result.patientName}</Link>
                      <div className="text-xs text-muted-foreground">{result.nephroId}</div>
                    </TableCell>
                    <TableCell>{result.testName}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{result.result}</Badge>
                    </TableCell>
                    <TableCell>{result.normalRange}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" asChild title="View Patient Profile">
                        <Link href={`/patients/${result.patientId}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAcknowledge(result.id, result.patientName)}
                        disabled={result.isAcknowledged}
                        className={result.isAcknowledged ? 'text-green-600' : ''}
                      >
                        <Check className="mr-1 h-4 w-4" /> {result.isAcknowledged ? 'Acked' : 'Ack'}
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/investigations">
                          <Microscope className="mr-1 h-4 w-4" /> Order Follow-up
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
