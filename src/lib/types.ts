
export type Address = {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
};

export type Guardian = {
  name: string;
  relation: string;
  contact: string;
};

export type Vaccination = {
  name: string;
  administered: boolean;
  date?: string; // YYYY-MM-DD
};

export type ClinicalProfile = {
  primaryDiagnosis: string; // Remains string, default "" if not set initially
  labels: string[];
  tags: string[];
  nutritionalStatus: string; // Remains string, default "" if not set initially
  disability: string; // Remains string, default "" if not set initially
  subspecialityFollowUp?: string;
  smokingStatus?: string; // 'Yes', 'No', 'NIL'
  alcoholConsumption?: string; // 'Yes', 'No', 'NIL'
  vaccinations?: Vaccination[];
};

export type Patient = {
  id: string;
  nephroId: string;
  name: string;
  dob: string;
  gender: string;
  contact: string;
  email?: string;
  address: Address;
  guardian: Guardian;
  clinicalProfile: ClinicalProfile;
  registrationDate: string;
  // Service-related details
  serviceName?: string;
  serviceNumber?: string;
  rank?: string;
  unitName?: string;
  formation?: string;
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
  status: 'Scheduled' | 'Completed' | 'Cancelled';
};

// For Diagnosis and Medication Database Management
export type DiagnosisEntry = {
  id: string;
  name: string;
  icdName: string;
  icdCode: string;
};

export type MedicationEntry = {
  id: string;
  name: string;
  defaultDosage?: string;
  defaultFrequency?: string;
  commonInstructions?: string;
};
