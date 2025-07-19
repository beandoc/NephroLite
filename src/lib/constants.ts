
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
  { id: 'n00', name: 'Acute nephritic syndrome', icdCode: 'N00', icdName: 'Acute nephritic syndrome' },
  { id: 'n00.0', name: 'Acute nephritic syndrome, minor glomerular abnormality', icdCode: 'N00.0', icdName: 'Acute nephritic syndrome, minor glomerular abnormality' },
  { id: 'n00.1', name: 'Acute nephritic syndrome, focal and segmental glomerular lesions', icdCode: 'N00.1', icdName: 'Acute nephritic syndrome, focal and segmental glomerular lesions' },
  { id: 'n00.2', name: 'Acute nephritic syndrome, diffuse membranous glomerulonephritis', icdCode: 'N00.2', icdName: 'Acute nephritic syndrome, diffuse membranous glomerulonephritis' },
  { id: 'n00.3', name: 'Acute nephritic syndrome, diffuse mesangial proliferative glomerulonephritis', icdCode: 'N00.3', icdName: 'Acute nephritic syndrome, diffuse mesangial proliferative glomerulonephritis' },
  { id: 'n00.4', name: 'Acute nephritic syndrome, diffuse endocapillary proliferative glomerulonephritis', icdCode: 'N00.4', icdName: 'Acute nephritic syndrome, diffuse endocapillary proliferative glomerulonephritis' },
  { id: 'n00.5', name: 'Acute nephritic syndrome, diffuse mesangiocapillary glomerulonephritis', icdCode: 'N00.5', icdName: 'Acute nephritic syndrome, diffuse mesangiocapillary glomerulonephritis' },
  { id: 'n00.6', name: 'Acute nephritic syndrome, dense deposit disease', icdCode: 'N00.6', icdName: 'Acute nephritic syndrome, dense deposit disease' },
  { id: 'n00.7', name: 'Acute nephritic syndrome, diffuse crescentic glomerulonephritis', icdCode: 'N00.7', icdName: 'Acute nephritic syndrome, diffuse crescentic glomerulonephritis' },
  { id: 'n00.8', name: 'Acute nephritic syndrome, other', icdCode: 'N00.8', icdName: 'Acute nephritic syndrome, other' },
  { id: 'n00.9', name: 'Acute nephritic syndrome, unspecified', icdCode: 'N00.9', icdName: 'Acute nephritic syndrome, unspecified' },
  { id: 'n01', name: 'Rapidly progressive nephritic syndrome', icdCode: 'N01', icdName: 'Rapidly progressive nephritic syndrome' },
  { id: 'n01.0', name: 'Rapidly progressive nephritic syndrome, minor glomerular abnormality', icdCode: 'N01.0', icdName: 'Rapidly progressive nephritic syndrome, minor glomerular abnormality' },
  { id: 'n01.1', name: 'Rapidly progressive nephritic syndrome, focal and segmental glomerular lesions', icdCode: 'N01.1', icdName: 'Rapidly progressive nephritic syndrome, focal and segmental glomerular lesions' },
  { id: 'n01.2', name: 'Rapidly progressive nephritic syndrome, diffuse membranous glomerulonephritis', icdCode: 'N01.2', icdName: 'Rapidly progressive nephritic syndrome, diffuse membranous glomerulonephritis' },
  { id: 'n01.3', name: 'Rapidly progressive nephritic syndrome, diffuse mesangial proliferative glomerulonephritis', icdCode: 'N01.3', icdName: 'Rapidly progressive nephritic syndrome, diffuse mesangial proliferative glomerulonephritis' },
  { id: 'n01.4', name: 'Rapidly progressive nephritic syndrome, diffuse endocapillary proliferative glomerulonephritis', icdCode: 'N01.4', icdName: 'Rapidly progressive nephritic syndrome, diffuse endocapillary proliferative glomerulonephritis' },
  { id: 'n01.5', name: 'Rapidly progressive nephritic syndrome, diffuse mesangiocapillary glomerulonephritis', icdCode: 'N01.5', icdName: 'Rapidly progressive nephritic syndrome, diffuse mesangiocapillary glomerulonephritis' },
  { id: 'n01.6', name: 'Rapidly progressive nephritic syndrome, dense deposit disease', icdCode: 'N01.6', icdName: 'Rapidly progressive nephritic syndrome, dense deposit disease' },
  { id: 'n01.7', name: 'Rapidly progressive nephritic syndrome, diffuse crescentic glomerulonephritis', icdCode: 'N01.7', icdName: 'Rapidly progressive nephritic syndrome, diffuse crescentic glomerulonephritis' },
  { id: 'n01.8', name: 'Rapidly progressive nephritic syndrome, other', icdCode: 'N01.8', icdName: 'Rapidly progressive nephritic syndrome, other' },
  { id: 'n01.9', name: 'Rapidly progressive nephritic syndrome, unspecified', icdCode: 'N01.9', icdName: 'Rapidly progressive nephritic syndrome, unspecified' },
  { id: 'n02', name: 'Recurrent and persistent haematuria', icdCode: 'N02', icdName: 'Recurrent and persistent haematuria' },
  { id: 'n18.1', name: 'CKD Stage 1', icdCode: 'N18.1', icdName: 'Chronic kidney disease, stage 1' },
  { id: 'n18.2', name: 'CKD Stage 2', icdCode: 'N18.2', icdName: 'Chronic kidney disease, stage 2 (mild)' },
  { id: 'n18.3', name: 'CKD Stage 3', icdCode: 'N18.3', icdName: 'Chronic kidney disease, stage 3 (moderate)' },
  { id: 'n18.4', name: 'CKD Stage 4', icdCode: 'N18.4', icdName: 'Chronic kidney disease, stage 4 (severe)' },
  { id: 'n18.5', name: 'CKD Stage 5', icdCode: 'N18.5', icdName: 'Chronic kidney disease, stage 5' },
  { id: 'n18.6', name: 'End-stage renal disease', icdCode: 'N18.6', icdName: 'End-stage renal disease' },
  { id: 'n32.9', name: 'Bladder disorder, unspecified', icdCode: 'N32.9', icdName: 'Bladder disorder, unspecified' },
  { id: 'n33', name: 'Bladder disorders in diseases classified elsewhere', icdCode: 'N33', icdName: 'Bladder disorders in diseases classified elsewhere' },
  { id: 'n33.0', name: 'Tuberculous cystitis', icdCode: 'N33.0', icdName: 'Tuberculous cystitis (A18.1+)' },
  { id: 'n33.8', name: 'Bladder disorders in other diseases classified elsewhere', icdCode: 'N33.8', icdName: 'Bladder disorders in other diseases classified elsewhere' },
  { id: 'n34', name: 'Urethritis and urethral syndrome', icdCode: 'N34', icdName: 'Urethritis and urethral syndrome' },
  { id: 'n34.0', name: 'Urethral abscess', icdCode: 'N34.0', icdName: 'Urethral abscess' },
  { id: 'n34.1', name: 'Nonspecific urethritis', icdCode: 'N34.1', icdName: 'Nonspecific urethritis' },
  { id: 'n34.2', name: 'Other urethritis', icdCode: 'N34.2', icdName: 'Other urethritis' },
  { id: 'n34.3', name: 'Urethral syndrome, unspecified', icdCode: 'N34.3', icdName: 'Urethral syndrome, unspecified' },
  { id: 'n35', name: 'Urethral stricture', icdCode: 'N35', icdName: 'Urethral stricture' },
  { id: 'n35.0', name: 'Post-traumatic urethral stricture', icdCode: 'N35.0', icdName: 'Post-traumatic urethral stricture' },
  { id: 'n35.1', name: 'Postinfective urethral stricture, not elsewhere classified', icdCode: 'N35.1', icdName: 'Postinfective urethral stricture, not elsewhere classified' },
  { id: 'n35.8', name: 'Other urethral stricture', icdCode: 'N35.8', icdName: 'Other urethral stricture' },
  { id: 'n35.9', name: 'Urethral stricture, unspecified', icdCode: 'N35.9', icdName: 'Urethral stricture, unspecified' },
  { id: 'n36', name: 'Other disorders of urethra', icdCode: 'N36', icdName: 'Other disorders of urethra' },
  { id: 'n36.0', name: 'Urethral fistula', icdCode: 'N36.0', icdName: 'Urethral fistula' },
  { id: 'n36.1', name: 'Urethral diverticulum', icdCode: 'N36.1', icdName: 'Urethral diverticulum' },
  { id: 'n36.2', name: 'Urethral caruncle', icdCode: 'N36.2', icdName: 'Urethral caruncle' },
  { id: 'n36.3', name: 'Prolapsed urethral mucosa', icdCode: 'N36.3', icdName: 'Prolapsed urethral mucosa' },
  { id: 'n36.8', name: 'Other specified disorders of urethra', icdCode: 'N36.8', icdName: 'Other specified disorders of urethra' },
  { id: 'n36.9', name: 'Urethral disorder, unspecified', icdCode: 'N36.9', icdName: 'Urethral disorder, unspecified' },
  { id: 'n37', name: 'Urethral disorders in diseases classified elsewhere', icdCode: 'N37', icdName: 'Urethral disorders in diseases classified elsewhere' },
  { id: 'n37.0', name: 'Urethritis in diseases classified elsewhere', icdCode: 'N37.0', icdName: 'Urethritis in diseases classified elsewhere' },
  { id: 'n37.8', name: 'Other urethral disorders in diseases classified elsewhere', icdCode: 'N37.8', icdName: 'Other urethral disorders in diseases classified elsewhere' },
  { id: 'n39', name: 'Other disorders of urinary system', icdCode: 'N39', icdName: 'Other disorders of urinary system' },
  { id: 'n39.0', name: 'Urinary tract infection, site not specified', icdCode: 'N39.0', icdName: 'Urinary tract infection, site not specified' },
  { id: 'n39.1', name: 'Persistent proteinuria, unspecified', icdCode: 'N39.1', icdName: 'Persistent proteinuria, unspecified' },
  { id: 'n39.2', name: 'Orthostatic proteinuria, unspecified', icdCode: 'N39.2', icdName: 'Orthostatic proteinuria, unspecified' },
  { id: 'n39.3', name: 'Stress incontinence', icdCode: 'N39.3', icdName: 'Stress incontinence' },
  { id: 'n39.4', name: 'Other specified urinary incontinence', icdCode: 'N39.4', icdName: 'Other specified urinary incontinence' },
  { id: 'n39.8', name: 'Other specified disorders of urinary system', icdCode: 'N39.8', icdName: 'Other specified disorders of urinary system' },
  { id: 'n39.9', name: 'Disorder of urinary system, unspecified', icdCode: 'N39.9', icdName: 'Disorder of urinary system, unspecified' },
  { id: 'n40', name: 'Hyperplasia of prostate', icdCode: 'N40', icdName: 'Hyperplasia of prostate' },
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
      { id: 'med1', name: 'Telmisartan', dosage: '80mg', frequency: 'OD', instructions: 'After food' },
      { id: 'med2', name: 'Amlodipine', dosage: '10mg', frequency: 'OD', instructions: 'After food' },
      { id: 'med3', name: 'Torsemide', dosage: '20mg', frequency: 'OD', instructions: 'In the morning' },
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
      { id: 'med4', name: 'Metformin', dosage: '1g', frequency: 'BD', instructions: 'After food' },
      { id: 'med5', name: 'Dapagliflozin', dosage: '10mg', frequency: 'OD', instructions: 'After breakfast' },
      { id: 'med6', name: 'Atorvastatin', dosage: '20mg', frequency: 'HS', instructions: 'At bedtime' },
      { id: 'med7', name: 'Ramipril', dosage: '5mg', frequency: 'OD', instructions: '' },
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
      { id: 'med8', name: 'Tab Telmisartan', dosage: '40 mg', frequency: 'OD' },
      { id: 'med9', name: 'Tab Empagliflozin', dosage: '25 mg', frequency: 'OD' },
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
      { id: "ckd1", name: "CKD Stage 1", icdCode: "N18.1", icdName: "Chronic kidney disease, stage 1" },
      { id: "ckd2", name: "CKD Stage 2", icdCode: "N18.2", icdName: "Chronic kidney disease, stage 2 (mild)" },
      { id: "ckd3", name: "CKD Stage 3", icdCode: "N18.3", icdName: "Chronic kidney disease, stage 3 (moderate)" },
      { id: "ckd4", name: "CKD Stage 4", icdCode: "N18.4", icdName: "Chronic kidney disease, stage 4 (severe)" },
      { id: "ckd5", name: "CKD Stage 5", icdCode: "N18.5", icdName: "Chronic kidney disease, stage 5" },
      { id: "ckd6", name: "End-stage renal disease", icdCode: "N18.6", icdName: "End-stage renal disease" },
    ],
    history: "Patient was detected to be hypertensive ( BP _______ mm Hg) during medical examination. No complains of headache, chest pain, swelling of both lower limbs. No complains of hematuria, oliguria, froth in urine. No h/o joint pain, rash, oral ulcers, alopecia. No h/o alternative medication or chronic NSAID intake. Evaluation showed azotemia ( Creatinine ___ mg/dl). USG KUB showed B/L small echogenic kidneys. He was referred for Nephrology evaluation at CHSC. Due for opinion.",
    generalExamination: "No pallor, pedal edema. Fundus: No evidence of retinopathy. Systemic exam: NAD",
    systemicExamination: "NAD",
    medications: [
      { id: 'med10', name: 'Tab Amlodipine', dosage: '10 mg', frequency: 'OD' },
      { id: 'med11', name: 'Tab Met XL', dosage: '25 mg', frequency: 'BD' },
      { id: 'med12', name: 'Tab Sodabicarbonate', dosage: '500 mg', frequency: 'TDS' },
      { id: 'med13', name: 'Tab Rantac', dosage: '150 mg', frequency: 'BD' },
      { id: 'med14', name: 'Tab F/A', dosage: '5 mg', frequency: 'OD' },
      { id: 'med15', name: 'Calcirol sachet', dosage: '60,000 IU/month', frequency: 'Monthly' },
    ],
    opinionText: "This patient detected to have chronic kidney disease during evaluation of hypertension. His autoimmune workup was negative. His BP has been controlled with anti hypertensive drugs and he has evidence of hypertension related target organ damage. Non oliguric at present. His present eGFR is ( ______ ml/min/1.73 sqm BSA). He has been counseled about the prognosis of his disease and the precautions he needs to observe. He will require initiation of RRT once uremic symptoms appear. He has been vaccinated against HBV. He will need continued observation and periodic review.",
    recommendations: `Medical Classification recommended:\nMedical Classification: SHAPE -3 ( x )\nDisability Profile: P3 (T-24) for\nClinical diagnosis: CHRONIC KIDNEY DISEASE Stage 5\nICD code and Diagnosis: N18.5, Chronic kidney disease, stage 5\n\nMedical recommendations and employability restrictions as per Code ‘E’ (impacting functional status of the indl), if any, with justification: As per AO 3/2001\nUnfit for HAA\nTo be posted to a place within 04 hrs travelling to a service nephrology centre\n\nAny other advice (with justification):\nSalt restricted 2100 KCal low saturated fat diet\nAvoid nephrotoxic drugs, NSAIDs\nMonthly review in Nephro OPD with CBC, RFT and electrolytes report\nNext Recat at Nephrology centre`,
    usgReport: "Bilateral echogenic kidney. No HDN",
    kidneyBiopsyReport: "Not applicable.",
  }
};

export const SGLT2_INHIBITORS = ["Canagliflozin", "Dapagliflozin", "Empagliflozin", "Ertugliflozin"];
export const ARBS = ["Losartan", "Valsartan", "Irbesartan", "Candesartan", "Olmesartan", "Telmisartan", "Eprosartan", "Azilsartan"];
export const ACE_INHIBITORS = ["Lisinopril", "Enalapril", "Ramipril", "Benazepril", "Captopril", "Fosinopril", "Moexipril", "Perindopril", "Quinapril", "Trandolapril"];
export const FINERENONE = "Finerenone";

export const PATIENT_GROUPS_FOR_ANALYSIS = [
  "Diabetic Nephropathy",
  "Chronic Kidney Disease (CKD)",
  "Hypertensive Nephropathy",
  "Glomerulonephritis",
  "Post-Transplant",
];
