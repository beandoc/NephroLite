

import { z } from 'zod';
import { 
  patientSchema,
  patientFormDataSchema, 
  clinicalProfileSchema, 
  investigationMasterSchema, 
  investigationPanelSchema,
  visitFormDataSchema,
  diagnosisTemplateSchema,
  appointmentSchema,
  visitSchema,
  masterDiagnosisSchema,
  investigationSchema,
  panelSchema,
  diagnosisSchema,
  vaccinationSchema,
  doseSchema,
  interventionSchema,
  interventionFormSchema,
  dialysisSessionSchema,
} from './schemas';

// Address and Guardian types are simple and don't need Zod schemas unless they have complex validation.
export type Address = {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
};

export type Guardian = {
  name?: string;
  relation?: string;
  contact?: string;
};

// Derive types from Zod schemas to ensure consistency
export type Patient = z.infer<typeof patientSchema>;
export type PatientFormData = z.infer<typeof patientFormDataSchema>;
export type ClinicalProfile = z.infer<typeof clinicalProfileSchema>;
export type Vaccination = z.infer<typeof vaccinationSchema>;
export type Dose = z.infer<typeof doseSchema>;
export type InvestigationMaster = z.infer<typeof investigationMasterSchema>;
export type InvestigationPanel = z.infer<typeof investigationPanelSchema>;
export type VisitFormData = z.infer<typeof visitFormDataSchema>;
export type DiagnosisTemplate = z.infer<typeof diagnosisTemplateSchema>;
export type Appointment = z.infer<typeof appointmentSchema>;
export type Visit = z.infer<typeof visitSchema>;
export type MasterDiagnosis = z.infer<typeof masterDiagnosisSchema>;
export type InvestigationFormData = z.infer<typeof investigationSchema>;
export type PanelFormData = z.infer<typeof panelSchema>;
export type Intervention = z.infer<typeof interventionSchema>;
export type InterventionFormData = z.infer<typeof interventionFormSchema>;
export type DialysisSession = z.infer<typeof dialysisSessionSchema>;


// These types are derived from parts of other schemas
export type Diagnosis = z.infer<typeof diagnosisSchema>;
export type Medication = z.infer<typeof visitSchema.shape.clinicalData.shape.medications.element>;
export type ClinicalVisitData = z.infer<typeof visitSchema.shape.clinicalData>;
export type InvestigationTest = z.infer<typeof patientSchema.shape.investigationRecords.element.shape.tests.element>;
export type InvestigationRecord = z.infer<typeof patientSchema.shape.investigationRecords.element>;
export type Attachment = { name: string; url: string; };
