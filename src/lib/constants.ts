

import type { MasterDiagnosis, InvestigationMaster, InvestigationPanel } from './types';

export const MOCK_USER = {
  name: "Dr. Sachin", 
  email: "dr.sachin@nephroconnect.com", 
  avatarUrl: "https://placehold.co/40x40.png", 
};


export const GENDERS = ['Male', 'Female'] as const;

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] as const;

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep', 'Delhi', 'Puducherry', 'Ladakh', 'Jammu and Kashmir'
] as const;

export const RELATIONSHIPS = [
  'Self', 'Parent', 'Spouse', 'Sibling', 'Child', 'Guardian', 'Friend', 'Other',
  'F/O', 'S/O', 'W/O', 'M/O', 'D/O'
] as const;

export const MALE_IMPLYING_RELATIONS = ['F/O', 'S/O'];
export const FEMALE_IMPLYING_RELATIONS = ['W/O', 'M/O', 'D/O'];

export const PRIMARY_DIAGNOSIS_OPTIONS = [
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
] as const;

export const NUTRITIONAL_STATUSES = [
  'Well-nourished',
  'Mild malnutrition',
  'Moderate malnutrition',
  'Severe malnutrition',
  'Obese',
  'Not Set',
] as const;

export const DISABILITY_PROFILES = [
  'None',
  'Mild physical disability',
  'Moderate physical disability',
  'Severe physical disability',
  'Cognitive impairment',
  'Visual impairment',
  'Hearing impairment',
  'Other',
  'Not Set',
] as const;

export const APPOINTMENT_TYPES = [
  'Routine Checkup',
  'Follow-up',
  'Dialysis Session',
  'Consultation',
  'Emergency',
  'Lab Results Review',
  'Transplant Evaluation',
  'GN Monitoring Visit',
] as const;


export const APPOINTMENT_STATUSES =
  ['Scheduled', 'Completed', 'Cancelled', 'Waiting', 'Not Showed', 'Admitted', 'Now Serving'] as const;

export const MOCK_DOCTORS = [
  'Dr. Sachin',
  'Dr. Atul',
  'Dr. Parikshit',
] as const;

export const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00",
] as const;

export const YES_NO_UNKNOWN_OPTIONS = ['Yes', 'No', 'Unknown'] as const;


export const VACCINATION_NAMES = [
  'Hepatitis B', 'Pneumococcal', 'Influenza', 'Covid', 'Varicella'
] as const;

export const VISIT_TYPES = [
  "Routine", "Emergency", "Proxy", "Missed", "Admission"
] as const;

export const PATIENT_GROUP_NAMES = [
  "Peritoneal Dialysis", "Chronic Kidney disease", "Hemodialysis",
  "Glomerulonephritis", "Kidney transplant", "ADPKD", "Misc", "Infection"
] as const;

export const RESIDENCE_TYPES = ['Rural', 'Urban', 'Semi-Urban', 'Other', 'Not Set'] as const;

// New constants for Interventions
export const INTERVENTION_TYPES = [
    'Kidney Biopsy', 
    'Temporary Catheter', 
    'Tunneled Cuffed Catheter', 
    'Dialysis Catheter Removal', 
    'CAPD Catheter Insertion', 
    'CAPD Catheter Removal', 
    'AV Fistula Creation', 
    'Endovascular Intervention'
] as const;

export const CATHETER_SITES = ['SLFC Rt', 'SLFC Lt', 'DLFC Rt', 'DLFC Lt', 'DLJC Rt', 'DLJC Lt'] as const;
export const CUFFED_CATHETER_SITES = ['Right IJV', 'Left IJV', 'Right EJV', 'Left EJV', 'Femoral'] as const;
export const CAPD_CATHETER_TYPES = ['Straight', 'Coiled'] as const;
export const CAPD_INSERTION_TECHNIQUES = ['Percutaneous', 'Mini Laparotomy', 'Laparoscopic'] as const;
export const AV_FISTULA_TYPES = ['Radio-cephalic', 'Brachio-cephalic'] as const;

