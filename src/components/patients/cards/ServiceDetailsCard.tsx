
"use client";

import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

interface ServiceDetailsCardProps {
  patient: Patient;
}

const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
    <p className="text-base">{value || 'N/A'}</p>
  </div>
);

export function ServiceDetailsCard({ patient }: ServiceDetailsCardProps) {
  return (
    <Card className="shadow-md">
      <CardHeader className="bg-muted/30">
        <CardTitle className="font-headline text-xl flex items-center"><Briefcase className="w-6 h-6 mr-3 text-primary"/>Service Details</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DetailItem label="Service Name" value={patient.serviceName} />
        <DetailItem label="Service Number" value={patient.serviceNumber} />
        <DetailItem label="Rank" value={patient.rank} />
        <DetailItem label="Unit Name" value={patient.unitName} />
        <DetailItem label="Formation" value={patient.formation} />
      </CardContent>
    </Card>
  );
}
