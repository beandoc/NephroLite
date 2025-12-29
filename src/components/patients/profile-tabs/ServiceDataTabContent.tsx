"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Patient } from "@/lib/types";
import { Shield, MapPin, Calendar, User, Building, Flag, Save, Plus, Trash2, Loader2 } from "lucide-react";
import { usePatientData } from "@/hooks/use-patient-data";
import { useToast } from "@/hooks/use-toast";
import { SHAPE_CLASSIFICATIONS, DISABILITY_PROFILE_VALUES } from "@/lib/constants";

interface ServiceDataTabContentProps {
    patient: Patient;
}

const disabilityEntrySchema = z.object({
    id: z.string(),
    primaryDisability: z.string().optional(),
    locationOfOnset: z.string().optional(),
    dateOfOnset: z.string().optional(),
});

const serviceDataSchema = z.object({
    // Service particulars
    serviceNumber: z.string().optional(),
    rank: z.string().optional(),
    unitName: z.string().optional(),
    formation: z.string().optional(),

    // Medical classification & disability
    pastMedicalClassification: z.string().optional(),
    disabilityProfile: z.string().optional(),

    // Array of disability details
    disabilityEntries: z.array(disabilityEntrySchema),

    // Opinion and recommendations
    opinionText: z.string().optional(),
    recommendations: z.string().optional(),
});

type ServiceDataFormValues = z.infer<typeof serviceDataSchema>;

export function ServiceDataTabContent({ patient }: ServiceDataTabContentProps) {
    const { clinicalProfile } = patient;
    const { updatePatient } = usePatientData();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check if patient is military personnel (Self) or dependent
    const isMilitaryPersonnel = patient.guardian?.relation?.toUpperCase() === 'SELF';

    // Initialize with existing disability data or one empty entry
    const initialDisabilityEntries = clinicalProfile?.primaryDisability ||
        clinicalProfile?.disabilityLocationOfOnset ||
        clinicalProfile?.disabilityDateOfOnset
        ? [{
            id: crypto.randomUUID(),
            primaryDisability: clinicalProfile?.primaryDisability || "",
            locationOfOnset: clinicalProfile?.disabilityLocationOfOnset || "",
            dateOfOnset: clinicalProfile?.disabilityDateOfOnset || "",
        }]
        : [{
            id: crypto.randomUUID(),
            primaryDisability: "",
            locationOfOnset: "",
            dateOfOnset: "",
        }];

    const form = useForm<ServiceDataFormValues>({
        resolver: zodResolver(serviceDataSchema),
        defaultValues: {
            serviceNumber: patient.serviceNumber || "",
            rank: patient.rank || "",
            unitName: patient.unitName || "",
            formation: patient.formation || "",
            pastMedicalClassification: clinicalProfile?.pastMedicalClassification || "",
            disabilityProfile: clinicalProfile?.disabilityProfile || "",
            disabilityEntries: initialDisabilityEntries,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "disabilityEntries",
    });

    const addDisabilityEntry = () => {
        append({
            id: crypto.randomUUID(),
            primaryDisability: "",
            locationOfOnset: "",
            dateOfOnset: "",
        });
    };

    const onSubmit = async (data: ServiceDataFormValues) => {
        setIsSubmitting(true);
        try {
            // Take the first disability entry as the primary one for backward compatibility
            const primaryEntry = data.disabilityEntries[0];

            // Update patient profile with service fields
            await updatePatient(patient.id, {
                // Top-level service fields
                serviceNumber: data.serviceNumber,
                rank: data.rank,
                unitName: data.unitName,
                formation: data.formation,
                // Medical classification and disability in clinicalProfile
                clinicalProfile: {
                    ...clinicalProfile,
                    pastMedicalClassification: data.pastMedicalClassification,
                    disabilityProfile: data.disabilityProfile,
                    // Store primary disability entry
                    primaryDisability: primaryEntry?.primaryDisability,
                    disabilityLocationOfOnset: primaryEntry?.locationOfOnset,
                    disabilityDateOfOnset: primaryEntry?.dateOfOnset,
                    // Store all disability entries as array (for future use)
                    disabilityEntries: data.disabilityEntries,
                },
            });

            toast({
                title: "Service Data Updated",
                description: "Military service information has been saved successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update service data. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show message for dependents only
    if (!isMilitaryPersonnel) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Service Data Not Applicable</h3>
                    <p className="text-sm text-muted-foreground">
                        This tab is only for military personnel (Relation = SELF).
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Current relationship: <strong>{patient.guardian?.relation || 'Not specified'}</strong>
                    </p>
                </CardContent>
            </Card>
        );
    }

    // For military personnel, show editable form
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Service Particulars Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Service Particulars
                        </CardTitle>
                        <CardDescription>Military service information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="serviceNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Service Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 12345678" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="rank"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rank</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Major, Captain" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="unitName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 1st Battalion" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="formation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Formation</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Eastern Command" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Medical Classification & Disability Profile Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Medical Classification & Disability Profile
                        </CardTitle>
                        <CardDescription>Current medical status and disability assessment</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="pastMedicalClassification"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Past Medical Classification</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select SHAPE classification" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {SHAPE_CLASSIFICATIONS.map((shape) => (
                                                    <SelectItem key={shape} value={shape}>
                                                        {shape}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="disabilityProfile"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Disability Profile</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select disability profile" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {DISABILITY_PROFILE_VALUES.map((profile) => (
                                                    <SelectItem key={profile} value={profile}>
                                                        {profile}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Disability Details Card with Dynamic Entries */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="font-headline text-xl">Disability Details</CardTitle>
                                <CardDescription>Information about onset and nature of disability</CardDescription>
                            </div>
                            <Button
                                type="button"
                                onClick={addDisabilityEntry}
                                size="sm"
                                variant="outline"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Disability
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {fields.map((field, index) => (
                                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-sm">Disability Entry #{index + 1}</h4>
                                        {fields.length > 1 && (
                                            <Button
                                                type="button"
                                                onClick={() => remove(index)}
                                                size="sm"
                                                variant="ghost"
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name={`disabilityEntries.${index}.primaryDisability`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Primary Disability / Diagnosis</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., IgA Nephropathy, CKD Stage 3" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name={`disabilityEntries.${index}.locationOfOnset`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        Location of Onset
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., Manasbal (J&K)" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`disabilityEntries.${index}.dateOfOnset`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        Date of Onset
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input type="month" placeholder="YYYY-MM" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Service Data
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
