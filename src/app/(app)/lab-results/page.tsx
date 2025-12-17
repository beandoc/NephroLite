
"use client";

import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, FlaskConical, Microscope, ArrowRight, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePatientData } from '@/hooks/use-patient-data';
import { useMemo, useState } from 'react';
import type { Patient, InvestigationTest } from '@/lib/types';

interface CriticalResult {
  id: string;
  patientName: string;
  patientId: string;
  nephroId: string;
  testName: string;
  result: string;
  normalRange: string;
  isAcknowledged: boolean;
}

// Basic logic to determine if a result is critical. This can be expanded.
const isCritical = (test: InvestigationTest): boolean => {
  if (!test.result || !test.normalRange || test.normalRange === 'N/A') return false;

  const resultValue = parseFloat(test.result);
  if (isNaN(resultValue)) return false; // Not a numeric result

  const rangeMatch = test.normalRange.match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (rangeMatch) {
    const lowerBound = parseFloat(rangeMatch[1]);
    const upperBound = parseFloat(rangeMatch[2]);
    return resultValue < lowerBound || resultValue > upperBound;
  }

  const lowerBoundMatch = test.normalRange.match(/>\s*([\d.]+)/);
  if (lowerBoundMatch) {
    const lowerBound = parseFloat(lowerBoundMatch[1]);
    return resultValue < lowerBound;
  }

  const upperBoundMatch = test.normalRange.match(/<\s*([\d.]+)/);
  if (upperBoundMatch) {
    const upperBound = parseFloat(upperBoundMatch[1]);
    return resultValue > upperBound;
  }

  return false;
};


export default function LabResultsPage() {
  const { toast } = useToast();
  const { patients, isLoading } = usePatientData();
  const [acknowledgedResults, setAcknowledgedResults] = useState<Record<string, boolean>>({});

  const criticalResults: CriticalResult[] = useMemo(() => {
    if (isLoading) return [];

    const allCriticalResults: CriticalResult[] = [];

    patients.forEach(patient => {
      patient.investigationRecords?.forEach(record => {
        record.tests.forEach(test => {
          if (isCritical(test)) {
            allCriticalResults.push({
              id: `${record.id}-${test.id}`,
              patientName: [patient.firstName, patient.lastName].filter(Boolean).join(' '),
              patientId: patient.id,
              nephroId: patient.nephroId,
              testName: test.name,
              result: test.result || 'N/A',
              normalRange: test.normalRange || 'N/A',
              isAcknowledged: acknowledgedResults[`${record.id}-${test.id}`] || false,
            });
          }
        });
      });
    });

    return allCriticalResults.sort((a, b) => (a.isAcknowledged ? 1 : -1) - (b.isAcknowledged ? 1 : -1) || a.patientName.localeCompare(b.patientName));

  }, [patients, isLoading, acknowledgedResults]);


  const handleAcknowledge = (resultId: string, patientName: string) => {
    setAcknowledgedResults(prev => ({ ...prev, [resultId]: true }));
    toast({
      title: "Result Acknowledged",
      description: `Critical result for ${patientName} has been acknowledged. (This is a temporary client-side acknowledgement)`,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-2">
        <PageHeader title="Review Critical Lab Results" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    )
  }

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
            These critical lab results require your immediate attention. This list is generated based on results falling outside their defined normal ranges.
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
                {criticalResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No critical results found at this time.
                    </TableCell>
                  </TableRow>
                ) : (
                  criticalResults.map(result => (
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