export const MOCK_DIAGNOSES: MasterDiagnosis[] = [
    { 
        id: 'hypertension', 
        clinicalDiagnosis: 'Hypertension', 
        icdMappings: [
            { icdCode: 'I10', icdName: 'Essential (primary) hypertension' }
        ] 
    },
    { 
        id: 't2dm', 
        clinicalDiagnosis: 'Type 2 Diabetes Mellitus', 
        icdMappings: [
            { icdCode: 'E11.9', icdName: 'Type 2 diabetes mellitus without complications' }
        ] 
    },
    { 
        id: 'ckd', 
        clinicalDiagnosis: 'Chronic Kidney Disease', 
        icdMappings: [
            { icdCode: 'N18.1', icdName: 'Chronic kidney disease, stage 1' },
            { icdCode: 'N18.2', icdName: 'Chronic kidney disease, stage 2 (mild)' },
            { icdCode: 'N18.3', icdName: 'Chronic kidney disease, stage 3 (moderate)' },
            { icdCode: 'N18.4', icdName: 'Chronic kidney disease, stage 4 (severe)' },
            { icdCode: 'N18.5', icdName: 'Chronic kidney disease, stage 5' },
            { icdCode: 'N18.6', icdName: 'End-stage renal disease' },
            { icdCode: 'N18.9', icdName: 'Chronic kidney disease, unspecified' },
        ] 
    },
    { 
        id: 'iga_nephropathy', 
        clinicalDiagnosis: 'IgA Nephropathy', 
        icdMappings: [
            { icdCode: 'N02.8', icdName: 'Recurrent and persistent haematuria with other morphologic changes' }
        ] 
    },
];

export const INVESTIGATION_GROUPS = [
  'Hematological', 'Biochemistry', 'Radiology', 'Pathology', 'Special Investigations', 'Urine Analysis', 'Serology', 'Microbiology'
] as const;

export const RESULT_TYPES = ['numeric', 'text', 'select'] as const;

