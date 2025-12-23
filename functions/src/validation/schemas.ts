import { z } from 'zod';

/**
 * Patient Validation Schema
 * Validates all patient data before creation/update
 */
export const patientSchema = z.object({
    // Basic Information
    firstName: z.string()
        .min(1, 'First name is required')
        .max(100, 'First name must be less than 100 characters')
        .trim(),

    lastName: z.string()
        .min(1, 'Last name is required')
        .max(100, 'Last name must be less than 100 characters')
        .trim(),

    dob: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format'),

    gender: z.enum(['Male', 'Female'], {
        errorMap: () => ({ message: 'Gender must be Male or Female' })
    }),

    nephroId: z.string()
        .min(1, 'Nephro ID is required')
        .regex(/^[A-Z0-9\/-]+$/, 'Nephro ID must contain only uppercase letters, numbers, hyphens and slashes'),

    // Contact Information (optional)
    phoneNumber: z.string()
        .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
        .optional()
        .or(z.literal('')),

    email: z.string()
        .email('Invalid email address')
        .optional()
        .or(z.literal('')),

    // Address (optional)
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
        country: z.string().optional(),
    }).optional(),

    // Patient Status
    patientStatus: z.enum(['OPD', 'IPD', 'Discharged']).optional(),
});

export type PatientInput = z.infer<typeof patientSchema>;

/**
 * Dialysis Session Validation Schema
 * Validates dialysis session data
 */
export const dialysisSessionSchema = z.object({
    // Required Fields
    patientId: z.string().min(1, 'Patient ID is required'),
    providerId: z.string().min(1, 'Provider ID is required'),
    sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Session date must be in YYYY-MM-DD format'),

    dialysisType: z.enum(['Hemodialysis', 'Peritoneal Dialysis'], {
        errorMap: () => ({ message: 'Dialysis type must be Hemodialysis or Peritoneal Dialysis' })
    }),

    // Optional: HD Parameters
    hdParams: z.object({
        dryWeight: z.number().positive().optional(),
        weightBefore: z.number().positive().optional(),
        weightAfter: z.number().positive().optional(),
        ultrafiltrationGoal: z.number().nonnegative().optional(),
        ultrafiltrationAchieved: z.number().nonnegative().optional(),
        durationMinutes: z.number().positive().max(600).optional(),
        bloodFlowRate: z.number().positive().optional(),
        dialysateFlowRate: z.number().positive().optional(),
    }).optional(),

    // Optional: Vascular Access
    vascularAccess: z.object({
        accessType: z.enum(['AV Fistula', 'AV Graft', 'Catheter', 'PD Catheter']).optional(),
        accessSite: z.string().optional(),
        complications: z.string().optional(),
    }).optional(),

    // Optional: Vital Signs
    vitalSigns: z.object({
        preHDBP: z.string().optional(),
        duringHDBP: z.string().optional(),
        postHDBP: z.string().optional(),
        preHDPulse: z.number().optional(),
        postHDPulse: z.number().optional(),
    }).optional(),

    // Optional: Status and Notes
    status: z.enum(['Active', 'Completed', 'Cancelled']).optional(),
    complications: z.string().optional(),
    notes: z.string().optional(),
});

export type DialysisSessionInput = z.infer<typeof dialysisSessionSchema>;

/**
 * Visit Validation Schema
 * Validates patient visit data
 */
export const visitSchema = z.object({
    // Required Fields
    patientId: z.string().min(1, 'Patient ID is required'),
    visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Visit date must be in YYYY-MM-DD format'),
    visitType: z.enum(['OPD', 'IPD', 'Emergency']).optional(),

    // Optional: Chief Complaint
    chiefComplaint: z.string().max(500).optional(),

    // Optional: Vital Signs
    vitalSigns: z.object({
        bloodPressure: z.string().optional(),
        pulse: z.number().positive().optional(),
        temperature: z.number().optional(),
        respiratoryRate: z.number().optional(),
        oxygenSaturation: z.number().min(0).max(100).optional(),
        weight: z.number().positive().optional(),
        height: z.number().positive().optional(),
    }).optional(),

    // Optional: Diagnosis
    diagnoses: z.array(
        z.object({
            code: z.string().optional(),
            name: z.string(),
            type: z.enum(['Primary', 'Secondary']).optional(),
        })
    ).optional(),

    // Optional: Medications
    medications: z.array(
        z.object({
            name: z.string(),
            dosage: z.string().optional(),
            frequency: z.string().optional(),
            route: z.string().optional(),
        })
    ).optional(),

    // Optional: Clinical Notes
    clinicalNotes: z.string().optional(),
    treatmentPlan: z.string().optional(),

    // Optional: Follow-up
    followUpDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    followUpInstructions: z.string().optional(),
});

export type VisitInput = z.infer<typeof visitSchema>;

/**
 * Investigation Record Validation Schema
 */
export const investigationSchema = z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    investigationType: z.string().min(1, 'Investigation type is required'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),

    tests: z.array(
        z.object({
            name: z.string(),
            result: z.string(),
            unit: z.string().optional(),
            normalRange: z.string().optional(),
            isAbnormal: z.boolean().optional(),
        })
    ).optional(),

    notes: z.string().optional(),
    reportUrl: z.string().url().optional(),
});

export type InvestigationInput = z.infer<typeof investigationSchema>;
