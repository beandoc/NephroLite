
export type Address = {
  street: string;
  city: string;
  state: string;
  pincode: string;
};

export type Guardian = {
  name: string;
  relation: string;
  contact: string;
};

export type ClinicalProfile = {
  primaryDiagnosis: string;
  labels: string[];
  tags: string[];
  nutritionalStatus: string;
  disability: string;
};

export type Patient = {
  id: string; // Unique internal ID, e.g., UUID
  nephroId: string; // User-facing ID, e.g., NL-0001
  name: string;
  dob: string; // Store as ISO string (YYYY-MM-DD)
  gender: string;
  contact: string;
  email?: string;
  address: Address;
  guardian: Guardian;
  clinicalProfile: ClinicalProfile;
  registrationDate: string; // Store as ISO string (YYYY-MM-DD)
};

export type Appointment = {
  id: string;
  patientId: string;
  patientName: string; // Denormalized for easier display
  date: string; // ISO string (YYYY-MM-DD)
  time: string; // HH:mm
  type: string;
  doctorName: string;
  notes?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
};

// Add other types as needed, e.g., User, Visit, Investigation etc.