export const INVESTIGATION_MASTER_LIST: InvestigationMaster[] = [
  // Hematological
  { id: 'hem_001', name: 'Hemoglobin (Hb)', group: 'Hematological', unit: 'g/dL', normalRange: '13.5-17.5', resultType: 'numeric' },
  { id: 'hem_002', name: 'Total Leucocyte Count (TLC)', group: 'Hematological', unit: '/mm³', normalRange: '4000-11000', resultType: 'numeric' },
  { id: 'hem_003', name: 'Differential Leucocyte Count (DLC)', group: 'Hematological', unit: '%', normalRange: 'N:40-75,L:20-45,M:2-10,E:1-6', resultType: 'text' },
  { id: 'hem_004', name: 'Platelet Count', group: 'Hematological', unit: '/mm³', normalRange: '150,000-450,000', resultType: 'numeric' },
  { id: 'hem_005', name: 'Erythrocyte Sedimentation Rate (ESR)', group: 'Hematological', unit: 'mm/hr', normalRange: '0-20', resultType: 'numeric' },
  { id: 'hem_006', name: 'Prothrombin Time (PT)', group: 'Hematological', unit: 'sec', normalRange: '11-13.5', resultType: 'numeric' },
  { id: 'hem_007', name: 'Activated Partial Thromboplastin Time (aPTT)', group: 'Hematological', unit: 'sec', normalRange: '25-35', resultType: 'numeric' },
  { id: 'hem_008', name: 'Reticulocyte Count', group: 'Hematological', unit: '%', normalRange: '0.5-2.5', resultType: 'numeric' },
  { id: 'hem_009', name: 'Peripheral Blood Smear (PBS)', group: 'Hematological', resultType: 'text' },
  { id: 'hem_010', name: 'INR', group: 'Hematological', unit: '', normalRange: '0.8-1.2', resultType: 'numeric' },
  { id: 'hem_011', name: 'Complete Blood Count (CBC)', group: 'Hematological', resultType: 'text' },

  // Biochemistry
  { id: 'bio_001', name: 'Blood Urea', group: 'Biochemistry', unit: 'mg/dL', normalRange: '15-45', resultType: 'numeric' },
  { id: 'bio_002', name: 'Serum Creatinine', group: 'Biochemistry', unit: 'mg/dL', normalRange: '0.6-1.2', resultType: 'numeric' },
  { id: 'bio_003', name: 'Serum Sodium (Na+)', group: 'Biochemistry', unit: 'mEq/L', normalRange: '135-145', resultType: 'numeric' },
  { id: 'bio_004', name: 'Serum Potassium (K+)', group: 'Biochemistry', unit: 'mEq/L', normalRange: '3.5-5.1', resultType: 'numeric' },
  { id: 'bio_005', name: 'Serum Bicarbonate', group: 'Biochemistry', unit: 'mEq/L', normalRange: '22-29', resultType: 'numeric' },
  { id: 'bio_006', name: 'Serum Calcium', group: 'Biochemistry', unit: 'mg/dL', normalRange: '8.5-10.5', resultType: 'numeric' },
  { id: 'bio_007', name: 'Serum Phosphate', group: 'Biochemistry', unit: 'mg/dL', normalRange: '2.5-4.5', resultType: 'numeric' },
  { id: 'bio_008', name: 'Serum Uric Acid', group: 'Biochemistry', unit: 'mg/dL', normalRange: '3.5-7.2', resultType: 'numeric' },
  { id: 'bio_009', name: 'Alkaline Phosphatase (ALP)', group: 'Biochemistry', unit: 'IU/L', normalRange: '44-147', resultType: 'numeric' },
  { id: 'bio_010', name: 'Total Protein', group: 'Biochemistry', unit: 'g/dL', normalRange: '6.0-8.3', resultType: 'numeric' },
  { id: 'bio_011', name: 'Serum Albumin', group: 'Biochemistry', unit: 'g/dL', normalRange: '3.5-5.5', resultType: 'numeric' },
  { id: 'bio_012', name: 'Fasting Blood Sugar (FBS)', group: 'Biochemistry', unit: 'mg/dL', normalRange: '70-100', resultType: 'numeric' },
  { id: 'bio_013', name: 'Post Prandial Blood Sugar (PPBS)', group: 'Biochemistry', unit: 'mg/dL', normalRange: '<140', resultType: 'numeric' },
  { id: 'bio_014', name: 'HbA1c', group: 'Biochemistry', unit: '%', normalRange: '<5.7', resultType: 'numeric' },
  { id: 'bio_016', name: 'Liver Function Test (LFT)', group: 'Biochemistry', resultType: 'text' },
  { id: 'bio_017', name: 'Kidney Function Test (KFT)', group: 'Biochemistry', resultType: 'text' },
  { id: 'bio_018', name: 'eGFR', group: 'Biochemistry', unit: 'mL/min/1.73m²', normalRange: '>90', resultType: 'numeric' },
  { id: 'bio_019', name: 'Total Cholesterol', group: 'Biochemistry', unit: 'mg/dL', normalRange: '<200', resultType: 'numeric' },
  { id: 'bio_020', name: 'HDL Cholesterol', group: 'Biochemistry', unit: 'mg/dL', normalRange: '>40', resultType: 'numeric' },
  { id: 'bio_021', name: 'LDL Cholesterol', group: 'Biochemistry', unit: 'mg/dL', normalRange: '<100', resultType: 'numeric' },
  
  // Radiology
  { id: 'rad_001', name: 'USG KUB', group: 'Radiology', resultType: 'text' },
  { id: 'rad_002', name: 'Chest X-Ray (CXR)', group: 'Radiology', resultType: 'text' },
  { id: 'rad_003', name: 'CT KUB (NCCT)', group: 'Radiology', resultType: 'text' },
  { id: 'rad_004', name: 'CT Abdomen', group: 'Radiology', resultType: 'text' },
  { id: 'rad_005', name: 'MRI Abdomen', group: 'Radiology', resultType: 'text' },

  // Serology
  { id: 'ser_001', name: 'HBsAg', group: 'Serology', resultType: 'select', options: ['Positive', 'Negative'] },
  { id: 'ser_002', name: 'Anti-HCV', group: 'Serology', resultType: 'select', options: ['Positive', 'Negative'] },
  { id: 'ser_003', name: 'HIV I & II', group: 'Serology', resultType: 'select', options: ['Positive', 'Negative'] },
  { id: 'ser_004', name: 'ANA (Antinuclear Antibody)', group: 'Serology', resultType: 'select', options: ['Positive', 'Negative'] },
  { id: 'ser_005', name: 'dsDNA', group: 'Serology', resultType: 'numeric', unit: 'IU/mL' },
  { id: 'ser_006', name: 'C3', group: 'Serology', unit: 'mg/dL', normalRange: '90-180', resultType: 'numeric' },
  { id: 'ser_007', name: 'C4', group: 'Serology', unit: 'mg/dL', normalRange: '10-40', resultType: 'numeric' },
  { id: 'ser_008', name: 'ANCA (p-ANCA, c-ANCA)', group: 'Serology', resultType: 'select', options: ['Positive', 'Negative', 'Atypical'] },
  { id: 'ser_009', name: 'Anti-GBM Antibody', group: 'Serology', resultType: 'select', options: ['Positive', 'Negative'] },
  { id: 'ser_010', name: 'Anti PLA2R antibody', group: 'Serology', resultType: 'select', options: ['Positive', 'Negative'] },

  // Urine Analysis
  { id: 'urn_001', name: 'Urine Routine & Microscopy (R/M)', group: 'Urine Analysis', resultType: 'text' },
  { id: 'urn_002', name: 'Urine Culture & Sensitivity', group: 'Urine Analysis', resultType: 'text' },
  { id: 'urn_003', name: '24-hour Urine Protein', group: 'Urine Analysis', unit: 'mg/day', normalRange: '<150', resultType: 'numeric' },
  { id: 'urn_004', name: 'Urine Spot Protein/Creatinine Ratio (PCR)', group: 'Urine Analysis', unit: 'mg/g', normalRange: '<150', resultType: 'numeric' },
  { id: 'urn_005', name: 'Urine for AC Ratio (mg/gm)', group: 'Urine Analysis', unit: 'mg/gm', normalRange: '<30', resultType: 'numeric' },
  
  // Special Investigations
  { id: 'spc_001', name: 'Kidney Biopsy', group: 'Special Investigations', resultType: 'text' },
  { id: 'spc_002', name: 'ECG', group: 'Special Investigations', resultType: 'text' },
  { id: 'spc_003', name: '2D Echocardiography', group: 'Special Investigations', resultType: 'text' },

  // Microbiology
  { id: 'mic_001', name: 'Blood Culture & Sensitivity', group: 'Microbiology', resultType: 'text' },
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

// Dialysis Related Constants
export const DIALYSIS_INDICATIONS = ["CKD", "AKI", "Drug Overdose", "Fluid Overload", "Hyperkalemia", "Metabolic Acidosis", "Others"] as const;
export const COMORBIDITIES = ["Diabetes", "HTN", "CAD", "Sepsis", "Cirrhosis", "Pregnancy", "Others"] as const;
export const DIALYSIS_TYPES = ["Hemodialysis", "Peritoneal Dialysis"] as const;
export const HD_MODALITIES = ["HD", "HDF"] as const;
export const SESSION_LOCATIONS = ["Home", "Healthcare Facility"] as const;
export const HD_COMPLICATIONS = ["Hypotension", "Cramp", "Nausea", "Vomiting", "Chest Pain", "Hypoglycemia", "Fever/Chills", "Others"] as const;
export const HD_COMPLICATION_MANAGEMENTS = ["Saline Bolus", "Reduction in UFR", "Temporary cessation of UF", "Others"] as const;
export const ACCESS_TYPES = ["AV Fistula", "Temporary Catheter", "Tunneled Cuff Catheter", "PD catheter"] as const;
export const VASCULAR_ACCESS_LOCATIONS = ["Left Radiocephalic Fistula", "Right Radiocephalic Fistula", "Left Brachiocephalic Fistula", "Right Brachiocephalic Fistula", "Right IJV Catheter", "Left IJV Catheter", "Right TCC-IJV", "Left TCC-IJV", "Femoral Catheter"] as const;
export const ANTICOAGULATION_TYPES = ["Heparin", "Citrate", "None"] as const;
