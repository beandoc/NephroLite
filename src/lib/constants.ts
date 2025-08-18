
import type { DiagnosisEntry, InvestigationMaster, InvestigationPanel } from '@/lib/types';

export const MOCK_USER = {
  name: "Dr. Sachin", 
  email: "dr.sachin@nephroconnect.com", 
  avatarUrl: "https://placehold.co/40x40.png", 
};


export const GENDERS: string[] = ['Male', 'Female'];

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
  'Dr. Sachin',
  'Dr. Atul',
  'Dr. Parikshit',
];

export const TIME_SLOTS: string[] = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00",
];

export const YES_NO_UNKNOWN_OPTIONS: Array<'Yes' | 'No' | 'Unknown'> = ['Yes', 'No', 'Unknown'];


export const VACCINATION_NAMES: string[] = [
  'Hepatitis B', 'Pneumococcal', 'Influenza', 'Covid', 'Varicella'
];

export const VISIT_TYPES: string[] = [
  "Routine", "Emergency", "Proxy", "Missed", "Admission"
];

export const PATIENT_GROUP_NAMES: string[] = [
  "Peritoneal Dialysis", "Chronic Kidney disease", "Hemodialysis",
  "Glomerulonephritis", "Kidney transplant", "ADPKD", "Misc", "Infection"
];

export const RESIDENCE_TYPES: Array<'Rural' | 'Urban' | 'Semi-Urban' | 'Other' | 'Not Set'> = ['Rural', 'Urban', 'Semi-Urban', 'Other', 'Not Set'];

