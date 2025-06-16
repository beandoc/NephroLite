
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export function PatientAnalysisChart() {
  return (
    <Card className="border-dashed border-2 h-80 flex items-center justify-center bg-muted/30">
      <CardContent className="text-center">
        <Image 
            src="https://placehold.co/400x200.png" 
            alt="Placeholder chart for patient analysis" 
            width={400} 
            height={200}
            data-ai-hint="data chart"
            className="opacity-50"
        />
        <p className="mt-4 text-muted-foreground">Patient analysis chart will be displayed here.</p>
        <p className="text-sm text-muted-foreground">(Feature under development)</p>
      </CardContent>
    </Card>
  );
}
