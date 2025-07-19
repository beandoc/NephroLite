
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

// Comprehensive Clinical Visit Templates
export const DIAGNOSIS_TEMPLATES: Record<string, DiagnosisTemplate> = {
  "Hypertensive Nephropathy": {
    templateName: "Hypertensive Nephropathy",
    templateType: "Discharge Summary",
    diagnoses: [{ name: "Hypertensive Nephropathy", icdCode: "I12.9" }],
    history: "Patient is a known case of hypertension for the last 5 years, presents with pedal edema and decreased urine output.",
    generalExamination: "Bilateral pitting pedal edema present. No pallor, icterus, or clubbing.",
    systemicExamination: "CVS: S1, S2 normal, no murmurs. Respiratory: Bilateral air entry equal, no added sounds. Abdomen: Soft, non-tender.",
    medications: [
      { name: 'Telmisartan', dosage: '80mg', frequency: 'OD', instructions: 'After food' },
      { name: 'Amlodipine', dosage: '10mg', frequency: 'OD', instructions: 'After food' },
      { name: 'Torsemide', dosage: '20mg', frequency: 'OD', instructions: 'In the morning' },
    ],
    dischargeInstructions: "Advised low salt diet. Monitor BP daily. Follow up in 2 weeks with KFT, Urine R/M reports.",
  },
  "Diabetic Nephropathy": {
    templateName: "Diabetic Nephropathy",
    templateType: "Discharge Summary",
    diagnoses: [{ name: "Diabetic Nephropathy", icdCode: "E11.21" }],
    history: "Patient with Type 2 Diabetes for 10 years, complains of frothy urine and progressive swelling of feet.",
    generalExamination: "Fundoscopy shows background diabetic retinopathy. Pedal edema present.",
    systemicExamination: "Peripheral neuropathy present in both lower limbs. CVS and Respiratory systems are normal.",
    medications: [
      { name: 'Metformin', dosage: '1g', frequency: 'BD', instructions: 'After food' },
      { name: 'Dapagliflozin', dosage: '10mg', frequency: 'OD', instructions: 'After breakfast' },
      { name: 'Atorvastatin', dosage: '20mg', frequency: 'HS', instructions: 'At bedtime' },
      { name: 'Ramipril', dosage: '5mg', frequency: 'OD', instructions: '' },
    ],
    dischargeInstructions: "Strict glycemic control. Low protein diet. Monitor blood sugar levels and report to endocrinology.",
  },
  "IgA Nephropathy": {
    templateName: "IgA Nephropathy",
    templateType: "Opinion Report",
    diagnoses: [{ name: "IgA Nephropathy", icdCode: "N03.3", icdName: "Chronic nephritic syndrome, diffuse mesangial proliferative" }],
    history: "Patient was detected to have proteinuria/ hypertension/ renal dysfunction during evaluation. He denies any history of hematuria, oliguria, nocturia, swelling of face or feet at any time. There was no preceding skin rash, arthritis, oral ulcers, nephrotoxic drug use. No history of NSAID's or alternative medication use. His 24 hr urine protein excretion was _____ mg/day. He was subjected to a kidney biopsy which was reported as IgA nephropathy. He was initiated on oral steroids and ARB's. Due for Nephrologist opinion",
    generalExamination: "No pallor, pedal edema. Systemically : NAD",
    systemicExamination: "CVS: S1, S2 normal, no murmurs. Respiratory: Bilateral air entry equal, no added sounds. Abdomen: Soft, non-tender.",
    medications: [
      { name: 'Tab Telmisartan', dosage: '40 mg', frequency: 'OD' },
      { name: 'Tab Empagliflozin', dosage: '25 mg', frequency: 'OD' },
    ],
    opinionText: "Patient has IgA nephropathy related subnephrotic proteinuria with normal renal function and normal BP. The secondary causes of IgA Nephropathy have been reasonably ruled out on history and evaluation. He has been given a course of steroids and tapered, and his proteinuria is __ gm/day. He is planned to be kept on ACE-I or ARB's/ SGLT2-i to max tolerated doses. He will need continued observation and periodic review. His risk assessment was done to predict the risk of a 50% decline in eGFR or ESRD after 5 yrs of biopsy by International IgA prediction tool was _____ % ( https://qxmd.com/calculate/calculator_499/international-igan-prediction-tool-adults ) (Jama 2019). He has been counseled about the prognosis of his disease and the precautions he needs to observe. He has been vaccinated. He will need continued observation and periodic review.",
    recommendations: `Medical Classification recommended:\nMedical Classification: SHAPE -3 ( x )\nDisability Profile: P3 (T-24) for\nClinical Diagnosis: IgA Nephropathy \nICD-10 Diagnosis & Code: Chronic nephritic syndrome, diffuse mesangial proliferative (N03.3)\n\nMedical recommendations and employability restrictions as per Code ‘E’ (impacting functional status of the indl), if any, with justification: As per AO 3/2001\n\nAny other advice (with justification):\nSalt restricted 2100 KCal low saturated fat diet.\nAvoid nephrotoxic drugs, dehydration, and strenuous physical exercise.\nMonthly review in Medical OPD and 03 monthly review in Nephrology OPD with fresh inv reports.\nNext recat at Nephrology Centre`,
    usgReport: "( No____ dt ____ CH(SC): Normal scan",
    kidneyBiopsyReport: "Kidney Biopsy (No: Dt ______ 25): __ glomeruli, of which _ are globally sclerosed. Rest show mild to moderate mesangial proliferation in segmental distribution with segmental glomerular crescents in _ (_cellular, _ fibrocellular and _ fibrous). Patchy tubular atrophy associated with interstitial fibrosis and inflammation in __% of visualized tissue.  IF: Ig A (2+), C3 (3+), kappa (2+) and Lambda (3+). IgG, IgM and C1q are negative. Impression: IgA nephropathy with IFTA of _ %. MEST Score: (M0 E0 S0 T0-C0)",
  },
  "Chronic Kidney Disease": {
    templateName: "Chronic Kidney Disease",
    templateType: "Opinion Report",
    diagnoses: [
      { name: "CKD Stage 1", icdCode: "N18.1" },
      { name: "CKD Stage 2", icdCode: "N18.2" },
      { name: "CKD Stage 3", icdCode: "N18.3" },
      { name: "CKD Stage 4", icdCode: "N18.4" },
      { name: "CKD Stage 5", icdCode: "N18.5" },
      { name: "End-stage renal disease", icdCode: "N18.6" },
    ],
    history: "Patient was detected to be hypertensive ( BP _______ mm Hg) during medical examination. No complains of headache, chest pain, swelling of both lower limbs. No complains of hematuria, oliguria, froth in urine. No h/o joint pain, rash, oral ulcers, alopecia. No h/o alternative medication or chronic NSAID intake. Evaluation showed azotemia ( Creatinine ___ mg/dl). USG KUB showed B/L small echogenic kidneys. He was referred for Nephrology evaluation at CHSC. Due for opinion.",
    generalExamination: "No pallor, pedal edema. Fundus: No evidence of retinopathy. Systemic exam: NAD",
    systemicExamination: "NAD",
    medications: [
      { name: 'Tab Amlodipine', dosage: '10 mg', frequency: 'OD' },
      { name: 'Tab Met XL', dosage: '25 mg', frequency: 'BD' },
      { name: 'Tab Sodabicarbonate', dosage: '500 mg', frequency: 'TDS' },
      { name: 'Tab Rantac', dosage: '150 mg', frequency: 'BD' },
      { name: 'Tab F/A', dosage: '5 mg', frequency: 'OD' },
      { name: 'Calcirol sachet', dosage: '60,000 IU/month', frequency: 'Monthly' },
    ],
    opinionText: "This patient detected to have chronic kidney disease during evaluation of hypertension. His autoimmune workup was negative. His BP has been controlled with anti hypertensive drugs and he has evidence of hypertension related target organ damage. Non oliguric at present. His present eGFR is ( ______ ml/min/1.73 sqm BSA). He has been counseled about the prognosis of his disease and the precautions he needs to observe. He will require initiation of RRT once uremic symptoms appear. He has been vaccinated against HBV. He will need continued observation and periodic review.",
    recommendations: `Medical Classification recommended:\nMedical Classification: SHAPE -3 ( x )\nDisability Profile: P3 (T-24) for\nClinical diagnosis: CHRONIC KIDNEY DISEASE Stage 5\nICD code and Diagnosis: N18.5, Chronic kidney disease, stage 5\n\nMedical recommendations and employability restrictions as per Code ‘E’ (impacting functional status of the indl), if any, with justification: As per AO 3/2001\nUnfit for HAA\nTo be posted to a place within 04 hrs travelling to a service nephrology centre\n\nAny other advice (with justification):\nSalt restricted 2100 KCal low saturated fat diet\nAvoid nephrotoxic drugs, NSAIDs\nMonthly review in Nephro OPD with CBC, RFT and electrolytes report\nNext Recat at Nephrology centre`,
    usgReport: "Bilateral echogenic kidney. No HDN",
    kidneyBiopsyReport: "Not applicable.",
  }
};

    
    