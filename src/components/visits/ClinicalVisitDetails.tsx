"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Visit, Diagnosis, Medication, ClinicalVisitData, DiagnosisTemplate, Patient } from "@/lib/types";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Save, FileText, Stethoscope, Activity, FileSearch, ClipboardList, Pill, FileOutput, Shield, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { DIAGNOSIS_TEMPLATES } from "@/lib/constants";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { usePatientData } from "@/hooks/use-patient-data";


const diagnosisSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Diagnosis name is required"),
  icdName: z.string().optional(),
  icdCode: z.string().optional(),
});

const medicationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Medication name is required."),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  instructions: z.string().optional(),
});


const clinicalVisitSchema = z.object({
  // Standard clinical fields
  diagnoses: z.array(diagnosisSchema).optional(),
  medications: z.array(medicationSchema).optional(),

  // Military-specific fields
  disabilityProfile: z.string().optional(),
  disabilityDetails: z.string().optional(),
  serviceNumber: z.string().optional(),
  unitName: z.string().optional(),
  formation: z.string().optional(),

  // Common fields
  history: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  bmi: z.string().optional(),
  idealBodyWeight: z.string().optional(),
  pulse: z.string().optional(),
  systolicBP: z.string().optional(),
  diastolicBP: z.string().optional(),
  respiratoryRate: z.string().optional(),
  generalExamination: z.string().optional(),
  systemicExamination: z.string().optional(),
  courseInHospital: z.string().optional(),
  dischargeInstructions: z.string().optional(),
  opinionText: z.string().optional(),
  recommendations: z.string().optional(),
  usgReport: z.string().optional(),
  kidneyBiopsyReport: z.string().optional(),
  serumCreatinine: z.string().optional(),
  uacr: z.string().optional(),
  totalCholesterol: z.string().optional(),
  hdlCholesterol: z.string().optional(),
});

type ClinicalVisitFormData = z.infer<typeof clinicalVisitSchema>;

import { DischargeSummaryButton } from '@/components/pdf/DischargeSummaryButton';

interface ClinicalVisitDetailsProps {
  visit: Visit;
  patient?: Patient;
  onSaveComplete?: (data: any) => void;
}

