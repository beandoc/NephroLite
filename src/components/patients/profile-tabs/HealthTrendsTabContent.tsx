
"use client";

import type { Patient } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Link as LinkIcon } from 'lucide-react';

interface HealthTrendsTabContentProps {
    patient: Patient;
}

export function HealthTrendsTabContent({ patient }: HealthTrendsTabContentProps) {
    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center">
                    <TrendingUp className="w-6 h-6 mr-3 text-primary"/>
                    Patient Health Trends & Predictions
                </CardTitle>
                <CardDescription>
                    View detailed analytics, risk predictions, and trends for this patient.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
                <TrendingUp className="w-16 h-16 text-primary mb-4" />
                <p className="text-lg text-center mb-4">
                    Access comprehensive health trends, medication timelines, event logs, and risk predictions.
                </p>
                <Button asChild size="lg">
                    <Link href={`/patients/${patient.id}/health-trends`}>
                        <LinkIcon className="mr-2 h-5 w-5" /> View Detailed Health Trends
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
