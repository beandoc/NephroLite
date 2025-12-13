"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Eye, Loader2 } from 'lucide-react';
import { generateAndDownloadDischargeSummary, previewDischargeSummary } from '@/lib/pdf-utils';
import { useToast } from '@/hooks/use-toast';
import type { Patient, Visit } from '@/lib/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DischargeSummaryButtonProps {
    patient: Patient;
    visit: Visit;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
}

export function DischargeSummaryButton({
    patient,
    visit,
    variant = 'outline',
    size = 'default'
}: DischargeSummaryButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const hospitalInfo = {
        name: 'NephroLite Medical Center',
        address: 'Nephrology & Dialysis Center',
        phone: '+91 (XXX) XXX-XXXX',
        email: 'info@nephrolite.com',
    };

    const doctorInfo = {
        name: 'Dr. Sachin Srivastava',
        qualification: 'MD, DM (Nephrology)',
    };

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            await generateAndDownloadDischargeSummary(patient, visit, {
                hospitalInfo,
                doctorInfo,
            });

            toast({
                title: 'PDF Downloaded',
                description: 'Discharge summary has been downloaded successfully.',
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast({
                title: 'Error',
                description: 'Failed to generate discharge summary. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePreview = async () => {
        setIsGenerating(true);
        try {
            await previewDischargeSummary(patient, visit, {
                hospitalInfo,
                doctorInfo,
            });

            toast({
                title: 'PDF Preview Opened',
                description: 'Discharge summary opened in new tab.',
            });
        } catch (error) {
            console.error('Error previewing PDF:', error);
            toast({
                title: 'Error',
                description: 'Failed to preview discharge summary. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size} disabled={isGenerating}>
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <FileDown className="mr-2 h-4 w-4" />
                            Discharge Summary
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={handlePreview}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Download PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
