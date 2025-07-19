
"use client";

import type { Patient, Vaccination, ClinicalProfile, PatientFormData, VisitFormData, Visit } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { VACCINATION_NAMES, PRIMARY_DIAGNOSIS_OPTIONS, NUTRITIONAL_STATUSES, DISABILITY_PROFILES, BLOOD_GROUPS, RESIDENCE_TYPES } from '@/lib/constants';
import { format } from 'date-fns';

const LOCAL_STORAGE_KEY = 'nephrolite_patients';

const getDefaultVaccinations = (): Vaccination[] => {
  return VACCINATION_NAMES.map(name => ({
    name: name,
    administered: false,
    date: "",
    nextDoseDate: ""
  }));
};

const getInitialClinicalProfile = (): ClinicalProfile => ({
  primaryDiagnosis: PRIMARY_DIAGNOSIS_OPTIONS.includes('Not Set') ? 'Not Set' : PRIMARY_DIAGNOSIS_OPTIONS[0] || "",
  tags: [],
  nutritionalStatus: NUTRITIONAL_STATUSES.includes('Not Set') ? 'Not Set' : NUTRITIONAL_STATUSES[0] || "",
  disability: DISABILITY_PROFILES.includes('Not Set') ? 'Not Set' : DISABILITY_PROFILES[0] || "",
  subspecialityFollowUp: 'NIL',
  smokingStatus: 'NIL',
  alcoholConsumption: 'NIL',
  vaccinations: getDefaultVaccinations(),
  pomr: "",
  aabhaNumber: "",
  bloodGroup: BLOOD_GROUPS.includes('Unknown') ? 'Unknown' : BLOOD_GROUPS[0] || "",
  drugAllergies: "",
  whatsappNumber: "",
});


