
"use client";

import type { Patient, Vaccination } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { VACCINATION_NAMES } from '@/lib/constants';

const LOCAL_STORAGE_KEY = 'nephrolite_patients';
let nextNephroIdCounter = 1;

const generateNephroId = (currentMaxId: number): string => {
  return `NL-${String(currentMaxId).padStart(4, '0')}`;
};

const getDefaultVaccinations = (): Vaccination[] => {
  return VACCINATION_NAMES.map(name => ({ name, administered: false, date: '' }));
};

const getInitialPatients = (): Patient[] => {
  if (typeof window === 'undefined') return [];
  const storedPatients = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedPatients) {
    const patients: Patient[] = JSON.parse(storedPatients).map((p: any) => ({
      ...p,
      clinicalProfile: {
        ...p.clinicalProfile,
        vaccinations: p.clinicalProfile.vaccinations && p.clinicalProfile.vaccinations.length > 0 
                      ? p.clinicalProfile.vaccinations 
                      : getDefaultVaccinations(),
        subspecialityFollowUp: p.clinicalProfile.subspecialityFollowUp || 'NIL',
        smokingStatus: p.clinicalProfile.smokingStatus || 'NIL',
        alcoholConsumption: p.clinicalProfile.alcoholConsumption || 'NIL',
      },
      // Initialize new service fields if they don't exist
      serviceName: p.serviceName || undefined,
      serviceNumber: p.serviceNumber || undefined,
      rank: p.rank || undefined,
      unitName: p.unitName || undefined,
      formation: p.formation || undefined,
    }));
    
    if (patients.length > 0) {
      const maxIdNum = patients.reduce((max, p) => {
        const num = parseInt(p.nephroId.replace('NL-', ''), 10);
        return num > max ? num : max;
      }, 0);
      nextNephroIdCounter = maxIdNum + 1;
    } else {
      nextNephroIdCounter = 1;
    }
    return patients;
  }

  const mockPatients: Patient[] = [
    {
      id: crypto.randomUUID(),
      nephroId: generateNephroId(nextNephroIdCounter++),
      name: 'Rajesh Kumar',
      dob: '1975-08-15',
      gender: 'Male',
      contact: '9876543210',
      email: 'rajesh.kumar@example.com',
      address: { street: '123 MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', country: 'India' },
      guardian: { name: 'Sunita Kumar', relation: 'Spouse', contact: '9876543211' },
      clinicalProfile: {
        primaryDiagnosis: 'Chronic Kidney Disease (CKD)',
        labels: ['Hypertension', 'Diabetes'],
        tags: ['Stage 3 CKD', 'Anemia'],
        nutritionalStatus: 'Mild malnutrition',
        disability: 'None',
        subspecialityFollowUp: 'Cardiology',
        smokingStatus: 'No',
        alcoholConsumption: 'No',
        vaccinations: [
          { name: 'Hepatitis B', administered: true, date: '2023-01-10' },
          { name: 'Pneumococcal', administered: true, date: '2023-02-15' },
          { name: 'Influenza', administered: false, date: '' },
          { name: 'Covid', administered: true, date: '2021-06-01' },
          { name: 'Varicella', administered: false, date: '' },
        ],
      },
      registrationDate: new Date().toISOString().split('T')[0],
      serviceName: "Indian Army",
      serviceNumber: "AR12345X",
      rank: "Colonel",
      unitName: "1st Medical Battalion",
      formation: "Mountain Brigade"
    },
    {
      id: crypto.randomUUID(),
      nephroId: generateNephroId(nextNephroIdCounter++),
      name: 'Priya Sharma',
      dob: '1982-04-22',
      gender: 'Female',
      contact: '9123456789',
      email: 'priya.sharma@example.com',
      address: { street: '456 Park Street', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India' },
      guardian: { name: 'Amit Sharma', relation: 'Spouse', contact: '9123456788' },
      clinicalProfile: {
        primaryDiagnosis: 'Diabetic Nephropathy',
        labels: ['Type 2 Diabetes'],
        tags: ['Proteinuria', 'Controlled BP'],
        nutritionalStatus: 'Well-nourished',
        disability: 'Mild visual impairment',
        subspecialityFollowUp: 'Endocrinology',
        smokingStatus: 'NIL',
        alcoholConsumption: 'NIL',
        vaccinations: getDefaultVaccinations(),
      },
      registrationDate: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0], 
    },
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

  const addPatient = useCallback((patientData: Omit<Patient, 'id' | 'nephroId' | 'registrationDate'>): Patient => {
    const newPatient: Patient = {
      ...patientData,
      id: crypto.randomUUID(),
      nephroId: generateNephroId(nextNephroIdCounter++),
      registrationDate: new Date().toISOString().split('T')[0],
      clinicalProfile: {
        ...patientData.clinicalProfile,
        vaccinations: patientData.clinicalProfile.vaccinations && patientData.clinicalProfile.vaccinations.length > 0 
                      ? patientData.clinicalProfile.vaccinations 
                      : getDefaultVaccinations(),
        subspecialityFollowUp: patientData.clinicalProfile.subspecialityFollowUp || 'NIL',
        smokingStatus: patientData.clinicalProfile.smokingStatus || 'NIL',
        alcoholConsumption: patientData.clinicalProfile.alcoholConsumption || 'NIL',
      },
      serviceName: patientData.serviceName || undefined,
      serviceNumber: patientData.serviceNumber || undefined,
      rank: patientData.rank || undefined,
      unitName: patientData.unitName || undefined,
      formation: patientData.formation || undefined,
    };
    const updatedPatients = [...patients, newPatient];
    saveData(updatedPatients);
    return newPatient;
  }, [patients, saveData]);

  const updatePatient = useCallback((updatedPatientData: Patient): Patient | undefined => {
    const patientIndex = patients.findIndex(p => p.id === updatedPatientData.id);
    if (patientIndex === -1) return undefined;

    const updatedPatients = [...patients];
    updatedPatients[patientIndex] = {
      ...updatedPatientData,
      clinicalProfile: {
        ...updatedPatientData.clinicalProfile,
        vaccinations: Array.isArray(updatedPatientData.clinicalProfile.vaccinations) 
                      ? updatedPatientData.clinicalProfile.vaccinations 
                      : getDefaultVaccinations(),
      }
    };
    saveData(updatedPatients);
    return updatedPatientData;
  }, [patients, saveData]);

  const deletePatient = useCallback((id: string): boolean => {
    const updatedPatients = patients.filter(p => p.id !== id);
    if (updatedPatients.length === patients.length) return false;
    saveData(updatedPatients);
    return true;
  }, [patients, saveData]);
  
  return {
    patients,
    isLoading,
    getPatientsList,
    getPatientById,
    addPatient,
    updatePatient,
    deletePatient,
  };
}

