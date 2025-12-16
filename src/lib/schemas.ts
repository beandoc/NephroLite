

import { z } from 'zod';
import { GENDERS, INDIAN_STATES, RELATIONSHIPS, PRIMARY_DIAGNOSIS_OPTIONS, NUTRITIONAL_STATUSES, DISABILITY_PROFILES, BLOOD_GROUPS, VACCINATION_NAMES, VISIT_TYPES, PATIENT_GROUP_NAMES, RESIDENCE_TYPES, APPOINTMENT_TYPES, APPOINTMENT_STATUSES, MOCK_DOCTORS, INVESTIGATION_GROUPS, RESULT_TYPES, INTERVENTION_TYPES, CATHETER_SITES, CUFFED_CATHETER_SITES, CAPD_CATHETER_TYPES, CAPD_INSERTION_TECHNIQUES, AV_FISTULA_TYPES, DIALYSIS_INDICATIONS, COMORBIDITIES, DIALYSIS_TYPES, HD_MODALITIES, SESSION_LOCATIONS, ACCESS_TYPES, ANTICOAGULATION_TYPES, VASCULAR_ACCESS_LOCATIONS } from './constants';

export const doseSchema = z.object({
  id: z.string(),
  doseNumber: z.number(),
  administered: z.boolean(),
  date: z.string().nullable(),
});

export const vaccinationSchema = z.object({
  name: z.enum(VACCINATION_NAMES),
  totalDoses: z.number(),
  nextDoseDate: z.string().nullable(),
  doses: z.array(doseSchema),
});

export const interventionSchema = z.object({
  id: z.string(),
  date: z.string(),
  type: z.enum(INTERVENTION_TYPES),
  details: z.record(z.string().or(z.boolean())).optional(),
  notes: z.string().optional(),
  complications: z.string().optional(),
  attachments: z.array(z.object({ name: z.string(), url: z.string() })).optional(),
});

export const clinicalProfileSchema = z.object({
  primaryDiagnosis: z.string().optional(),
  tags: z.array(z.string()).optional(),
  nutritionalStatus: z.string().optional(),
  disability: z.string().optional(),
  subspecialityFollowUp: z.string().optional(),
  smokingStatus: z.string().optional(),
  alcoholConsumption: z.string().optional(),
  pomr: z.string().optional(),
  aabhaNumber: z.string().optional(),
  bloodGroup: z.string().optional(),
  drugAllergies: z.string().optional(),
  whatsappNumber: z.string().optional(),
  vaccinations: z.array(vaccinationSchema),
  hasDiabetes: z.boolean().optional(),
  onAntiHypertensiveMedication: z.boolean().optional(),
  onLipidLoweringMedication: z.boolean().optional(),
  // Disability tracking fields
  pastMedicalClassification: z.string().optional(),
  primaryDisability: z.string().optional(),
  disabilityLocationOfOnset: z.string().optional(),
  disabilityDateOfOnset: z.string().optional(),
  pdDispositionValue: z.string().optional(),
});

export const diagnosisSchema = z.object({
  id: z.string(),
  name: z.string(),
  icdName: z.string().optional(),
  icdCode: z.string().optional(),
});

