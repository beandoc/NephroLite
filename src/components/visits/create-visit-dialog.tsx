
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { usePatientData } from "@/hooks/use-patient-data";
import { useState, useEffect } from "react";

const visitFormSchema = z.object({
  visitType: z.string().min(1, "Visit type is required."),
  visitRemark: z.string().min(1, "Visit remark is required."),
  groupName: z.string().min(1, "Group name is required."),
});

const defaultValues = {
  visitType: "Routine",
  visitRemark: "Initial registration visit.",
  groupName: "",
};

interface CreateVisitDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null; // Allow null
  onVisitCreated: (patientId: string) => void;
  onDialogClose?: () => void;
}

export function CreateVisitDialog({
  isOpen,
  onOpenChange,
  patient,
  onVisitCreated,
  onDialogClose,
}: CreateVisitDialogProps) {
  const { addVisitToPatient } = usePatientData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VisitFormData>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset(defaultValues);
      if (onDialogClose) {
        onDialogClose();
      }
    }
  }, [isOpen, form, onDialogClose]);

  const onSubmit = async (data: VisitFormData) => {
    if (!patient) return; // Guard clause
    setIsSubmitting(true);
    try {
      await addVisitToPatient(patient.id, data);
      onVisitCreated(patient.id);
      form.reset(defaultValues);
    } catch (error) {
      console.error("Failed to create visit:", error);
      // You might want to show a toast message here
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!patient) {
    return null; // Don't render the dialog if there's no patient
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Initial Visit for {patient.name}</DialogTitle>
          <DialogDescription>
            Please provide the following details for this first visit.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="visitType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visit Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a visit type" />
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
            <FormField
              control={form.control}
              name="groupName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign to Group</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient group" />
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
            <FormField
              control={form.control}
              name="visitRemark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visit Remark</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a brief remark for the visit"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Visit and Continue"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
