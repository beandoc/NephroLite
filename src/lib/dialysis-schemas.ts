// Update the dialysis schemas to include additional fields shown in the UI

import { z } from 'zod';

// Blood Pressure Reading Schema
export const bpReadingSchema = z.object({
    systolic: z.number().min(0).max(300).optional(),
    diastolic: z.number().min(0).max(200).optional(),
});

// Blood Pressure Monitoring Schema  
export const bpMonitoringSchema = z.object({
    preSession: bpReadingSchema.optional(),
    duringSession: z.array(bpReadingSchema).optional(),
    peakBP: bpReadingSchema.optional(),
    nadirBP: bpReadingSchema.optional(),
    postSession: bpReadingSchema.optional(),
});

// Hemodialysis Parameters Schema
export const hdParamsSchema = z.object({
    ultrafiltrationVolume: z.number().min(0).optional(), // mL
    fluidRemovalTolerance: z.string().optional(),
    weightBefore: z.number().min(0).optional(), // kg
    weightAfter: z.number().min(0).optional(), // kg
    bloodFlowRate: z.number().min(0).optional(), // ml/min
    dialysateFlowRate: z.number().min(0).optional(), // ml/min
    dialyzerType: z.string().optional(),
    dialyzerSurfaceArea: z.number().min(0).optional(), // m²
});

// Vascular Access Schema
export const vascularAccessSchema = z.object({
    accessType: z.enum(['AV Fistula', 'AV Graft', 'Catheter', 'Tunneled Catheter', 'Temporary Catheter']).optional(),
    location: z.string().optional(),
    creationDate: z.string().optional(),
    anticoagulation: z.string().optional(), // e.g., "Heparin"
    condition: z.string().optional(),
    interventionsPerformed: z.string().optional(),
    accessRelatedComplications: z.string().optional(),
});

// Peritoneal Dialysis Parameters Schema
export const pdParamsSchema = z.object({
    fluidType: z.string().optional(), // e.g., "Dextrose 1.5%"
    fluidVolumeUsed: z.number().min(0).optional(), // liters
    icodextrinUsage: z.boolean().optional(),
    dwellTimeDuration: z.number().min(0).optional(), // hours
});

// Medications Schema
export const medicationsSchema = z.object({
    administered: z.string().optional(),
    drugAllergies: z.string().optional(),
});

// Complications Schema
export const complicationsSchema = z.object({
    hasComplication: z.boolean().optional(),
    description: z.string().optional(),
    management: z.string().optional(), // Management actions taken
});

// Consent Schema
export const consentSchema = z.object({
    researchDataSharing: z.boolean().optional(),
});

// Main Dialysis Session Schema
export const dialysisSessionSchema = z.object({
    id: z.string(),

    // Basic Information
    patientId: z.string(),
    patientName: z.string(), // Denormalized
    providerId: z.string(),
    providerName: z.string(), // Denormalized
    sessionDate: z.string(), // ISO format
    dialysisType: z.enum(['HD', 'PD']),
    sessionLocation: z.string(),
    healthcareFacility: z.string(),

    // Clinical Details
    indication: z.string().optional(), // CKD/AKI
    nativeKidneyDisease: z.string().optional(),
    comorbidities: z.array(z.string()).optional(),
    dialysisModality: z.enum(['HD', 'HDF', 'PD', 'CAPD', 'APD']).optional(),
    previousDialysisModality: z.string().optional(),
    dialysisInitiationDate: z.string().optional(),
    sessionDuration: z.string().optional(), // HH:MM format
    dryWeight: z.number().min(0).optional(), // kg

    // Hemodialysis Parameters (HD only)
    hdParams: hdParamsSchema.optional(),

    // Blood Pressure Monitoring
    bpMonitoring: bpMonitoringSchema.optional(),

    // Vascular Access (HD only)
    vascularAccess: vascularAccessSchema.optional(),

    // Peritoneal Dialysis (PD only)
    pdParams: pdParamsSchema.optional(),

    // Medications
    medications: medicationsSchema.optional(),

    // Complications
    complications: complicationsSchema.optional(),

    // Additional Information
    dialysisAdherence: z.string().optional(),
    concernsForDoctor: z.string().optional(),
    nextSessionId: z.string().optional(),

    // Consent
    consent: consentSchema.optional(),

    // Metadata
    createdAt: z.string(),
    createdBy: z.string(),
    updatedAt: z.string().optional(),
    updatedBy: z.string().optional(),
    staffId: z.string(),
    status: z.enum(['Active', 'Pending', 'Inactive']).optional(),
});

// Derived Types
export type BPReading = z.infer<typeof bpReadingSchema>;
export type BPMonitoring = z.infer<typeof bpMonitoringSchema>;
export type HDParams = z.infer<typeof hdParamsSchema>;
export type VascularAccess = z.infer<typeof vascularAccessSchema>;
export type PDParams = z.infer<typeof pdParamsSchema>;
export type Medications = z.infer<typeof medicationsSchema>;
export type Complications = z.infer<typeof complicationsSchema>;
export type Consent = z.infer<typeof consentSchema>;
export type DialysisSession = z.infer<typeof dialysisSessionSchema>;

// Form Data Schema
export const dialysisSessionFormSchema = dialysisSessionSchema.omit({
    id: true,
    createdAt: true,
    createdBy: true,
    updatedAt: true,
    updatedBy: true,
    staffId: true,
});

export type DialysisSessionFormData = z.infer<typeof dialysisSessionFormSchema>;
