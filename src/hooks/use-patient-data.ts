
"use client";

import type { Patient } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const LOCAL_STORAGE_KEY = 'nephrolite_patients';
let nextNephroIdCounter = 1;

const generateNephroId = (currentMaxId: number): string => {
  return `NL-${String(currentMaxId).padStart(4, '0')}`;
};

const getInitialPatients = (): Patient[] => {
  if (typeof window === 'undefined') return [];
  const storedPatients = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedPatients) {
    const patients: Patient[] = JSON.parse(storedPatients);
    // Determine the next Nephro ID counter based on existing patients
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

  // Initialize with some mock data if localStorage is empty
  const mockPatients: Patient[] = [
    {
      id: crypto.randomUUID(),
      nephroId: generateNephroId(nextNephroIdCounter++),
      name: 'Rajesh Kumar',
      dob: '1975-08-15',
      gender: 'Male',
      contact: '9876543210',
      email: 'rajesh.kumar@example.com',
      address: { street: '123 MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
      guardian: { name: 'Sunita Kumar', relation: 'Spouse', contact: '9876543211' },
      clinicalProfile: {
        primaryDiagnosis: 'Chronic Kidney Disease (CKD)',
        labels: ['Hypertension', 'Diabetes'],
        tags: ['Stage 3 CKD', 'Anemia'],
        nutritionalStatus: 'Mild malnutrition',
        disability: 'None',
      },
      registrationDate: new Date().toISOString().split('T')[0],
    },
    {
      id: crypto.randomUUID(),
      nephroId: generateNephroId(nextNephroIdCounter++),
      name: 'Priya Sharma',
      dob: '1982-04-22',
      gender: 'Female',
      contact: '9123456789',
      email: 'priya.sharma@example.com',
      address: { street: '456 Park Street', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
      guardian: { name: 'Amit Sharma', relation: 'Spouse', contact: '9123456788' },
      clinicalProfile: {
        primaryDiagnosis: 'Diabetic Nephropathy',
        labels: ['Type 2 Diabetes'],
        tags: ['Proteinuria', 'Controlled BP'],
        nutritionalStatus: 'Well-nourished',
        disability: 'Mild visual impairment',
      },
      registrationDate: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0], // 10 days ago
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
    };
    const updatedPatients = [...patients, newPatient];
    saveData(updatedPatients);
    return newPatient;
  }, [patients, saveData]);

  const updatePatient = useCallback((updatedPatient: Patient): Patient | undefined => {
    const patientIndex = patients.findIndex(p => p.id === updatedPatient.id);
    if (patientIndex === -1) return undefined;

    const updatedPatients = [...patients];
    updatedPatients[patientIndex] = updatedPatient;
    saveData(updatedPatients);
    return updatedPatient;
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