export const medicationSchema = z.object({
  id: z.string(),
  name: z.string(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  instructions: z.string().optional(),
});

export const clinicalVisitDataSchema = z.object({
  diagnoses: z.array(diagnosisSchema).optional(),
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
  medications: z.array(medicationSchema).optional(),
  opinionText: z.string().optional(),
  recommendations: z.string().optional(),
  usgReport: z.string().optional(),
  kidneyBiopsyReport: z.string().optional(),
  serumCreatinine: z.string().optional(),
  uacr: z.string().optional(),
  totalCholesterol: z.string().optional(),
  hdlCholesterol: z.string().optional(),
  // Military-specific fields
  disabilityProfile: z.string().optional(),
  disabilityDetails: z.string().optional(),
  serviceNumber: z.string().optional(),
  unitName: z.string().optional(),
  formation: z.string().optional(),
});

export const visitSchema = z.object({
  id: z.string(),
  date: z.string(),
  createdAt: z.string(),
  visitType: z.string(),
  visitRemark: z.string(),
  groupName: z.string(),
  patientGender: z.enum(GENDERS).optional(),
  patientRelation: z.string().optional(),
  diagnoses: z.array(diagnosisSchema).optional(),
  clinicalData: clinicalVisitDataSchema.optional(),
  patientId: z.string(),
});

export const investigationTestSchema = z.object({
  id: z.string(),
  group: z.string(),
  name: z.string(),
  result: z.string(),
  unit: z.string().optional(),
  normalRange: z.string().optional(),
  resultType: z.enum(RESULT_TYPES).optional(),
  options: z.array(z.string()).optional(),
});

export const investigationRecordSchema = z.object({
  id: z.string(),
  date: z.string(),
  tests: z.array(investigationTestSchema),
  notes: z.string().optional(),
});

export const dialysisSessionSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  dateOfSession: z.string(),
  indicationOfDialysis: z.array(z.string()).optional(),
  nativeKidneyDisease: z.array(z.string()).optional(),
  comorbidities: z.array(z.string()).optional(),
  typeOfDialysis: z.enum(DIALYSIS_TYPES),
  dialysisModality: z.enum(HD_MODALITIES).optional(),
  previousDialysisModality: z.enum(DIALYSIS_TYPES).optional(),
  dateOfDialysisInitiation: z.string().optional(),
  locationOfSession: z.enum(SESSION_LOCATIONS).optional(),
  facility: z.string().optional(),
  duration: z.object({ hours: z.number(), minutes: z.number() }),
  dryWeight: z.number().optional(),
  ultrafiltration: z.number().optional(),
  fluidRemovalTolerance: z.boolean().optional(),
  weightBefore: z.number().optional(),
  weightAfter: z.number().optional(),
  complicationsFlag: z.boolean(),
  complicationsDesc: z.array(z.string()).optional(),
  complicationsManagementDesc: z.array(z.string()).optional(),
  bpBefore: z.object({ systolic: z.number().optional(), diastolic: z.number().optional() }).optional(),
  bpDuring: z.string().optional(),
  bpPeak: z.object({ systolic: z.number().optional(), diastolic: z.number().optional() }).optional(),
  bpNadir: z.object({ systolic: z.number().optional(), diastolic: z.number().optional() }).optional(),
  bpAfter: z.object({ systolic: z.number().optional(), diastolic: z.number().optional() }).optional(),
  pdFluidType: z.string().optional(),
  pdFluidVolume: z.number().optional(),
  accessType: z.enum(ACCESS_TYPES),
  vascularAccessLocation: z.string().optional(),
  dateOfAccessCreation: z.string().optional(),
  anticoagulation: z.enum(ANTICOAGULATION_TYPES).optional(),
  bloodFlowRate: z.number().optional(),
  dialysateFlowRate: z.number().optional(),
  dialyzerType: z.string().optional(),
  dialyzerSurfaceArea: z.number().optional(),
  medicationsAdministered: z.string().optional(),
  drugAllergies: z.string().optional(),
  vascularAccessCondition: z.string().optional(),
  vascularInterventionsPerformed: z.string().optional(),
  accessRelatedComplications: z.string().optional(),
  anyConcernsForDoctor: z.string().optional(),
  nextScheduledSession: z.string().optional(),
  dialysisAdherence: z.number().optional(),
});


export const patientSchema = z.object({
  id: z.string(),
  nephroId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dob: z.string(),
  gender: z.enum(GENDERS),
  contact: z.string().optional(),
  email: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    country: z.string().optional(),
  }),
  guardian: z.object({
    name: z.string().optional(),
    relation: z.string().optional(),
    contact: z.string().optional(),
  }),
  clinicalProfile: clinicalProfileSchema,
  registrationDate: z.string(),
  createdAt: z.string(),
  serviceName: z.string().optional(),
  serviceNumber: z.string().optional(),
  rank: z.string().optional(),
  unitName: z.string().optional(),
  formation: z.string().optional(),
  patientStatus: z.enum(['OPD', 'IPD', 'Discharged']),
  nextAppointmentDate: z.string().optional().nullable(),
  isTracked: z.boolean(),
  residenceType: z.enum(RESIDENCE_TYPES).optional(),
  visits: z.array(visitSchema),
  investigationRecords: z.array(investigationRecordSchema).optional(),
  interventions: z.array(interventionSchema).optional(),
  dialysisSessions: z.array(dialysisSessionSchema).optional(),
});

