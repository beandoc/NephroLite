
"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePatientData } from '@/hooks/use-patient-data';
import { useMemo } from 'react';
import type { Intervention } from '@/lib/types';
import { INTERVENTION_TYPES } from '@/lib/constants';
import { Stethoscope, Droplet, Waves, HeartPulse, Shield, Activity, Syringe, Wind } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const interventionIcons: Record<string, React.ElementType> = {
    'Kidney Biopsy': Stethoscope,
    'Temporary Catheter': Droplet,
    'Tunneled Cuffed Catheter': Droplet,
    'Dialysis Catheter Removal': Droplet,
    'CAPD Catheter Insertion': Waves,
    'CAPD Catheter Removal': Waves,
    'AV Fistula Creation': HeartPulse,
    'Endovascular Intervention': Wind,
};

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon }) => (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
);

export default function InterventionsPage() {
    const { patients, isLoading } = usePatientData();

    const interventionCounts = useMemo(() => {
        if (isLoading) return {};

        const counts: Record<string, number> = {};
        INTERVENTION_TYPES.forEach(type => counts[type] = 0);

        patients.forEach(patient => {
            patient.interventions?.forEach(intervention => {
                if (counts[intervention.type] !== undefined) {
                    counts[intervention.type]++;
                }
            });
        });
        return counts;
    }, [patients, isLoading]);

    return (
        <div className="container mx-auto py-2">
            <PageHeader
                title="Interventions Dashboard"
                description="Overview of all clinical interventions performed."
            />
            {isLoading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                    {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
                 </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                    {INTERVENTION_TYPES.map(type => (
                        <MetricCard
                            key={type}
                            title={type}
                            value={interventionCounts[type] || 0}
                            icon={interventionIcons[type] || Activity}
                        />
                    ))}
                </div>
            )}
            
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="font-headline">All Interventions Log</CardTitle>
                    <CardDescription>A comprehensive, filterable log of all recorded interventions is planned for this area.</CardDescription>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground text-center">
                        Full intervention log and filtering functionality is under development.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