export const MOCK_DIAGNOSES: DiagnosisEntry[] = [
    { id: 'I10', name: 'Hypertension', icdName: 'Essential (primary) hypertension', icdCode: 'I10', clinicalNames: ['Hypertension', 'High Blood Pressure'] },
    { id: 'E11.9', name: 'Type 2 Diabetes Mellitus', icdName: 'Type 2 diabetes mellitus without complications', icdCode: 'E11.9', clinicalNames: ['Type 2 Diabetes Mellitus', 'T2DM'] },
    { id: 'N18.3', name: 'Chronic Kidney Disease, Stage 3', icdName: 'Chronic kidney disease, stage 3 (moderate)', icdCode: 'N18.3', clinicalNames: ['Chronic Kidney Disease, Stage 3', 'CKD Stage 3'] },
    { id: 'N02.8', name: 'IgA Nephropathy', icdName: 'IgA nephropathy', icdCode: 'N02.8', clinicalNames: ['IgA Nephropathy', 'Berger\'s Disease'] },
    { id: 'N00', name: 'Acute nephritic syndrome', icdName: 'Acute nephritic syndrome', icdCode: 'N00', clinicalNames: ['Acute nephritic syndrome'] },
    { id: 'N00.0', name: 'Acute nephritic syndrome, minor glomerular abnormality', icdName: 'Acute nephritic syndrome, minor glomerular abnormality', icdCode: 'N00.0', clinicalNames: ['Acute nephritic syndrome, minor glomerular abnormality'] },
    { id: 'N00.1', name: 'Acute nephritic syndrome, focal and segmental glomerular lesions', icdName: 'Acute nephritic syndrome, focal and segmental glomerular lesions', icdCode: 'N00.1', clinicalNames: ['Acute nephritic syndrome, focal and segmental glomerular lesions'] },
    { id: 'N00.2', name: 'Acute nephritic syndrome, diffuse membranous glomerulonephritis', icdName: 'Acute nephritic syndrome, diffuse membranous glomerulonephritis', icdCode: 'N00.2', clinicalNames: ['Acute nephritic syndrome, diffuse membranous glomerulonephritis'] },
    { id: 'N00.3', name: 'Acute nephritic syndrome, diffuse mesangial proliferative glomerulonephritis', icdName: 'Acute nephritic syndrome, diffuse mesangial proliferative glomerulonephritis', icdCode: 'N00.3', clinicalNames: ['Acute nephritic syndrome, diffuse mesangial proliferative glomerulonephritis'] },
    { id: 'N00.4', name: 'Acute nephritic syndrome, diffuse endocapillary proliferative glomerulonephritis', icdName: 'Acute nephritic syndrome, diffuse endocapillary proliferative glomerulonephritis', icdCode: 'N00.4', clinicalNames: ['Acute nephritic syndrome, diffuse endocapillary proliferative glomerulonephritis'] },
    { id: 'N00.5', name: 'Acute nephritic syndrome, diffuse mesangiocapillary glomerulonephritis', icdName: 'Acute nephritic syndrome, diffuse mesangiocapillary glomerulonephritis', icdCode: 'N00.5', clinicalNames: ['Acute nephritic syndrome, diffuse mesangiocapillary glomerulonephritis'] },
    { id: 'N00.6', name: 'Acute nephritic syndrome, dense deposit disease', icdName: 'Acute nephritic syndrome, dense deposit disease', icdCode: 'N00.6', clinicalNames: ['Acute nephritic syndrome, dense deposit disease'] },
    { id: 'N00.7', name: 'Acute nephritic syndrome, diffuse crescentic glomerulonephritis', icdName: 'Acute nephritic syndrome, diffuse crescentic glomerulonephritis', icdCode: 'N00.7', clinicalNames: ['Acute nephritic syndrome, diffuse crescentic glomerulonephritis'] },
    { id: 'N00.8', name: 'Acute nephritic syndrome, other', icdName: 'Acute nephritic syndrome, other', icdCode: 'N00.8', clinicalNames: ['Acute nephritic syndrome, other'] },
    { id: 'N00.9', name: 'Acute nephritic syndrome, unspecified', icdName: 'Acute nephritic syndrome, unspecified', icdCode: 'N00.9', clinicalNames: ['Acute nephritic syndrome, unspecified'] },
    { id: 'N01', name: 'Rapidly progressive nephritic syndrome', icdName: 'Rapidly progressive nephritic syndrome', icdCode: 'N01', clinicalNames: ['Rapidly progressive nephritic syndrome'] },
    { id: 'N01.0', name: 'Rapidly progressive nephritic syndrome, minor glomerular abnormality', icdName: 'Rapidly progressive nephritic syndrome, minor glomerular abnormality', icdCode: 'N01.0', clinicalNames: ['Rapidly progressive nephritic syndrome, minor glomerular abnormality'] },
    { id: 'N01.1', name: 'Rapidly progressive nephritic syndrome, focal and segmental glomerular lesions', icdName: 'Rapidly progressive nephritic syndrome, focal and segmental glomerular lesions', icdCode: 'N01.1', clinicalNames: ['Rapidly progressive nephritic syndrome, focal and segmental glomerular lesions'] },
    { id: 'N01.2', name: 'Rapidly progressive nephritic syndrome, diffuse membranous glomerulonephritis', icdName: 'Rapidly progressive nephritic syndrome, diffuse membranous glomerulonephritis', icdCode: 'N01.2', clinicalNames: ['Rapidly progressive nephritic syndrome, diffuse membranous glomerulonephritis'] },
    { id: 'N01.3', name: 'Rapidly progressive nephritic syndrome, diffuse mesangial proliferative glomerulonephritis', icdName: 'Rapidly progressive nephritic syndrome, diffuse mesangial proliferative glomerulonephritis', icdCode: 'N01.3', clinicalNames: ['Rapidly progressive nephritic syndrome, diffuse mesangial proliferative glomerulonephritis'] },
    { id: 'N01.4', name: 'Rapidly progressive nephritic syndrome, diffuse endocapillary proliferative glomerulonephritis', icdName: 'Rapidly progressive nephritic syndrome, diffuse endocapillary proliferative glomerulonephritis', icdCode: 'N01.4', clinicalNames: ['Rapidly progressive nephritic syndrome, diffuse endocapillary proliferative glomerulonephritis'] },
    { id: 'N01.5', name: 'Rapidly progressive nephritic syndrome, diffuse mesangiocapillary glomerulonephritis', icdName: 'Rapidly progressive nephritic syndrome, diffuse mesangiocapillary glomerulonephritis', icdCode: 'N01.5', clinicalNames: ['Rapidly progressive nephritic syndrome, diffuse mesangiocapillary glomerulonephritis'] },
    { id: 'N01.6', name: 'Rapidly progressive nephritic syndrome, dense deposit disease', icdName: 'Rapidly progressive nephritic syndrome, dense deposit disease', icdCode: 'N01.6', clinicalNames: ['Rapidly progressive nephritic syndrome, dense deposit disease'] },
    { id: 'N01.7', name: 'Rapidly progressive nephritic syndrome, diffuse crescentic glomerulonephritis', icdName: 'Rapidly progressive nephritic syndrome, diffuse crescentic glomerulonephritis', icdCode: 'N01.7', clinicalNames: ['Rapidly progressive nephritic syndrome, diffuse crescentic glomerulonephritis'] },
    { id: 'N01.8', name: 'Rapidly progressive nephritic syndrome, other', icdName: 'Rapidly progressive nephritic syndrome, other', icdCode: 'N01.8', clinicalNames: ['Rapidly progressive nephritic syndrome, other'] },
    { id: 'N01.9', name: 'Rapidly progressive nephritic syndrome, unspecified', icdName: 'Rapidly progressive nephritic syndrome, unspecified', icdCode: 'N01.9', clinicalNames: ['Rapidly progressive nephritic syndrome, unspecified'] },
    { id: 'N02', name: 'Recurrent and persistent haematuria', icdName: 'Recurrent and persistent haematuria', icdCode: 'N02', clinicalNames: ['Recurrent and persistent haematuria'] },
    { id: 'N18.1', name: 'CKD Stage 1', icdName: 'Chronic kidney disease, stage 1', icdCode: 'N18.1', clinicalNames: ['CKD Stage 1'] },
    { id: 'N18.2', name: 'CKD Stage 2', icdName: 'Chronic kidney disease, stage 2 (mild)', icdCode: 'N18.2', clinicalNames: ['CKD Stage 2'] },
    { id: 'N18.4', name: 'CKD Stage 4', icdName: 'Chronic kidney disease, stage 4 (severe)', icdCode: 'N18.4', clinicalNames: ['CKD Stage 4'] },
    { id: 'N18.5', name: 'CKD Stage 5', icdName: 'Chronic kidney disease, stage 5', icdCode: 'N18.5', clinicalNames: ['CKD Stage 5'] },
    { id: 'N18.6', name: 'End-stage renal disease', icdName: 'End-stage renal disease', icdCode: 'N18.6', clinicalNames: ['End-stage renal disease', 'ESRD'] },
    { id: 'N32.9', name: 'Bladder disorder, unspecified', icdName: 'Bladder disorder, unspecified', icdCode: 'N32.9', clinicalNames: ['Bladder disorder, unspecified'] },
    { id: 'N33', name: 'Bladder disorders in diseases classified elsewhere', icdName: 'Bladder disorders in diseases classified elsewhere', icdCode: 'N33', clinicalNames: ['Bladder disorders in diseases classified elsewhere'] },
    { id: 'N33.0', name: 'Tuberculous cystitis', icdName: 'Tuberculous cystitis (A18.1+)', icdCode: 'N33.0', clinicalNames: ['Tuberculous cystitis'] },
    { id: 'N33.8', name: 'Bladder disorders in other diseases classified elsewhere', icdName: 'Bladder disorders in other diseases classified elsewhere', icdCode: 'N33.8', clinicalNames: ['Bladder disorders in other diseases classified elsewhere'] },
    { id: 'N34', name: 'Urethritis and urethral syndrome', icdName: 'Urethritis and urethral syndrome', icdCode: 'N34', clinicalNames: ['Urethritis and urethral syndrome'] },
    { id: 'N34.0', name: 'Urethral abscess', icdName: 'Urethral abscess', icdCode: 'N34.0', clinicalNames: ['Urethral abscess'] },
    { id: 'N34.1', name: 'Nonspecific urethritis', icdName: 'Nonspecific urethritis', icdCode: 'N34.1', clinicalNames: ['Nonspecific urethritis'] },
    { id: 'N34.2', name: 'Other urethritis', icdName: 'Other urethritis', icdCode: 'N34.2', clinicalNames: ['Other urethritis'] },
    { id: 'N34.3', name: 'Urethral syndrome, unspecified', icdName: 'Urethral syndrome, unspecified', icdCode: 'N34.3', clinicalNames: ['Urethral syndrome, unspecified'] },
    { id: 'N35', name: 'Urethral stricture', icdName: 'Urethral stricture', icdCode: 'N35', clinicalNames: ['Urethral stricture'] },
    { id: 'N35.0', name: 'Post-traumatic urethral stricture', icdName: 'Post-traumatic urethral stricture', icdCode: 'N35.0', clinicalNames: ['Post-traumatic urethral stricture'] },
    { id: 'N35.1', name: 'Postinfective urethral stricture, not elsewhere classified', icdName: 'Postinfective urethral stricture, not elsewhere classified', icdCode: 'N35.1', clinicalNames: ['Postinfective urethral stricture, not elsewhere classified'] },
    { id: 'N35.8', name: 'Other urethral stricture', icdName: 'Other urethral stricture', icdCode: 'N35.8', clinicalNames: ['Other urethral stricture'] },
    { id: 'N35.9', name: 'Urethral stricture, unspecified', icdName: 'Urethral stricture, unspecified', icdCode: 'N35.9', clinicalNames: ['Urethral stricture, unspecified'] },
    { id: 'N36', name: 'Other disorders of urethra', icdName: 'Other disorders of urethra', icdCode: 'N36', clinicalNames: ['Other disorders of urethra'] },
    { id: 'N36.0', name: 'Urethral fistula', icdName: 'Urethral fistula', icdCode: 'N36.0', clinicalNames: ['Urethral fistula'] },
    { id: 'N36.1', name: 'Urethral diverticulum', icdName: 'Urethral diverticulum', icdCode: 'N36.1', clinicalNames: ['Urethral diverticulum'] },
    { id: 'N36.2', name: 'Urethral caruncle', icdName: 'Urethral caruncle', icdCode: 'N36.2', clinicalNames: ['Urethral caruncle'] },
    { id: 'N36.3', name: 'Prolapsed urethral mucosa', icdName: 'Prolapsed urethral mucosa', icdCode: 'N36.3', clinicalNames: ['Prolapsed urethral mucosa'] },
    { id: 'N36.8', name: 'Other specified disorders of urethra', icdName: 'Other specified disorders of urethra', icdCode: 'N36.8', clinicalNames: ['Other specified disorders of urethra'] },
    { id: 'N36.9', name: 'Urethral disorder, unspecified', icdName: 'Urethral disorder, unspecified', icdCode: 'N36.9', clinicalNames: ['Urethral disorder, unspecified'] },
    { id: 'N37', name: 'Urethral disorders in diseases classified elsewhere', icdName: 'Urethral disorders in diseases classified elsewhere', icdCode: 'N37', clinicalNames: ['Urethral disorders in diseases classified elsewhere'] },
    { id: 'N37.0', name: 'Urethritis in diseases classified elsewhere', icdName: 'Urethritis in diseases classified elsewhere', icdCode: 'N37.0', clinicalNames: ['Urethritis in diseases classified elsewhere'] },
    { id: 'N37.8', name: 'Other urethral disorders in diseases classified elsewhere', icdName: 'Other urethral disorders in diseases classified elsewhere', icdCode: 'N37.8', clinicalNames: ['Other urethral disorders in diseases classified elsewhere'] },
    { id: 'N39', name: 'Other disorders of urinary system', icdName: 'Other disorders of urinary system', icdCode: 'N39', clinicalNames: ['Other disorders of urinary system'] },
    { id: 'N39.0', name: 'Urinary tract infection, site not specified', icdName: 'Urinary tract infection, site not specified', icdCode: 'N39.0', clinicalNames: ['Urinary tract infection, site not specified', 'UTI'] },
    { id: 'N39.1', name: 'Persistent proteinuria, unspecified', icdName: 'Persistent proteinuria, unspecified', icdCode: 'N39.1', clinicalNames: ['Persistent proteinuria, unspecified'] },
    { id: 'N39.2', name: 'Orthostatic proteinuria, unspecified', icdName: 'Orthostatic proteinuria, unspecified', icdCode: 'N39.2', clinicalNames: ['Orthostatic proteinuria, unspecified'] },
    { id: 'N39.3', name: 'Stress incontinence', icdName: 'Stress incontinence', icdCode: 'N39.3', clinicalNames: ['Stress incontinence'] },
    { id: 'N39.4', name: 'Other specified urinary incontinence', icdName: 'Other specified urinary incontinence', icdCode: 'N39.4', clinicalNames: ['Other specified urinary incontinence'] },
    { id: 'N39.8', name: 'Other specified disorders of urinary system', icdName: 'Other specified disorders of urinary system', icdCode: 'N39.8', clinicalNames: ['Other specified disorders of urinary system'] },
    { id: 'N39.9', name: 'Disorder of urinary system, unspecified', icdName: 'Disorder of urinary system, unspecified', icdCode: 'N39.9', clinicalNames: ['Disorder of urinary system, unspecified'] },
    { id: 'N40', name: 'Hyperplasia of prostate', icdName: 'Hyperplasia of prostate', icdCode: 'N40', clinicalNames: ['Hyperplasia of prostate', 'BPH'] },
];

