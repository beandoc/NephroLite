
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Filter, BarChart3, LineChart as LineChartIcon, Pill } from 'lucide-react';
import { SGLT2_INHIBITORS, ARBS, ACE_INHIBITORS, FINERENONE, PATIENT_GROUPS_FOR_ANALYSIS } from '@/lib/constants';

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

  const handleApplyFilters = () => {
    console.log("Applying filters:", {
      patientGroup: selectedPatientGroup,
      medicationCategory: selectedMedicationCategory,
      specificMedication: selectedSpecificMedication,
    });
    // In a real app, this would trigger data fetching and chart updates
    // For now, it just logs to console.
  };

  const canApplyFilters = selectedPatientGroup && selectedMedicationCategory && selectedSpecificMedication;

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Medication Impact Analysis"
        description="Analyze the effects of key medications on eGFR and Albuminuria for specific patient cohorts."
      />

      <Card className="mb-6 mt-4">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><Filter className="mr-2 h-5 w-5 text-primary"/>Analysis Filters</CardTitle>
          <CardDescription>Select criteria to refine the analysis. Charting functionality is under development.</CardDescription>
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
          <Button onClick={handleApplyFilters} disabled={!canApplyFilters}>
            <Pill className="mr-2 h-4 w-4"/>
            Apply Filters & Analyze (Logs to Console)
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><LineChartIcon className="mr-2 h-5 w-5 text-primary"/>eGFR Trend Analysis</CardTitle>
            <CardDescription>Visualizing eGFR changes in response to selected medication.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground text-center">
              eGFR trend chart placeholder.
              <br />
              (Functionality under development)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary"/>Albuminuria Trend Analysis</CardTitle>
            <CardDescription>Visualizing Albuminuria changes in response to selected medication.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground text-center">
              Albuminuria trend chart placeholder.
              <br />
              (Functionality under development)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-headline">Patient Data Summary</CardTitle>
          <CardDescription>Tabular view of patients, prescribed medications, and corresponding lab value changes.</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground text-center">
            Patient data table placeholder.
            <br />
            (Functionality under development)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
