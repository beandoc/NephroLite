
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
  primaryDiagnosis: string;
  labels: string[];
  tags: string[];
  nutritionalStatus: string;
  disability: string;
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