export const INVESTIGATION_GROUPS: string[] = [
  'Hematological', 'Biochemistry', 'Radiology', 'Pathology', 'Special Investigations', 'Urine Analysis', 'Serology', 'Microbiology'
];

export const INVESTIGATION_MASTER_LIST: InvestigationMaster[] = [
  // Hematological
  { id: 'hem_001', name: 'Hemoglobin (Hb)', group: 'Hematological', unit: 'g/dL', normalRange: '13.5-17.5' },
  { id: 'hem_002', name: 'Total Leucocyte Count (TLC)', group: 'Hematological', unit: '/mm³', normalRange: '4000-11000' },
  { id: 'hem_003', name: 'Differential Leucocyte Count (DLC)', group: 'Hematological', unit: '%', normalRange: 'N:40-75,L:20-45,M:2-10,E:1-6' },
  { id: 'hem_004', name: 'Platelet Count', group: 'Hematological', unit: '/mm³', normalRange: '150,000-450,000' },
  { id: 'hem_005', name: 'Erythrocyte Sedimentation Rate (ESR)', group: 'Hematological', unit: 'mm/hr', normalRange: '0-20' },
  { id: 'hem_006', name: 'Prothrombin Time (PT)', group: 'Hematological', unit: 'sec', normalRange: '11-13.5' },
  { id: 'hem_007', name: 'Activated Partial Thromboplastin Time (aPTT)', group: 'Hematological', unit: 'sec', normalRange: '25-35' },
  { id: 'hem_008', name: 'Reticulocyte Count', group: 'Hematological', unit: '%', normalRange: '0.5-2.5' },
  { id: 'hem_009', name: 'Peripheral Blood Smear (PBS)', group: 'Hematological' },
  { id: 'hem_010', name: 'INR', group: 'Hematological', unit: '', normalRange: '0.8-1.2' },
  { id: 'hem_011', name: 'Complete Blood Count (CBC)', group: 'Hematological' },

  // Biochemistry
  { id: 'bio_001', name: 'Blood Urea', group: 'Biochemistry', unit: 'mg/dL', normalRange: '15-45' },
  { id: 'bio_002', name: 'Serum Creatinine', group: 'Biochemistry', unit: 'mg/dL', normalRange: '0.6-1.2' },
  { id: 'bio_003', name: 'Serum Sodium (Na+)', group: 'Biochemistry', unit: 'mEq/L', normalRange: '135-145' },
  { id: 'bio_004', name: 'Serum Potassium (K+)', group: 'Biochemistry', unit: 'mEq/L', normalRange: '3.5-5.1' },
  { id: 'bio_005', name: 'Serum Bicarbonate', group: 'Biochemistry', unit: 'mEq/L', normalRange: '22-29' },
  { id: 'bio_006', name: 'Serum Calcium', group: 'Biochemistry', unit: 'mg/dL', normalRange: '8.5-10.5' },
  { id: 'bio_007', name: 'Serum Phosphate', group: 'Biochemistry', unit: 'mg/dL', normalRange: '2.5-4.5' },
  { id: 'bio_008', name: 'Serum Uric Acid', group: 'Biochemistry', unit: 'mg/dL', normalRange: '3.5-7.2' },
  { id: 'bio_009', name: 'Alkaline Phosphatase (ALP)', group: 'Biochemistry', unit: 'IU/L', normalRange: '44-147' },
  { id: 'bio_010', name: 'Total Protein', group: 'Biochemistry', unit: 'g/dL', normalRange: '6.0-8.3' },
  { id: 'bio_011', name: 'Serum Albumin', group: 'Biochemistry', unit: 'g/dL', normalRange: '3.5-5.5' },
  { id: 'bio_012', name: 'Fasting Blood Sugar (FBS)', group: 'Biochemistry', unit: 'mg/dL', normalRange: '70-100' },
  { id: 'bio_013', name: 'Post Prandial Blood Sugar (PPBS)', group: 'Biochemistry', unit: 'mg/dL', normalRange: '<140' },
  { id: 'bio_014', name: 'HbA1c', group: 'Biochemistry', unit: '%', normalRange: '<5.7' },
  { id: 'bio_016', name: 'Liver Function Test (LFT)', group: 'Biochemistry' },
  { id: 'bio_017', name: 'Kidney Function Test (KFT)', group: 'Biochemistry' },
  { id: 'bio_018', name: 'eGFR', group: 'Biochemistry', unit: 'mL/min/1.73m²', normalRange: '>90' },
  { id: 'bio_019', name: 'Total Cholesterol', group: 'Biochemistry', unit: 'mg/dL', normalRange: '<200' },
  { id: 'bio_020', name: 'HDL Cholesterol', group: 'Biochemistry', unit: 'mg/dL', normalRange: '>40' },
  { id: 'bio_021', name: 'LDL Cholesterol', group: 'Biochemistry', unit: 'mg/dL', normalRange: '<100' },
  
  // Radiology
  { id: 'rad_001', name: 'USG KUB', group: 'Radiology' },
  { id: 'rad_002', name: 'Chest X-Ray (CXR)', group: 'Radiology' },
  { id: 'rad_003', name: 'CT KUB (NCCT)', group: 'Radiology' },
  { id: 'rad_004', name: 'CT Abdomen', group: 'Radiology' },
  { id: 'rad_005', name: 'MRI Abdomen', group: 'Radiology' },

  // Serology
  { id: 'ser_001', name: 'HBsAg', group: 'Serology' },
  { id: 'ser_002', name: 'Anti-HCV', group: 'Serology' },
  { id: 'ser_003', name: 'HIV I & II', group: 'Serology' },
  { id: 'ser_004', name: 'ANA (Antinuclear Antibody)', group: 'Serology' },
  { id: 'ser_005', name: 'dsDNA', group: 'Serology' },
  { id: 'ser_006', name: 'C3', group: 'Serology', unit: 'mg/dL', normalRange: '90-180' },
  { id: 'ser_007', name: 'C4', group: 'Serology', unit: 'mg/dL', normalRange: '10-40' },
  { id: 'ser_008', name: 'ANCA (p-ANCA, c-ANCA)', group: 'Serology' },
  { id: 'ser_009', name: 'Anti-GBM Antibody', group: 'Serology' },
  { id: 'ser_010', name: 'Anti PLA2R antibody', group: 'Serology' },

  // Urine Analysis
  { id: 'urn_001', name: 'Urine Routine & Microscopy (R/M)', group: 'Urine Analysis' },
  { id: 'urn_002', name: 'Urine Culture & Sensitivity', group: 'Urine Analysis' },
  { id: 'urn_003', name: '24-hour Urine Protein', group: 'Urine Analysis', unit: 'mg/day', normalRange: '<150' },
  { id: 'urn_004', name: 'Urine Spot Protein/Creatinine Ratio (PCR)', group: 'Urine Analysis', unit: 'mg/g', normalRange: '<150' },
  { id: 'urn_005', name: 'Urine for AC Ratio (mg/gm)', group: 'Urine Analysis', unit: 'mg/gm', normalRange: '<30' },
  
  // Special Investigations
  { id: 'spc_001', name: 'Kidney Biopsy', group: 'Special Investigations' },
  { id: 'spc_002', name: 'ECG', group: 'Special Investigations' },
  { id: 'spc_003', name: '2D Echocardiography', group: 'Special Investigations' },

  // Microbiology
  { id: 'mic_001', name: 'Blood Culture & Sensitivity', group: 'Microbiology' },
];

