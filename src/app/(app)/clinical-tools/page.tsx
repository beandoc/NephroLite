
"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calculator, FilePlus2, Ruler } from 'lucide-react';
import { EgfrCalculator } from '@/components/clinical-tools/EgfrCalculator';
import { BmiCalculator } from '@/components/clinical-tools/BmiCalculator';

export default function ClinicalToolsPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Clinical Tools" description="Access various clinical calculators and tools." />
      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        
        <Card className="lg:row-span-2">
          <CardHeader>
            <div className="flex items-center">
              <Calculator className="h-6 w-6 mr-3 text-primary" />
              <CardTitle className="text-lg font-medium font-headline">eGFR Calculator (CKD-EPI 2021)</CardTitle>
            </div>
            <CardDescription>Estimate Glomerular Filtration Rate using the 2021 CKD-EPI Creatinine equation.</CardDescription>
          </CardHeader>
          <CardContent>
            <EgfrCalculator />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <div className="flex items-center">
              <Ruler className="h-6 w-6 mr-3 text-primary" />
              <CardTitle className="text-lg font-medium font-headline">BMI Calculator</CardTitle>
            </div>
            <CardDescription>Calculate Body Mass Index.</CardDescription>
          </CardHeader>
          <CardContent>
            <BmiCalculator />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
             <div className="flex items-center">
              <FilePlus2 className="h-6 w-6 mr-3 text-primary" />
              <CardTitle className="text-lg font-medium font-headline">Risk Score Assessors</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Assess patient risk scores (e.g., KFRE for kidney failure risk).
            </p>
            <div className="h-24 flex items-center justify-center border-2 border-dashed rounded-lg mt-4">
              <p className="text-center text-muted-foreground italic">
                Risk score calculators are under development.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
