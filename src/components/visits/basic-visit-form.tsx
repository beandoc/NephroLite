"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PATIENT_GROUP_NAMES, VISIT_TYPES } from "@/lib/constants";
import type { Patient, VisitFormData } from "@/lib/types";
import { visitFormDataSchema } from "@/lib/schemas";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

interface BasicVisitFormProps {
    patient: Patient;
    onSubmit: (data: VisitFormData) => void;
    onCancel: () => void;
}

export function BasicVisitForm({ patient, onSubmit, onCancel }: BasicVisitFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<VisitFormData>({
        resolver: zodResolver(visitFormDataSchema),
        defaultValues: {
            visitType: "Routine",
            visitRemark: "Initial visit",
            groupName: "",
        },
    });

    const handleSubmit = async (data: VisitFormData) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Visit Type */}
                <FormField
                    control={form.control}
                    name="visitType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Visit Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select visit type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {VISIT_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Group Name */}
                <FormField
                    control={form.control}
                    name="groupName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Assign to Group (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select patient group" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {PATIENT_GROUP_NAMES.map((group) => (
                                        <SelectItem key={group} value={group}>
                                            {group}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Visit Remark */}
                <FormField
                    control={form.control}
                    name="visitRemark"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Visit Remark</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter a brief remark for the visit..."
                                    rows={3}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Action Buttons */}
                <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : (
                            <>
                                Next: Clinical Details
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