export const INVESTIGATION_PANELS: InvestigationPanel[] = [
    // Hematology Panels
    { id: 'panel_hem_1', name: 'Hematology Basic', group: 'Hematological', testIds: ['hem_001', 'hem_002', 'hem_003', 'hem_004'] },
    { id: 'panel_hem_2', name: 'Hematology Extended', group: 'Hematological', testIds: ['hem_001', 'hem_002', 'hem_003', 'hem_004', 'hem_005', 'hem_010', 'hem_006'] },
    { id: 'panel_hem_3', name: 'Coagulation Profile', group: 'Hematological', testIds: ['hem_006', 'hem_007', 'hem_010', 'hem_004'] },
    { id: 'panel_hem_4', name: 'Complete Anemia Profile', group: 'Hematological', testIds: ['hem_001', 'hem_002', 'hem_003', 'hem_004', 'hem_008', 'hem_009'] },
    
    // Biochemistry Panels
    { id: 'panel_bio_1', name: 'Renal Function Basic (KFT)', group: 'Biochemistry', testIds: ['bio_001', 'bio_002', 'bio_003', 'bio_004', 'bio_005'] },
    { id: 'panel_bio_2', name: 'Renal Function Extended', group: 'Biochemistry', testIds: ['bio_001', 'bio_002', 'bio_003', 'bio_004', 'bio_005', 'bio_006', 'bio_007', 'bio_008'] },
    { id: 'panel_bio_3', name: 'Liver Function Test (LFT)', group: 'Biochemistry', testIds: ['bio_010', 'bio_011', 'bio_016'] }, // Simplified LFT
    { id: 'panel_bio_4', name: 'Diabetic Profile', group: 'Biochemistry', testIds: ['bio_012', 'bio_013', 'bio_014'] },
    { id: 'panel_bio_5', name: 'Metabolic Bone Disease (MBD) Screen', group: 'Biochemistry', testIds: ['bio_006', 'bio_007', 'bio_009'] },
    { id: 'panel_bio_6', name: 'Lipid Profile', group: 'Biochemistry', testIds: ['bio_019', 'bio_020', 'bio_021'] },

    // Serology Panels
    { id: 'panel_ser_1', name: 'Viral Markers', group: 'Serology', testIds: ['ser_001', 'ser_002', 'ser_003'] },
    { id: 'panel_ser_2', name: 'Glomerulonephritis (GN) Basic', group: 'Serology', testIds: ['ser_004', 'ser_006', 'ser_007'] },
    { id: 'panel_ser_3', name: 'Glomerulonephritis (GN) Extended', group: 'Serology', testIds: ['ser_004', 'ser_005', 'ser_006', 'ser_007', 'ser_008', 'ser_009'] },

    // Urine Panels
    { id: 'panel_urn_1', name: 'Basic Urinalysis', group: 'Urine Analysis', testIds: ['urn_001'] },
    { id: 'panel_urn_2', name: 'Proteinuria Screen', group: 'Urine Analysis', testIds: ['urn_001', 'urn_004'] },
];

