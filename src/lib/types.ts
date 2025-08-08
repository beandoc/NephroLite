





export type Address = {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
};

export type Guardian = {
  name?: string;
  relation?: string;
  contact?: string;
};

export type Vaccination = {
  name: string;
  administered: boolean;
  date?: string | null; // YYYY-MM-DD
  nextDoseDate?: string | null; // YYYY-MM-DD
};

export type ClinicalProfile = {
  primaryDiagnosis?: string;
  tags: string[];
  nutritionalStatus?: string;
  disability?: string;
  subspecialityFollowUp?: string;
  smokingStatus?: string; // 'Yes', 'No', 'NIL'
  alcoholConsumption?: string; // 'Yes', 'No', 'NIL'
  vaccinations: Vaccination[];
  pomr?: string; // Problem Oriented Medical Record
  aabhaNumber?: string;
  bloodGroup?: string;
  drugAllergies?: string;
  whatsappNumber?: string;
};

export type Diagnosis = {
  id: string;
  name: string;
  icdName?: string;
  icdCode?: string;
};

export type Medication = {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  instructions?: string;
};

export type ClinicalVisitData = {
  diagnoses?: Diagnosis[];
  history?: string;
  height?: string; // cm
  weight?: string; // kg
  bmi?: string; // kg/m^2
  idealBodyWeight?: string; // kg
  pulse?: string; // per minute
  systolicBP?: string; // mmHg
  diastolicBP?: string; // mmHg
  respiratoryRate?: string; // per minute
  generalExamination?: string;
  systemicExamination?: string;
  courseInHospital?: string;
  dischargeInstructions?: string;
  medications?: Medication[];
  opinionText?: string;
  recommendations?: string;
  usgReport?: string;
  kidneyBiopsyReport?: string;
};

export type Visit = {
  id: string;
  date: string; // YYYY-MM-DD
  visitType: string;
  visitRemark: string;
  groupName: string;
  patientGender?: 'Male' | 'Female';
  patientRelation?: string; // To check for 'Self'
  diagnoses?: Diagnosis[];
  clinicalData?: ClinicalVisitData;
  patientId: string;
};

export type InvestigationTest = {
  id: string; // Unique ID for the test entry within a record
  group: string; // e.g., 'Hematological', 'Biochemistry'
  name: string; // e.g., 'Hemoglobin', 'Serum Creatinine'
  result: string;
  unit?: string;
  normalRange?: string;
};

export type InvestigationRecord = {
  id: string; // Unique ID for the entire record/set of tests for a date
  date: string; // YYYY-MM-DD, date of investigation
  tests: InvestigationTest[];
  notes?: string; // Optional overall notes for this set of investigations
};


export type Patient = {
  id: string;
  nephroId: string;
  name: string;
  dob: string; // YYYY-MM-DD
  gender: 'Male' | 'Female';
  contact?: string;
  email?: string;
  address: Address;
  guardian: Guardian;
  clinicalProfile: ClinicalProfile;
  registrationDate: string; // YYYY-MM-DD
  // Service-related details
  serviceName?: string;
  serviceNumber?: string;
  rank?: string;
  unitName?: string;
  formation?: string;
  // New top-level fields
  patientStatus: 'OPD' | 'IPD' | 'Discharged';
  nextAppointmentDate?: string; // YYYY-MM-DD
  isTracked: boolean;
  residenceType?: 'Rural' | 'Urban' | 'Semi-Urban' | 'Other' | 'Not Set';
  visits: Visit[];
  investigationRecords?: InvestigationRecord[];
};

// This type mirrors the Zod schema in patient-form.tsx
export type PatientFormData = {
  name: string;
  dob: string;
  gender: 'Male' | 'Female';
  contact?: string;
  email?: string;
  whatsappNumber?: string;
  uhid?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  guardian: {
    name?: string;
    relation?: string;
    contact?: string;
  };
};


export type Appointment = {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: string;
  doctorName: string;
  notes?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Waiting' | 'Not Showed' | 'Admitted' | 'Now Serving';
};

// For Diagnosis and Medication Database Management
export type DiagnosisEntry = {
  id: string;
  name: string; // Primary, user-friendly name
  icdName: string; // Official ICD-10 description
  icdCode: string;
  clinicalNames: string[]; // All mappable clinical names including the primary one
};

export type MedicationEntry = {
  id: string;
  name: string;
  defaultDosage?: string;
  defaultFrequency?: string;
  commonInstructions?: string;
};

// For Patient Investigations
export type InvestigationMaster = {
  id: string;
  name: string;
  group: 'Hematological' | 'Biochemistry' | 'Radiology' | 'Pathology' | 'Special Investigations' | 'Urine Analysis' | 'Serology' | 'Microbiology';
  unit?: string;
  normalRange?: string;
};

export type InvestigationPanel = {
    id: string;
    name: string;
    group: InvestigationMaster['group'];
    testIds: string[];
};

export type VisitFormData = {
    visitType: string;
    visitRemark: string;
    groupName: string;
};

// This is the structure for the comprehensive clinical visit templates
export type DiagnosisTemplate = {
    templateName: string; 
    templateType: "Opinion Report" | "Discharge Summary";
    diagnoses: Diagnosis[];
    history?: string;
    generalExamination?: string;
    systemicExamination?: string;
    medications: Medication[];

    // Discharge Summary specific
    dischargeInstructions?: string;
    usgReport?: string;
    kidneyBiopsyReport?: string;

    // Opinion Report specific
    opinionText?: string;
    recommendations?: string;
}