const getInitialPatients = (): Patient[] => {
  if (typeof window === 'undefined') return [];
  const storedPatients = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedPatients) {
    try {
      const patients: Patient[] = JSON.parse(storedPatients).map((p: any) => ({
        ...p,
        id: p.id || crypto.randomUUID(),
        nephroId: p.nephroId || `MOCK-${(p.id || crypto.randomUUID()).substring(0,4)}`,
        patientStatus: p.patientStatus || 'OPD',
        nextAppointmentDate: p.nextAppointmentDate || undefined,
        isTracked: p.isTracked || false,
        residenceType: p.residenceType || (RESIDENCE_TYPES.includes('Not Set') ? 'Not Set' : RESIDENCE_TYPES[0]),
        visits: p.visits || [], // Add visits array
        clinicalProfile: {
          ...getInitialClinicalProfile(),
          ...(p.clinicalProfile || {}),
          vaccinations: Array.isArray(p.clinicalProfile?.vaccinations) && p.clinicalProfile.vaccinations.length > 0
                        ? VACCINATION_NAMES.map(vaccineName => {
                            const existingVaccine = p.clinicalProfile.vaccinations.find((v: Vaccination) => v.name === vaccineName);
                            return {
                              name: vaccineName,
                              administered: existingVaccine?.administered || false,
                              date: existingVaccine?.date || "",
                              nextDoseDate: existingVaccine?.nextDoseDate || "",
                            };
                          })
                        : getDefaultVaccinations(),
        },
      }));
      return patients;
    } catch (e) {
      console.error("Failed to parse patient data from localStorage:", e);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }

  // If no stored data or parsing fails, return mock data
  const mockPatients: Patient[] = [
    {
      id: "fixed-pd-patient-id-1", // Fixed ID for Rajesh Kumar
      nephroId: '1001/0724',
      name: 'Rajesh Kumar',
      dob: '1975-08-15',
      gender: 'Male',
      contact: '9876543210',
      email: 'rajesh.kumar@example.com',
      address: { street: '123 MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', country: 'India' },
      guardian: { name: 'Sunita Kumar', relation: 'Spouse', contact: '9876543211' },
      patientStatus: 'OPD',
      nextAppointmentDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      isTracked: true,
      residenceType: 'Urban',
      visits: [],
      clinicalProfile: {
        ...getInitialClinicalProfile(),
        primaryDiagnosis: 'Chronic Kidney Disease (CKD)',
        tags: ['Stage 3 CKD', 'Anemia', 'Diabetes', 'PD'], // Added PD tag
        whatsappNumber: '9876543210',
        aabhaNumber: '12-3456-7890-1234',
      },
      registrationDate: new Date().toISOString().split('T')[0],
      serviceName: "Indian Army",
      serviceNumber: "AR12345X",
      rank: "Colonel",
      unitName: "1st Medical Battalion",
      formation: "Mountain Brigade"
    },
    {
      id: "fixed-pd-patient-id-2", // Fixed ID for Priya Sharma
      nephroId: '1002/0724',
      name: 'Priya Sharma',
      dob: '1982-04-22',
      gender: 'Female',
      contact: '9123456789',
      email: 'priya.sharma@example.com',
      address: { street: '456 Park Street', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India' },
      guardian: { name: 'Amit Sharma', relation: 'Spouse', contact: '9123456788' },
      patientStatus: 'IPD',
      isTracked: false,
      residenceType: 'Rural',
      visits: [],
      clinicalProfile: {
        ...getInitialClinicalProfile(),
        primaryDiagnosis: 'Diabetic Nephropathy',
        tags: ['Diabetes', 'Proteinuria', 'PD'], // Added PD tag
      },
      registrationDate: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
    },
    {
      id: crypto.randomUUID(),
      nephroId: '1003/0624',
      name: 'Amit Singh',
      dob: '1990-11-05',
      gender: 'Male',
      contact: '9988776655',
      email: 'amit.singh@example.com',
      address: { street: '789 Ganges Road', city: 'Varanasi', state: 'Uttar Pradesh', pincode: '221001', country: 'India' },
      guardian: { name: 'Rekha Singh', relation: 'Mother', contact: '9988776650' },
      patientStatus: 'OPD',
      isTracked: true,
      residenceType: 'Urban',
      visits: [],
      clinicalProfile: {
        ...getInitialClinicalProfile(),
        primaryDiagnosis: 'Glomerulonephritis',
        tags: ['GN', 'Hematuria'],
      },
      registrationDate: new Date(Date.now() - 86400000 * 30).toISOString().split('T')[0],
    }
  ];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockPatients));
  return mockPatients;
};


