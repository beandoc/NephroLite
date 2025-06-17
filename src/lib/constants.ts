
export const GENDERS: string[] = ['Male', 'Female', 'Other', 'Prefer not to say'];

export const INDIAN_STATES: string[] = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep', 'Delhi', 'Puducherry', 'Ladakh', 'Jammu and Kashmir'
];

export const RELATIONSHIPS: string[] = ['Parent', 'Spouse', 'Sibling', 'Child', 'Guardian', 'Friend', 'Other'];

export const PRIMARY_DIAGNOSIS_OPTIONS: string[] = [
  'Chronic Kidney Disease (CKD)',
  'Acute Kidney Injury (AKI)',
  'Glomerulonephritis', // Generic GN
  'Polycystic Kidney Disease (PKD)',
  'Diabetic Nephropathy',
  'Hypertensive Nephropathy',
  'Kidney Stones',
  'Urinary Tract Infection (UTI) - Complicated',
  'End-Stage Renal Disease (ESRD)',
  'IgA Nephropathy (IgAN)', // Specific GN tag
  'Focal Segmental Glomerulosclerosis (FSGS)', // Specific GN tag
  'Systemic Lupus Erythematosus (SLE)', // Often related to LN
  'Lupus Nephritis (LN)', // Specific GN tag
  'Nephrotic Syndrome (NS)', // Specific GN tag
  'Membranous Glomerulonephritis (MGN)', // Specific GN tag
  'Minimal Change Disease (MCD)', // Specific GN tag
  'Proteinuria (PRT)', // Symptom/finding, can be tag
  'Congenital Anomalies of the Kidney and Urinary Tract (CAKUT)', // Can be tag
  'Renal Artery Stenosis (RAS)', // Can be tag
  'Glomerulonephritis (GN) - Unspecified', // Another way to put generic GN
  'Transplant Prospect', // Tag
  'Potential Kidney Donor', // Tag
  'Other',
];

export const NUTRITIONAL_STATUSES: string[] = [
  'Well-nourished',
  'Mild malnutrition',
  'Moderate malnutrition',
  'Severe malnutrition',
  'Obese',
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
];

// These can be used for Visit Remarks or specific event types in a GN module
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


export const APPOINTMENT_TYPES: string[] = [ // General appointment types
  'Routine Checkup',
  'Follow-up',
  'Dialysis Session',
  'Consultation',
  'Emergency',
  'Lab Results Review',
  'Transplant Evaluation',
  // Consider adding GN specific types if needed, or use remarks
  'GN Monitoring Visit',
];


export const APPOINTMENT_STATUSES: Array<'Scheduled' | 'Completed' | 'Cancelled'> = ['Scheduled', 'Completed', 'Cancelled'];

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

export const VACCINATION_NAMES: string[] = [
  'Hepatitis B', 'Pneumococcal', 'Influenza', 'Covid', 'Varicella'
];