export function ClinicalVisitDetails({ visit, patient, onSaveComplete }: ClinicalVisitDetailsProps) {
  const { toast } = useToast();
  const { updateVisitData } = usePatientData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("diagnosis");

  // Determine if this is a military person (Self relation)
  const isMilitaryPerson = visit.patientRelation === "Self";

  const form = useForm<ClinicalVisitFormData>({
    resolver: zodResolver(clinicalVisitSchema),
    defaultValues: {
      diagnoses: visit.diagnoses && visit.diagnoses.length > 0 ? visit.diagnoses : [{ id: crypto.randomUUID(), name: "", icdCode: "", icdName: "" }],
      medications: visit.clinicalData?.medications?.map(m => ({ ...m, id: m.id || crypto.randomUUID() })) || [],

      // Military fields
      disabilityProfile: visit.clinicalData?.disabilityProfile || "",
      disabilityDetails: visit.clinicalData?.disabilityDetails || "",
      serviceNumber: visit.clinicalData?.serviceNumber || "",
      unitName: visit.clinicalData?.unitName || "",
      formation: visit.clinicalData?.formation || "",

      // Standard fields
      history: visit.clinicalData?.history || "",
      height: visit.clinicalData?.height || "",
      weight: visit.clinicalData?.weight || "",
      bmi: visit.clinicalData?.bmi || "",
      idealBodyWeight: visit.clinicalData?.idealBodyWeight || "",
      pulse: visit.clinicalData?.pulse || "",
      systolicBP: visit.clinicalData?.systolicBP || "",
      diastolicBP: visit.clinicalData?.diastolicBP || "",
      respiratoryRate: visit.clinicalData?.respiratoryRate || "",
      generalExamination: visit.clinicalData?.generalExamination || "",
      systemicExamination: visit.clinicalData?.systemicExamination || "",
      courseInHospital: visit.clinicalData?.courseInHospital || "",
      dischargeInstructions: visit.clinicalData?.dischargeInstructions || "",
      opinionText: visit.clinicalData?.opinionText || "",
      recommendations: visit.clinicalData?.recommendations || "",
      usgReport: visit.clinicalData?.usgReport || "",
      kidneyBiopsyReport: visit.clinicalData?.kidneyBiopsyReport || "",
      serumCreatinine: visit.clinicalData?.serumCreatinine || "",
      uacr: visit.clinicalData?.uacr || "",
      totalCholesterol: visit.clinicalData?.totalCholesterol || "",
      hdlCholesterol: visit.clinicalData?.hdlCholesterol || "",
    },
  });

  const { fields: diagnosisFields, append: appendDiagnosis, remove: removeDiagnosis } = useFieldArray({
    control: form.control,
    name: "diagnoses"
  });

  const { fields: medicationFields, append: appendMedication, remove: removeMedication } = useFieldArray({
    control: form.control,
    name: "medications"
  });

  const height = form.watch("height");
  const weight = form.watch("weight");
  const gender = visit.patientGender || 'Male';

  useEffect(() => {
    const h = parseFloat(height || "0");
    const w = parseFloat(weight || "0");
    if (h > 0 && w > 0) {
      const bmiValue = (w / ((h / 100) * (h / 100))).toFixed(2);
      form.setValue("bmi", bmiValue);
    } else {
      form.setValue("bmi", "");
    }

    if (h > 0) {
      let idealWeight;
      if (gender === 'Male') {
        idealWeight = 50 + 0.91 * (h - 152.4);
      } else {
        idealWeight = 45.5 + 0.91 * (h - 152.4);
      }
      form.setValue("idealBodyWeight", idealWeight > 0 ? idealWeight.toFixed(2) : "");
    } else {
      form.setValue("idealBodyWeight", "");
    }

  }, [height, weight, gender, form]);

  // Set initial tab based on patient type
  useEffect(() => {
    if (isMilitaryPerson) {
      setActiveTab("disability");
    } else {
      setActiveTab("diagnosis");
    }
  }, [isMilitaryPerson]);


  const onSubmit = async (data: ClinicalVisitFormData) => {
    setIsSubmitting(true);
    try {
      const dataToSave: ClinicalVisitData = {
        ...data,
        diagnoses: data.diagnoses?.map(d => ({
          ...d,
          id: d.id || crypto.randomUUID()
        })) || [],
      };

      await updateVisitData(visit.patientId, visit.id, dataToSave);
      toast({
        title: "Clinical Data Saved",
        description: "The visit details have been successfully saved to the database.",
      });

      if (onSaveComplete) {
        onSaveComplete(dataToSave);
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "An error occurred while saving the visit data.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateSelect = (templateKey: string) => {
    const template = DIAGNOSIS_TEMPLATES[templateKey as keyof typeof DIAGNOSIS_TEMPLATES];
    if (!template) {
      toast({ title: "Template not found", variant: "destructive" });
      return;
    }

    // Keep existing vitals
    const existingVitals = {
      height: form.getValues('height'),
      weight: form.getValues('weight'),
      bmi: form.getValues('bmi'),
      idealBodyWeight: form.getValues('idealBodyWeight'),
      pulse: form.getValues('pulse'),
      systolicBP: form.getValues('systolicBP'),
      diastolicBP: form.getValues('diastolicBP'),
      respiratoryRate: form.getValues('respiratoryRate'),
    };

    // Reset the form with template data, but preserve vitals
    form.reset({
      ...template,
      ...existingVitals,
      medications: template.medications.map(med => ({ ...med, id: med.id || crypto.randomUUID() })),
      diagnoses: template.diagnoses?.map(d => ({ ...d, id: d.id || crypto.randomUUID() })) || [{ id: crypto.randomUUID(), name: "", icdCode: "", icdName: "" }]
    });

    toast({ title: "Template Loaded", description: `The form has been pre-filled with the "${templateKey}" template.` });
  };

  return (
    <div className="p-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {!isMilitaryPerson && (
            <Card>
              <CardHeader>
                <CardTitle>Visit Data Entry</CardTitle>
                <CardDescription>If diagnosis is known, select a template to pre-fill the form. Otherwise, proceed with manual data entry. Patient-specific vitals will not be overwritten by templates.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <Select onValueChange={handleTemplateSelect}>
                    <SelectTrigger className="flex-grow">
                      <SelectValue placeholder="Load a clinical template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(DIAGNOSIS_TEMPLATES).map(key => (
                        <SelectItem key={key} value={key}>{key}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={() => form.reset()}>Clear Form</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {isMilitaryPerson ? (
              // Military Personnel Tabs
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="disability" className="text-xs sm:text-sm">
                  <Shield className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Disability</span>
                </TabsTrigger>
                <TabsTrigger value="service" className="text-xs sm:text-sm">
                  <Users className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Service</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="text-xs sm:text-sm">
                  <FileText className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">History</span>
                </TabsTrigger>
                <TabsTrigger value="vitals" className="text-xs sm:text-sm">
                  <Activity className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Vitals</span>
                </TabsTrigger>
                <TabsTrigger value="examination" className="text-xs sm:text-sm">
                  <FileSearch className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Exam</span>
                </TabsTrigger>
                <TabsTrigger value="summary" className="text-xs sm:text-sm">
                  <ClipboardList className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Summary</span>
                </TabsTrigger>
                <TabsTrigger value="opinion" className="text-xs sm:text-sm">
                  <FileOutput className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Opinion</span>
                </TabsTrigger>
              </TabsList>
            ) : (
              // Civilian Tabs
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="diagnosis" className="text-xs sm:text-sm">
                  <Stethoscope className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Diagnosis</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="text-xs sm:text-sm">
                  <FileText className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">History</span>
                </TabsTrigger>
                <TabsTrigger value="vitals" className="text-xs sm:text-sm">
                  <Activity className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Vitals</span>
                </TabsTrigger>
                <TabsTrigger value="examination" className="text-xs sm:text-sm">
                  <FileSearch className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Exam</span>
                </TabsTrigger>
                <TabsTrigger value="summary" className="text-xs sm:text-sm">
                  <ClipboardList className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Summary</span>
                </TabsTrigger>
                <TabsTrigger value="medications" className="text-xs sm:text-sm">
                  <Pill className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Medications</span>
                </TabsTrigger>
                <TabsTrigger value="instructions" className="text-xs sm:text-sm">
                  <FileOutput className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Instructions</span>
                </TabsTrigger>
              </TabsList>
            )}

            {/* Military-Specific Tabs */}
            {isMilitaryPerson && (
              <>
                {/* Disability Tab */}
                <TabsContent value="disability" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Disability Assessment</CardTitle>
                      <CardDescription>Document disability status and profile for military personnel</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                                <SelectItem value="Shape-1">Shape-1</SelectItem>
                                <SelectItem value="Low Medical Category">Low Medical Category</SelectItem>
                                <SelectItem value="Permanent Disability">Permanent Disability</SelectItem>
                                <SelectItem value="Temporary Disability">Temporary Disability</SelectItem>
                                <SelectItem value="None">None</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="disabilityDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Disability Details</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={10}
                                placeholder="Enter detailed assessment of disability, limitations, and medical category..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Service Particulars Tab */}
                <TabsContent value="service" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Service Particulars</CardTitle>
                      <CardDescription>Military service details for official records</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Opinion Tab (Military) */}
                <TabsContent value="opinion" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Medical Opinion & Recommendations</CardTitle>
                      <CardDescription>Professional medical opinion for military medical board</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="opinionText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medical Opinion</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={8}
                                placeholder="Provide detailed medical opinion for military medical board..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="recommendations"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recommendations</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={8}
                                placeholder="Specific recommendations for medical board consideration..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}

            {/* Civilian-Specific Tabs */}
            {!isMilitaryPerson && (
              <>
                {/* Diagnosis Tab */}
                <TabsContent value="diagnosis" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Clinical Diagnosis</CardTitle>
                      <CardDescription>Add one or more diagnoses for this visit. Each diagnosis can include ICD-10 codes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {diagnosisFields.map((field, index) => (
                        <Card key={field.id} className="p-4">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-semibold text-sm">Diagnosis #{index + 1}</h4>
                              {diagnosisFields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeDiagnosis(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
                              <FormField
                                control={form.control}
                                name={`diagnoses.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Diagnosis Name</FormLabel>
                                    <FormControl><Input placeholder="e.g., Hypertension" {...field} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`diagnoses.${index}.icdCode`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>ICD-10</FormLabel>
                                    <FormControl><Input placeholder="e.g., I10" {...field} className="w-full sm:w-24" /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => appendDiagnosis({ id: crypto.randomUUID(), name: "", icdCode: "", icdName: "" })}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Another Diagnosis
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Medications Tab */}
                <TabsContent value="medications" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Medications</CardTitle>
                      <CardDescription>Medications can be loaded from a template or added manually.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Medicine Name</TableHead>
                              <TableHead>Dosage</TableHead>
                              <TableHead>Frequency</TableHead>
                              <TableHead>Instructions</TableHead>
                              <TableHead className="w-[50px]">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {medicationFields.length > 0 ? (
                              medicationFields.map((field, index) => (
                                <TableRow key={field.id}>
                                  <TableCell>
                                    <FormField control={form.control} name={`medications.${index}.name`} render={({ field }) => <Input placeholder="Medication" {...field} />} />
                                  </TableCell>
                                  <TableCell>
                                    <FormField control={form.control} name={`medications.${index}.dosage`} render={({ field }) => <Input placeholder="e.g., 40mg" {...field} />} />
                                  </TableCell>
                                  <TableCell>
                                    <FormField control={form.control} name={`medications.${index}.frequency`} render={({ field }) => <Input placeholder="e.g., OD" {...field} />} />
                                  </TableCell>
                                  <TableCell>
                                    <FormField control={form.control} name={`medications.${index}.instructions`} render={({ field }) => <Input placeholder="e.g., After food" {...field} />} />
                                  </TableCell>
                                  <TableCell>
                                    <Button type="button" variant="destructive" size="icon" onClick={() => removeMedication(index)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                  No medications added. Load a template or add manually.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendMedication({ id: crypto.randomUUID(), name: "", dosage: "", frequency: "", instructions: "" })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Medication
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Instructions Tab */}
                <TabsContent value="instructions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Discharge Instructions</CardTitle>
                      <CardDescription>Provide discharge and follow-up instructions for the patient.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="dischargeInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl><Textarea rows={10} placeholder="Advised to...&#10;Follow-up in...&#10;Precautions..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}

            {/* Common Tabs (shown for both military and civilian) */}

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Patient History</CardTitle>
                  <CardDescription>Document the patient's relevant medical history for this visit.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="history"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>History</FormLabel>
                        <FormControl><Textarea rows={10} placeholder="Enter patient history for this visit..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vitals Tab */}
            <TabsContent value="vitals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vital Signs</CardTitle>
                  <CardDescription>Record the patient's vital signs and measurements.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-4">Anthropometric Measurements</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" placeholder="e.g., 175" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="weight" render={({ field }) => (<FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 70" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="idealBodyWeight" render={({ field }) => (<FormItem><FormLabel>Ideal Wt (kg)</FormLabel><FormControl><Input placeholder="Calculated" {...field} readOnly /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="bmi" render={({ field }) => (<FormItem><FormLabel>BMI (kg/m²)</FormLabel><FormControl><Input placeholder="Calculated" {...field} readOnly /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-4">Hemodynamic Parameters</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField control={form.control} name="pulse" render={({ field }) => (<FormItem><FormLabel>Pulse (/min)</FormLabel><FormControl><Input type="number" placeholder="e.g., 72" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="systolicBP" render={({ field }) => (<FormItem><FormLabel>Systolic BP (mmHg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 120" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="diastolicBP" render={({ field }) => (<FormItem><FormLabel>Diastolic BP (mmHg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 80" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="respiratoryRate" render={({ field }) => (<FormItem><FormLabel>Resp. Rate (/min)</FormLabel><FormControl><Input type="number" placeholder="e.g., 16" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Examination Tab */}
            <TabsContent value="examination" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Examination Findings</CardTitle>
                  <CardDescription>Document general and systemic examination findings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="generalExamination" render={({ field }) => (<FormItem><FormLabel>General Examination</FormLabel><FormControl><Textarea rows={6} placeholder="Pallor, icterus, clubbing, cyanosis, edema, lymphadenopathy, etc." {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="systemicExamination" render={({ field }) => (<FormItem><FormLabel>Systemic Examination</FormLabel><FormControl><Textarea rows={6} placeholder="CVS: JVP, heart sounds, murmurs&#10;Respiratory: Air entry, added sounds&#10;Abdomen: Soft, non-tender, organ examination&#10;CNS: Conscious, oriented, GCS, focal deficits" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Clinical Summary</CardTitle>
                  <CardDescription>Document the patient's hospital course.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="courseInHospital"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course in Hospital (if applicable)</FormLabel>
                        <FormControl><Textarea rows={10} placeholder="Describe the patient's course during admission..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center gap-3 sticky bottom-0 bg-background p-4 border-t">
            {patient && (
              <DischargeSummaryButton
                patient={patient}
                visit={visit}
                variant="outline"
                size="default"
              />
            )}

            <div className="flex-1" />

            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Clinical Data"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