export const patientFormDataSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  dob: z.string().min(1, "Date of birth is required."),
  gender: z.enum(GENDERS),
  contact: z.string().optional(),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  whatsappNumber: z.string().optional(),
  uhid: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }),
  guardian: z.object({
    name: z.string().optional(),
    relation: z.string().optional(),
    contact: z.string().optional(),
  }),
});

export type PatientFormData = z.infer<typeof patientFormDataSchema>;

export const appointmentSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  date: z.string(),
  createdAt: z.string(),
  time: z.string(),
  type: z.string(),
  doctorName: z.string(),
  notes: z.string().optional(),
  status: z.enum(APPOINTMENT_STATUSES),
});

export const appointmentFormSchema = z.object({
  patientId: z.string().min(1, "Please select a patient."),
  date: z.string().min(1, "Please select a date."),
  time: z.string().min(1, "Please select a time slot."),
  type: z.string().min(1, "Please select an appointment type."),
  doctorName: z.string().min(1, "Please select a doctor."),
  notes: z.string().optional(),
});
export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;


export const icdMappingSchema = z.object({
  icdCode: z.string(),
  icdName: z.string(),
});

export const masterDiagnosisSchema = z.object({
  id: z.string(),
  clinicalDiagnosis: z.string(),
  icdMappings: z.array(icdMappingSchema),
});

export const investigationMasterSchema = z.object({
  id: z.string(),
  name: z.string(),
  group: z.enum(INVESTIGATION_GROUPS),
  unit: z.string().optional(),
  normalRange: z.string().optional(),
  resultType: z.enum(RESULT_TYPES).default('numeric'),
  options: z.array(z.string()).optional(),
});

export const investigationPanelSchema = z.object({
  id: z.string(),
  name: z.string(),
  group: z.enum(INVESTIGATION_GROUPS),
  testIds: z.array(z.string()),
});

export const visitFormDataSchema = z.object({
  visitType: z.string().min(1, "Visit type is required."),
  visitRemark: z.string().min(1, "Visit remark is required."),
  groupName: z.string().min(1, "Group name is required."),
});

export const diagnosisTemplateSchema = z.object({
  templateName: z.string(),
  templateType: z.enum(["Opinion Report", "Discharge Summary"]),
  diagnoses: z.array(diagnosisSchema),
  history: z.string().optional(),
  generalExamination: z.string().optional(),
  systemicExamination: z.string().optional(),
  medications: z.array(medicationSchema),
  dischargeInstructions: z.string().optional(),
  usgReport: z.string().optional(),
  kidneyBiopsyReport: z.string().optional(),
  opinionText: z.string().optional(),
  recommendations: z.string().optional(),
});

export const investigationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Test name is required.'),
  group: z.enum(INVESTIGATION_GROUPS, { required_error: 'Group is required.' }),
  unit: z.string().optional(),
  normalRange: z.string().optional(),
  resultType: z.enum(RESULT_TYPES).optional(),
  options: z.array(z.string()).optional(),
});
export type InvestigationFormData = z.infer<typeof investigationSchema>;


export const panelSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Panel name is required.'),
  group: z.enum(INVESTIGATION_GROUPS, { required_error: 'Group is required.' }),
  testIds: z.array(z.object({ id: z.string() })).min(1, 'At least one test must be selected.'),
});
export type PanelFormData = z.infer<typeof panelSchema>;


// New schema for the intervention form
export const interventionFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  type: z.enum(INTERVENTION_TYPES, {
    required_error: "Intervention type is required",
  }),
  notes: z.string().optional(),
  complications: z.string().optional(),
  attachments: z.array(z.object({ name: z.string(), url: z.string() })).optional(),
  // Dynamic fields based on type
  catheterSite: z.enum(CATHETER_SITES).optional(),
  cuffedCatheterSite: z.enum(CUFFED_CATHETER_SITES).optional(),
  isCatheterRemoved: z.boolean().optional(),
  capdCatheterType: z.enum(CAPD_CATHETER_TYPES).optional(),
  capdInsertionTechnique: z.enum(CAPD_INSERTION_TECHNIQUES).optional(),
  isCapdCatheterRemoved: z.boolean().optional(),
  avFistulaType: z.enum(AV_FISTULA_TYPES).optional(),
  endoInterventionDetails: z.string().optional(),
});
export type InterventionFormData = z.infer<typeof interventionFormSchema>;