export const FREQUENTLY_USED_INVESTIGATIONS: { name: string; type: 'test' | 'panel'; id: string }[] = [
    { name: 'Hematology Basic', type: 'panel', id: 'panel_hem_1' },
    { name: 'Renal Profile Extended', type: 'panel', id: 'panel_bio_2' },
    { name: 'Lipid Profile', type: 'panel', id: 'panel_bio_6' },
    { name: 'CXR PA View', type: 'test', id: 'rad_002' },
    { name: 'ECG', type: 'test', id: 'spc_002' },
    { name: 'USG KUB', type: 'test', id: 'rad_001' },
    { name: 'Urine R/E', type: 'test', id: 'urn_001' },
    { name: 'Urine PC Ratio', type: 'test', id: 'urn_004' },
    { name: 'Urine for AC Ratio', type: 'test', id: 'urn_005' },
    { name: 'Kidney Biopsy', type: 'test', id: 'spc_001' },
];


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

export const DIAGNOSIS_TEMPLATES = {
    "IgA Nephropathy": {
        templateName: "IgA Nephropathy",
        templateType: "Opinion Report" as const,
        diagnoses: [{ id: "d004", name: "IgA Nephropathy", icdCode: "N02.8", icdName: "IgA nephropathy" }],
        history: "Patient presents with a history of recurrent macroscopic hematuria following upper respiratory tract infections. No significant family history of renal disease.",
        generalExamination: "General condition is fair. No pallor, icterus, or edema noted.",
        systemicExamination: "Cardiovascular: S1, S2 heard, no murmurs. Respiratory: Clear breath sounds. Abdomen: Soft, non-tender.",
        medications: [
            { id: crypto.randomUUID(), name: "Ramipril", dosage: "5mg", frequency: "OD", instructions: "After breakfast" },
            { id: crypto.randomUUID(), name: "Atorvastatin", dosage: "10mg", frequency: "HS", instructions: "At bedtime" },
        ],
        usgReport: "Both kidneys are normal in size and echotexture. No evidence of hydronephrosis or calculi.",
        kidneyBiopsyReport: "Light Microscopy: Mesangial hypercellularity with matrix expansion.\nImmunofluorescence: Dominant mesangial deposits of IgA and C3.\nElectron Microscopy: Electron-dense deposits in the mesangium.",
        opinionText: "The findings are consistent with IgA Nephropathy. The patient has moderate proteinuria and preserved renal function.",
        recommendations: "Continue ACE inhibitor for blood pressure control and proteinuria reduction. Regular monitoring of renal function and proteinuria is advised. Avoid nephrotoxic drugs.",
    },
    "Diabetic Nephropathy": {
        templateName: "Diabetic Nephropathy",
        templateType: "Discharge Summary" as const,
        diagnoses: [
            { id: "e11.21", name: "Diabetic Nephropathy", icdCode: "E11.21", icdName: "Type 2 diabetes mellitus with diabetic nephropathy" },
            { id: "d002", name: "Type 2 Diabetes Mellitus", icdCode: "E11.9", icdName: "Type 2 diabetes mellitus without complications" },
            { id: "d001", name: "Hypertension", icdCode: "I10", icdName: "Essential (primary) hypertension" },
        ],
        history: "Known case of Type 2 Diabetes Mellitus for 15 years with suboptimal glycemic control. Presented with progressive pedal edema and worsening renal function.",
        generalExamination: "Bilateral pitting pedal edema present up to the knees. BP: 150/90 mmHg.",
        systemicExamination: "Fundoscopy shows background diabetic retinopathy. Other systems are within normal limits.",
        medications: [
            { id: crypto.randomUUID(), name: "Insulin Glargine", dosage: "20 units", frequency: "HS", instructions: "Subcutaneous" },
            { id: "randomid1", name: "Metformin", dosage: "500mg", frequency: "BD", instructions: "After meals (dosage adjusted for GFR)" },
            { id: crypto.randomUUID(), name: "Telmisartan", dosage: "40mg", frequency: "OD", instructions: "" },
            { id: crypto.randomUUID(), name: "Dapagliflozin", dosage: "10mg", frequency: "OD", instructions: "SGLT2 inhibitor for nephroprotection" },
        ],
        dischargeInstructions: "Advised strict glycemic and blood pressure control. Low salt, low protein diet. Monitor renal function tests every 3 months. Follow up in the nephrology OPD.",
        usgReport: "Slightly increased echogenicity of both kidneys, suggestive of medical renal disease.",
        kidneyBiopsyReport: "Not performed.",
    }
};