export function usePatientData() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPatients(getInitialPatients());
    setIsLoading(false);
  }, []);

  const saveData = useCallback((updatedPatients: Patient[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPatients));
    setPatients(updatedPatients);
  }, []);
  
  const addPatient = useCallback((patientData: PatientFormData): Patient => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    
    // Find the highest existing number for the current month/year to avoid collisions
    const relevantPatients = patients.filter(p => p.nephroId.endsWith(`/${month}${year}`));
    const maxId = relevantPatients.reduce((max, p) => {
        const numPart = p.nephroId.split('/')[0];
        const num = parseInt(numPart, 10);
        return !isNaN(num) && num > max ? num : max;
    }, 1000); // Start from 1001

    const newIdNumber = maxId + 1;
    
    const newPatient: Patient = {
      id: crypto.randomUUID(),
      nephroId: `${newIdNumber}/${month}${year}`,
      name: patientData.name,
      dob: patientData.dob,
      gender: patientData.gender,
      contact: patientData.contact,
      email: patientData.email,
      address: {
        street: patientData.address.street || "",
        city: patientData.address.city || "",
        state: patientData.address.state || "",
        pincode: patientData.address.pincode || "",
      },
      guardian: {
        name: patientData.guardian.name || "",
        relation: patientData.guardian.relation || "",
        contact: patientData.guardian.contact || "",
      },
      registrationDate: now.toISOString().split('T')[0],
      patientStatus: 'OPD',
      isTracked: false,
      residenceType: 'Not Set',
      visits: [],
      clinicalProfile: {
        ...getInitialClinicalProfile(),
        whatsappNumber: patientData.whatsappNumber || '',
        aabhaNumber: patientData.uhid || '',
      },
    };

    const updatedPatients = [...patients, newPatient];
    saveData(updatedPatients);
    return newPatient;
  }, [patients, saveData]);

  const getPatientsList = useCallback((): Patient[] => {
    return patients;
  }, [patients]);

  const getPatientById = useCallback((id: string): Patient | undefined => {
    return patients.find(p => p.id === id);
  }, [patients]);
  
  const updatePatient = useCallback((updatedPatientData: Patient): Patient | undefined => {
    const patientIndex = patients.findIndex(p => p.id === updatedPatientData.id);
    if (patientIndex === -1) return undefined;

    const updatedPatients = [...patients];
    updatedPatients[patientIndex] = updatedPatientData;

    saveData(updatedPatients);
    return updatedPatients[patientIndex];
  }, [patients, saveData]);

  const addVisitToPatient = useCallback((patientId: string, visitData: VisitFormData) => {
    const patientIndex = patients.findIndex(p => p.id === patientId);
    if (patientIndex === -1) {
      console.error("Patient not found for adding visit");
      return;
    };
    
    const updatedPatients = [...patients];
    const patient = updatedPatients[patientIndex];
    
    // Create a new visit object
    const newVisit: Visit = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      ...visitData,
      patientGender: patient.gender,
    };

    if (!patient.visits) {
      patient.visits = [];
    }
    patient.visits.push(newVisit);

    const newTags = new Set([...patient.clinicalProfile.tags, visitData.groupName]);
    patient.clinicalProfile.tags = Array.from(newTags);

    if (patient.clinicalProfile.primaryDiagnosis === 'Not Set' && visitData.groupName !== 'Misc') {
        patient.clinicalProfile.primaryDiagnosis = visitData.groupName;
    }
    
    const visitRemarkEntry = `[${format(new Date(newVisit.date), 'yyyy-MM-dd')}] Visit (${newVisit.visitType}): ${newVisit.visitRemark}`;
    patient.clinicalProfile.pomr = patient.clinicalProfile.pomr 
      ? `${patient.clinicalProfile.pomr}\n${visitRemarkEntry}`
      : visitRemarkEntry;

    updatedPatients[patientIndex] = patient;
    saveData(updatedPatients);
  }, [patients, saveData]);

  const deletePatient = useCallback((id: string): boolean => {
    const updatedPatients = patients.filter(p => p.id !== id);
    if (updatedPatients.length === patients.length) return false;
    saveData(updatedPatients);
    return true;
  }, [patients, saveData]);

  const admitPatient = useCallback((patientId: string): Patient | undefined => {
    const patientIndex = patients.findIndex(p => p.id === patientId);
    if (patientIndex === -1) return undefined;
    const updatedPatients = [...patients];
    updatedPatients[patientIndex] = { ...updatedPatients[patientIndex], patientStatus: 'IPD' };
    saveData(updatedPatients);
    return updatedPatients[patientIndex];
  }, [patients, saveData]);

  const dischargePatient = useCallback((patientId: string): Patient | undefined => {
    const patientIndex = patients.findIndex(p => p.id === patientId);
    if (patientIndex === -1) return undefined;
    const updatedPatients = [...patients];
    updatedPatients[patientIndex] = { ...updatedPatients[patientIndex], patientStatus: 'Discharged' };
    saveData(updatedPatients);
    return updatedPatients[patientIndex];
  }, [patients, saveData]);

  return {
    patients,
    isLoading,
    addPatient,
    getPatientsList,
    getPatientById,
    updatePatient,
    deletePatient,
    admitPatient,
    dischargePatient,
    addVisitToPatient,
  };
}
