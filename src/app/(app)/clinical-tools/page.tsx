
"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calculator, FilePlus2, Ruler, ShieldAlert } from 'lucide-react';
import { EgfrCalculator } from '@/components/clinical-tools/EgfrCalculator';
import { BmiCalculator } from '@/components/clinical-tools/BmiCalculator';
import { KfreCalculator } from '@/components/clinical-tools/KfreCalculator';

export default function ClinicalToolsPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Clinical Tools" description="Access various clinical calculators and tools." />
      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 mt-6">

        <Card>
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
              <ShieldAlert className="h-6 w-6 mr-3 text-primary" />
              <CardTitle className="text-lg font-medium font-headline">Kidney Failure Risk (KFRE)</CardTitle>
            </div>
            <CardDescription>Calculate the 2 and 5-year risk of kidney failure.</CardDescription>
          </CardHeader>
          <CardContent>
            <KfreCalculator />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
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

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <a href="https://ckdpcrisk.org/pcr2acr/" target="_blank" rel="noopener noreferrer" className="block">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calculator className="h-6 w-6 mr-3 text-primary" />
                  <CardTitle className="text-lg font-medium font-headline">UPCR to UACR Converter</CardTitle>
                </div>
                <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <CardDescription>Convert Urine Protein-Creatinine Ratio (UPCR) to Urine Albumin-Creatinine Ratio (UACR).</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Click to open external calculator →
            </CardContent>
          </a>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <a href="https://adpkdsim.org/expert/prognostic-tools" target="_blank" rel="noopener noreferrer" className="block">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ShieldAlert className="h-6 w-6 mr-3 text-primary" />
                  <CardTitle className="text-lg font-medium font-headline">ADPKD Prognostic Tools</CardTitle>
                </div>
                <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <CardDescription>Tools for Autosomal Dominant Polycystic Kidney Disease (ADPKD) prognosis and risk assessment.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Click to open ADPKD tools →
            </CardContent>
          </a>
        </Card>

      </div>
    </div>
  );
}
