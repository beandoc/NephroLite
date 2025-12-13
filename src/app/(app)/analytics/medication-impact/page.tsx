
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Filter, BarChart3, LineChart as LineChartIcon, Pill, TrendingUp, TrendingDown } from 'lucide-react';
import { SGLT2_INHIBITORS, ARBS, ACE_INHIBITORS, FINERENONE, PATIENT_GROUPS_FOR_ANALYSIS } from '@/lib/constants';
import { useMedicationImpact } from '@/hooks/use-medication-impact';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const MEDICATION_CATEGORIES_CONFIG = [
  { name: "SGLT2 Inhibitors", drugs: SGLT2_INHIBITORS },
  { name: "ARBs & ACE Inhibitors", drugs: [...ARBS, ...ACE_INHIBITORS] },
  { name: "Finerenone", drugs: [FINERENONE] },
];

export default function MedicationImpactPage() {
  const [selectedPatientGroup, setSelectedPatientGroup] = useState<string>("");
  const [selectedMedicationCategory, setSelectedMedicationCategory] = useState<string>("");
  const [selectedSpecificMedication, setSelectedSpecificMedication] = useState<string>("");
  const [specificMedicationOptions, setSpecificMedicationOptions] = useState<string[]>([]);

  const {
    patients,
    eGFRTrend,
    albuminTrend,
    avgEGFRChange,
    avgAlbuminChange,
    isLoading
  } = useMedicationImpact(selectedPatientGroup, selectedSpecificMedication);

  useEffect(() => {
    if (selectedMedicationCategory) {
      const categoryConfig = MEDICATION_CATEGORIES_CONFIG.find(cat => cat.name === selectedMedicationCategory);
      setSpecificMedicationOptions(categoryConfig ? categoryConfig.drugs.sort() : []);
      setSelectedSpecificMedication(""); // Reset specific medication when category changes
    } else {
      setSpecificMedicationOptions([]);
      setSelectedSpecificMedication("");
    }
  }, [selectedMedicationCategory]);

  const canApplyFilters = selectedPatientGroup && selectedMedicationCategory && selectedSpecificMedication;
  const hasData = patients.length > 0;

  // Format trend data for charts
  const eGFRChartData = eGFRTrend.map(point => ({
    date: format(point.date, 'MMM yyyy'),
    'Average eGFR': Math.round(point.value * 10) / 10,
    patients: point.patientCount
  }));

  const albuminChartData = albuminTrend.map(point => ({
    date: format(point.date, 'MMM yyyy'),
    'Protein/Creatinine Ratio': Math.round(point.value * 10) / 10,
    patients: point.patientCount
  }));

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Medication Impact Analysis"
        description="Analyze the effects of key medications on eGFR and Albuminuria for specific patient cohorts."
      />

      <Card className="mb-6 mt-4">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><Filter className="mr-2 h-5 w-5 text-primary" />Analysis Filters</CardTitle>
          <CardDescription>Select criteria to analyze medication impact on lab parameters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="patient-group">Patient Group</Label>
              <Select value={selectedPatientGroup} onValueChange={setSelectedPatientGroup}>
                <SelectTrigger id="patient-group">
                  <SelectValue placeholder="Select Patient Group" />
                </SelectTrigger>
                <SelectContent>
                  {PATIENT_GROUPS_FOR_ANALYSIS.map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="med-category">Medication Category</Label>
              <Select value={selectedMedicationCategory} onValueChange={setSelectedMedicationCategory}>
                <SelectTrigger id="med-category">
                  <SelectValue placeholder="Select Medication Category" />
                </SelectTrigger>
                <SelectContent>
                  {MEDICATION_CATEGORIES_CONFIG.map(cat => (
                    <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="specific-med">Specific Medication</Label>
              <Select value={selectedSpecificMedication} onValueChange={setSelectedSpecificMedication} disabled={!selectedMedicationCategory || specificMedicationOptions.length === 0}>
                <SelectTrigger id="specific-med">
                  <SelectValue placeholder="Select Specific Medication" />
                </SelectTrigger>
                <SelectContent>
                  {specificMedicationOptions.map(med => (
                    <SelectItem key={med} value={med}>{med}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {canApplyFilters && (
            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border">
              <Pill className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium">Analysis Results</p>
                <p className="text-sm text-muted-foreground">
                  {isLoading ? 'Loading...' : `${patients.length} patients on ${selectedSpecificMedication}`}
                </p>
              </div>
              {avgEGFRChange !== null && (
                <div className="flex items-center gap-2">
                  {avgEGFRChange > 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                  <span className={avgEGFRChange > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {avgEGFRChange > 0 ? '+' : ''}{Math.round(avgEGFRChange * 10) / 10} eGFR avg change
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><CardContent className="h-80 pt-6"><Skeleton className="h-full w-full" /></CardContent></Card>
          <Card><CardContent className="h-80 pt-6"><Skeleton className="h-full w-full" /></CardContent></Card>
        </div>
      ) : hasData ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><LineChartIcon className="mr-2 h-5 w-5 text-primary" />eGFR Trend Analysis</CardTitle>
                <CardDescription>Average eGFR before and after medication (n={patients.length})</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={eGFRChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: 'eGFR (mL/min/1.73m²)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Average eGFR" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" />Albuminuria Trend Analysis</CardTitle>
                <CardDescription>Protein/Creatinine ratio before and after medication (n={patients.length})</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={albuminChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: 'P/C Ratio (mg/g)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Protein/Creatinine Ratio" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="font-headline">Patient Data Summary</CardTitle>
              <CardDescription>Individual patient responses to {selectedSpecificMedication}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>NephroID</TableHead>
                    <TableHead>Med Start Date</TableHead>
                    <TableHead className="text-right">eGFR Before</TableHead>
                    <TableHead className="text-right">eGFR After</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">P/C Before</TableHead>
                    <TableHead className="text-right">P/C After</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((data) => (
                    <TableRow key={data.patient.id}>
                      <TableCell className="font-medium">
                        {data.patient.firstName} {data.patient.lastName}
                      </TableCell>
                      <TableCell>{data.patient.nephroId}</TableCell>
                      <TableCell>
                        {data.medicationStartDate ? format(data.medicationStartDate, 'PP') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        {data.eGFRBefore !== null ? data.eGFRBefore.toFixed(1) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {data.eGFRAfter !== null ? data.eGFRAfter.toFixed(1) : '-'}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${data.changeInEGFR && data.changeInEGFR > 0 ? 'text-green-600' : data.changeInEGFR && data.changeInEGFR < 0 ? 'text-red-600' : ''}`}>
                        {data.changeInEGFR !== null ? (data.changeInEGFR > 0 ? '+' : '') + data.changeInEGFR.toFixed(1) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {data.albuminBefore !== null ? data.albuminBefore.toFixed(1) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {data.albuminAfter !== null ? data.albuminAfter.toFixed(1) : '-'}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${data.changeInAlbumin && data.changeInAlbumin < 0 ? 'text-green-600' : data.changeInAlbumin && data.changeInAlbumin > 0 ? 'text-red-600' : ''}`}>
                        {data.changeInAlbumin !== null ? (data.changeInAlbumin > 0 ? '+' : '') + data.changeInAlbumin.toFixed(1) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : canApplyFilters ? (
        <Card>
          <CardContent className="h-64 flex flex-col items-center justify-center text-center">
            <Pill className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Data Available</p>
            <p className="text-muted-foreground mt-2">
              No patients found in the selected group on {selectedSpecificMedication}.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different patient group or medication.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="h-64 flex flex-col items-center justify-center text-center">
            <Filter className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Select Filters to Begin</p>
            <p className="text-muted-foreground mt-2">
              Choose a patient group, medication category, and specific medication to analyze.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
