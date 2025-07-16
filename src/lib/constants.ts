
import type { DiagnosisEntry, MedicationEntry } from '@/lib/types';

export const GENDERS: string[] = ['Male', 'Female', 'Other', 'Prefer not to say'];

export const BLOOD_GROUPS: string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

export const INDIAN_STATES: string[] = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep', 'Delhi', 'Puducherry', 'Ladakh', 'Jammu and Kashmir'
];

export const RELATIONSHIPS: string[] = [
  'Parent', 'Spouse', 'Sibling', 'Child', 'Guardian', 'Friend', 'Other',
  'F/O', 'S/O', 'W/O', 'M/O', 'D/O'
];

export const MALE_IMPLYING_RELATIONS = ['F/O', 'S/O'];
export const FEMALE_IMPLYING_RELATIONS = ['W/O', 'M/O', 'D/O'];

export const PRIMARY_DIAGNOSIS_OPTIONS: string[] = [
  'Chronic Kidney Disease (CKD)',
  'Acute Kidney Injury (AKI)',
  'Glomerulonephritis',
  'Diabetic Nephropathy',
  'Polycystic Kidney Disease (PKD)',
  'Hypertensive Nephropathy',
  'Kidney Stones',
  'Urinary Tract Infection (UTI) - Complicated',
  'End-Stage Renal Disease (ESRD)',
  'IgA Nephropathy (IgAN)',
  'Focal Segmental Glomerulosclerosis (FSGS)',
  'Systemic Lupus Erythematosus (SLE)',
  'Lupus Nephritis (LN)',
  'Nephrotic Syndrome (NS)',
  'Membranous Glomerulonephritis (MGN)',
  'Minimal Change Disease (MCD)',
  'Proteinuria (PRT)',
  'Congenital Anomalies of the Kidney and Urinary Tract (CAKUT)',
  'Renal Artery Stenosis (RAS)',
  'Transplant Prospect',
  'Potential Kidney Donor',
  'Other',
  'Not Set',
];

export const NUTRITIONAL_STATUSES: string[] = [
  'Well-nourished',
  'Mild malnutrition',
  'Moderate malnutrition',
  'Severe malnutrition',
  'Obese',
  'Not Set',
];

export const DISABILITY_PROFILES: string[] = [
  'None',
  'Mild physical disability',
  'Moderate physical disability',
  'Severe physical disability',
  'Cognitive impairment',
  'Visual impairment',
  'Hearing impairment',
  'Other',
  'Not Set',
];

export const VISIT_REMARK_OPTIONS_GN: string[] = [
  'Routine Checkup',
  'Follow-up',
  'RELAPSE',
  'REMISSION',
  'LOW DRUG LEVEL',
  'HIGH DRUG LEVELS',
  'CHANGED Rx',
  'Initial Consultation',
  'Lab Results Review',
  'Dialysis Session',
  'Transplant Evaluation',
  'Emergency',
];


export const APPOINTMENT_TYPES: string[] = [
  'Routine Checkup',
  'Follow-up',
  'Dialysis Session',
  'Consultation',
  'Emergency',
  'Lab Results Review',
  'Transplant Evaluation',
  'GN Monitoring Visit',
];


export const APPOINTMENT_STATUSES: Array<'Scheduled' | 'Completed' | 'Cancelled' | 'Waiting' | 'Not Showed' | 'Admitted' | 'Now Serving'> =
  ['Scheduled', 'Completed', 'Cancelled', 'Waiting', 'Not Showed', 'Admitted', 'Now Serving'];

export const MOCK_DOCTORS: string[] = [
  'Dr. Anya Sharma',
  'Dr. Vikram Singh',
  'Dr. Priya Patel',
  'Dr. Rohan Gupta',
];

export const TIME_SLOTS: string[] = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00",
];

export const SUBSPECIALITY_FOLLOWUP_OPTIONS: string[] = [
  'NIL', 'Endocrinology', 'Cardiology', 'Gastroenterology', 'Urology', 'Surgery', 'Neurology', 'Gynaecology', 'Rheumatology', 'Ophthalmology (Eye)', 'ENT'
];

export const YES_NO_NIL_OPTIONS: string[] = ['Yes', 'No', 'NIL'];
export const YES_NO_UNKNOWN_OPTIONS: Array<'Yes' | 'No' | 'Unknown'> = ['Yes', 'No', 'Unknown'];


export const VACCINATION_NAMES: string[] = [
  'Hepatitis B', 'Pneumococcal', 'Influenza', 'Covid', 'Varicella'
];

export const VISIT_TYPES: string[] = [
  "Data Entry Visit", "Emergency Visit", "Routine Visit", "Follow-up Visit", "Missed Visit", "Unscheduled Visit", "Initial Assessment"
];

export const PATIENT_GROUP_NAMES: string[] = [
  "Peritoneal Dialysis", "Chronic Kidney disease", "Hemodialysis",
  "Glomerulonephritis", "Kidney transplant", "ADPKD", "Infection", "Misc", "Not Assigned"
];

export const MOCK_DIAGNOSES: DiagnosisEntry[] = [
  { id: 'd001', name: 'Hypertension', icdName: 'Essential (primary) hypertension', icdCode: 'I10' },
  { id: 'd002', name: 'Type 2 Diabetes Mellitus', icdName: 'Type 2 diabetes mellitus without complications', icdCode: 'E11.9' },
  { id: 'd003', name: 'Chronic Kidney Disease, Stage 3', icdName: 'Chronic kidney disease, stage 3 (moderate)', icdCode: 'N18.3' },
  { id: 'd004', name: 'IgA Nephropathy', icdName: 'IgA nephropathy', icdCode: 'N02.8' },
];

export const MOCK_MEDICATIONS: MedicationEntry[] = [
  { id: 'm001', name: 'Amlodipine', defaultDosage: '5mg', defaultFrequency: 'Once Daily', commonInstructions: 'Take with or without food.' },
  { id: 'm002', name: 'Metformin', defaultDosage: '500mg', defaultFrequency: 'Twice Daily', commonInstructions: 'Take with meals to reduce stomach upset.' },
  { id: 'm003', name: 'Telmisartan', defaultDosage: '40mg', defaultFrequency: 'Once Daily', commonInstructions: 'Monitor blood pressure regularly.' },
  { id: 'm004', name: 'Prednisolone', defaultDosage: '10mg', defaultFrequency: 'Once Daily', commonInstructions: 'Take in the morning with food.' },
];

export const INVESTIGATION_GROUPS: string[] = [
  'Hematological', 'Biochemistry', 'Radiology', 'Pathology', 'Special Investigations', 'Urine Analysis', 'Serology'
];

// Medications for Analysis
export const SGLT2_INHIBITORS: string[] = ['Empagliflozin', 'Dapagliflozin', 'Canagliflozin', 'Ertugliflozin'];
export const ARBS: string[] = ['Telmisartan', 'Losartan', 'Valsartan', 'Olmesartan', 'Candesartan', 'Irbesartan'];
export const ACE_INHIBITORS: string[] = ['Ramipril', 'Enalapril', 'Lisinopril', 'Perindopril'];
export const FINERENONE: string = 'Finerenone'; // Specific drug

export const RESIDENCE_TYPES: string[] = ['Rural', 'Urban', 'Semi-Urban', 'Other', 'Not Set'];

export const PATIENT_GROUPS_FOR_ANALYSIS = ["Glomerulonephritis", "Diabetic Kidney Disease", "Hypertensive Nephropathy", "Chronic Kidney Disease (CKD) - General"];
