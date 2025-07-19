

import type { DiagnosisEntry, MedicationEntry, Medication, DiagnosisTemplate } from '@/lib/types';

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
  'Self', 'Parent', 'Spouse', 'Sibling', 'Child', 'Guardian', 'Friend', 'Other',
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
  "Data Entry Visit", "Emergency Visit", "Routine Visit", "Missed Visit", "Unscheduled Visit"
];

export const PATIENT_GROUP_NAMES: string[] = [
  "Peritoneal Dialysis", "Chronic Kidney disease", "Hemodialysis",
  "Glomerulonephritis", "Kidney transplant", "ADPKD", "Misc", "Infection"
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

export const DIAGNOSIS_MEDICATION_TEMPLATES: Record<string, Omit<Medication, 'id'>[]> = {
  'Hypertensive Nephropathy': [
    { name: 'Telmisartan', dosage: '40mg', frequency: 'OD', instructions: 'After food' },
    { name: 'Amlodipine', dosage: '5mg', frequency: 'OD', instructions: 'After food' },
  ],
  'Diabetic Nephropathy': [
    { name: 'Metformin', dosage: '500mg', frequency: 'BD', instructions: 'After food' },
    { name: 'Dapagliflozin', dosage: '10mg', frequency: 'OD', instructions: 'After breakfast' },
    { name: 'Atorvastatin', dosage: '10mg', frequency: 'HS', instructions: 'At bedtime' },
  ],
  'Chronic Kidney Disease (CKD)': [
      { name: 'Calcirol Sachet', dosage: '60000 IU', frequency: 'Weekly', instructions: 'Once a week with milk' },
      { name: 'Ferrous Ascorbate', dosage: '100mg', frequency: 'OD', instructions: 'After food' },
  ],
  'Glomerulonephritis': [
      { name: 'Prednisolone', dosage: '40mg', frequency: 'OD', instructions: 'After breakfast' },
      { name: 'Mycophenolate mofetil', dosage: '500mg', frequency: 'BD', instructions: 'After food' },
  ],
};


// Medications for Analysis
export const SGLT2_INHIBITORS: string[] = ['Empagliflozin', 'Dapagliflozin', 'Canagliflozin', 'Ertugliflozin'];
export const ARBS: string[] = ['Telmisartan', 'Losartan', 'Valsartan', 'Olmesartan', 'Candesartan', 'Irbesartan'];
export const ACE_INHIBITORS: string[] = ['Ramipril', 'Enalapril', 'Lisinopril', 'Perindopril'];
export const FINERENONE: string = 'Finerenone'; // Specific drug

export const RESIDENCE_TYPES: string[] = ['Rural', 'Urban', 'Semi-Urban', 'Other', 'Not Set'];

export const PATIENT_GROUPS_FOR_ANALYSIS = ["Glomerulonephritis", "Diabetic Kidney Disease", "Hypertensive Nephropathy", "Chronic Kidney Disease (CKD) - General"];


// Comprehensive Clinical Visit Templates
export const DIAGNOSIS_TEMPLATES: Record<string, DiagnosisTemplate> = {
  "Hypertensive Nephropathy": {
    diagnoses: [{ name: "Hypertensive Nephropathy", icdCode: "I12.9" }],
    history: "Patient is a known case of hypertension for the last 5 years, presents with pedal edema and decreased urine output.",
    height: "170",
    weight: "85",
    pulse: "88",
    systolicBP: "160",
    diastolicBP: "100",
    respiratoryRate: "16",
    generalExamination: "Bilateral pitting pedal edema present. No pallor, icterus, or clubbing.",
    systemicExamination: "CVS: S1, S2 normal, no murmurs. Respiratory: Bilateral air entry equal, no added sounds. Abdomen: Soft, non-tender.",
    courseInHospital: "",
    dischargeInstructions: "Advised low salt diet. Monitor BP daily. Follow up in 2 weeks with KFT, Urine R/M reports.",
    medications: [
      { name: 'Telmisartan', dosage: '80mg', frequency: 'OD', instructions: 'After food' },
      { name: 'Amlodipine', dosage: '10mg', frequency: 'OD', instructions: 'After food' },
      { name: 'Torsemide', dosage: '20mg', frequency: 'OD', instructions: 'In the morning' },
    ],
    opinionText: "The patient has uncontrolled hypertension leading to hypertensive nephropathy. The current management focuses on aggressive blood pressure control to slow the progression of kidney disease.",
    recommendations: "1. Strict BP control (target < 130/80 mmHg). \n2. Salt and fluid restriction. \n3. Regular monitoring of kidney function tests."
  },
  "Diabetic Nephropathy": {
    diagnoses: [{ name: "Diabetic Nephropathy", icdCode: "E11.21" }],
    history: "Patient with Type 2 Diabetes for 10 years, complains of frothy urine and progressive swelling of feet.",
    height: "165",
    weight: "78",
    pulse: "80",
    systolicBP: "140",
    diastolicBP: "90",
    respiratoryRate: "18",
    generalExamination: "Fundoscopy shows background diabetic retinopathy. Pedal edema present.",
    systemicExamination: "Peripheral neuropathy present in both lower limbs. CVS and Respiratory systems are normal.",
    courseInHospital: "",
    dischargeInstructions: "Strict glycemic control. Low protein diet. Monitor blood sugar levels and report to endocrinology.",
    medications: [
      { name: 'Metformin', dosage: '1g', frequency: 'BD', instructions: 'After food' },
      { name: 'Dapagliflozin', dosage: '10mg', frequency: 'OD', instructions: 'After breakfast' },
      { name: 'Atorvastatin', dosage: '20mg', frequency: 'HS', instructions: 'At bedtime' },
      { name: 'Ramipril', dosage: '5mg', frequency: 'OD', instructions: '' },
    ],
    opinionText: "The patient's clinical presentation is consistent with diabetic nephropathy. The key to management is multifactorial: optimal glycemic and blood pressure control, and use of RAAS inhibitors and SGLT2 inhibitors.",
    recommendations: "1. Maintain HbA1c < 7.0%. \n2. Regular screening for retinopathy and neuropathy. \n3. Urine for microalbuminuria assessment every 6 months."
  }
};
