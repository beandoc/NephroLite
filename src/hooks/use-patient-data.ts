
"use client";

import type { Patient, Vaccination, ClinicalProfile, PatientFormData } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { VACCINATION_NAMES, PRIMARY_DIAGNOSIS_OPTIONS, NUTRITIONAL_STATUSES, DISABILITY_PROFILES, BLOOD_GROUPS, RESIDENCE_TYPES } from '@/lib/constants';

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
      nephroId: 'MOCK-0001',
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
      clinicalProfile: {
        ...getInitialClinicalProfile(),
        primaryDiagnosis: 'Chronic Kidney Disease (CKD)',
        tags: ['Stage 3 CKD', 'Anemia', 'Diabetes', 'PD'], // Added PD tag
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
      nephroId: 'MOCK-0002',
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
      clinicalProfile: {
        ...getInitialClinicalProfile(),
        primaryDiagnosis: 'Diabetic Nephropathy',
        tags: ['Diabetes', 'Proteinuria', 'PD'], // Added PD tag
      },
      registrationDate: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
    },
    {
      id: crypto.randomUUID(),
      nephroId: 'MOCK-0003',
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

  const getPatientsList = useCallback((): Patient[] => {
    return patients;
  }, [patients]);

  const getPatientById = useCallback((id: string): Patient | undefined => {
    return patients.find(p => p.id === id);
  }, [patients]);

  const addPatient = useCallback((patientData: PatientFormData): Patient => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // MM
    const year = String(now.getFullYear()).slice(-2); // YY
    const constructedNephroId = `${patientData.customIdPrefix}/${month}${year}`;

    const newPatient: Patient = {
      id: crypto.randomUUID(),
      nephroId: constructedNephroId,
      registrationDate: now.toISOString().split('T')[0],
      patientStatus: 'OPD',
      name: patientData.name,
      dob: patientData.dob,
      gender: patientData.gender,
      contact: patientData.contact,
      email: patientData.email,
      address: patientData.address,
      guardian: patientData.guardian,
      clinicalProfile: {
        ...getInitialClinicalProfile(),
        ...(patientData.clinicalProfile || {}),
      },
      serviceName: patientData.serviceName,
      serviceNumber: patientData.serviceNumber,
      rank: patientData.rank,
      unitName: patientData.unitName,
      formation: patientData.formation,
      nextAppointmentDate: patientData.nextAppointmentDate,
      isTracked: patientData.isTracked || false,
      residenceType: patientData.residenceType,
    };
    const updatedPatients = [...patients, newPatient];
    saveData(updatedPatients);
    return newPatient;
  }, [patients, saveData]);

  const updatePatient = useCallback((updatedPatientData: PatientFormData & { id: string }): Patient | undefined => {
    const patientIndex = patients.findIndex(p => p.id === updatedPatientData.id);
    if (patientIndex === -1) return undefined;

    const updatedPatients = [...patients];
    const originalPatient = updatedPatients[patientIndex];

    const prefix = updatedPatientData.customIdPrefix;
    const existingSuffix = originalPatient.nephroId.includes('/') ? originalPatient.nephroId.split('/')[1] : null;
    
    // Use existing registration month/year for suffix if available
    const suffix = existingSuffix || `${new Date(originalPatient.registrationDate).toISOString().slice(5,7)}${new Date(originalPatient.registrationDate).toISOString().slice(2,4)}`;
    
    const finalNephroId = `${prefix}/${suffix}`;
    
    updatedPatients[patientIndex] = {
      ...originalPatient,
      ...updatedPatientData,
      nephroId: finalNephroId,
      clinicalProfile: {
        ...originalPatient.clinicalProfile,
        ...updatedPatientData.clinicalProfile,
      }
    };

    saveData(updatedPatients);
    return updatedPatients[patientIndex];
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
    getPatientsList,
    getPatientById,
    addPatient,
    updatePatient,
    deletePatient,
    admitPatient,
    dischargePatient,
  };
}
