
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, FilePlus2, Ruler } from 'lucide-react';

export default function ClinicalToolsPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Clinical Tools" description="Access various clinical calculators and tools." />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {[
          { title: "eGFR Calculator", icon: Calculator, description: "Estimate Glomerular Filtration Rate." },
          { title: "BMI Calculator", icon: Ruler, description: "Calculate Body Mass Index." },
          { title: "Risk Score Assessors", icon: FilePlus2, description: "Assess patient risk scores (e.g., cardiovascular)." },
        ].map(tool => (
          <Card key={tool.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium font-headline">{tool.title}</CardTitle>
              <tool.icon className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{tool.description}</p>
              <p className="text-center text-muted-foreground pt-4 italic">Tool under development.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
