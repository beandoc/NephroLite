
"use client";

import type { Patient, Vaccination, ClinicalProfile } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { VACCINATION_NAMES, PRIMARY_DIAGNOSIS_OPTIONS, NUTRITIONAL_STATUSES, DISABILITY_PROFILES, BLOOD_GROUPS, YES_NO_UNKNOWN_OPTIONS } from '@/lib/constants';

const LOCAL_STORAGE_KEY = 'nephrolite_patients';
let nextNephroIdCounter = 1;

const generateNephroId = (currentMaxId: number): string => {
  return `NL-${String(currentMaxId).padStart(4, '0')}`;
};

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
  labels: [],
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
  compliance: 'Unknown',
  whatsappNumber: "",
});


const getInitialPatients = (): Patient[] => {
  if (typeof window === 'undefined') return [];
  const storedPatients = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedPatients) {
    const patients: Patient[] = JSON.parse(storedPatients).map((p: any) => ({
      ...p,
      patientStatus: p.patientStatus || 'OPD',
      nextAppointmentDate: p.nextAppointmentDate || undefined,
      isTracked: p.isTracked || false,
      clinicalProfile: {
        ...getInitialClinicalProfile(), 
        ...(p.clinicalProfile || {}), 
        primaryDiagnosis: p.clinicalProfile?.primaryDiagnosis || getInitialClinicalProfile().primaryDiagnosis,
        labels: Array.isArray(p.clinicalProfile?.labels) ? p.clinicalProfile.labels : [],
        tags: Array.isArray(p.clinicalProfile?.tags) ? p.clinicalProfile.tags : [],
        nutritionalStatus: p.clinicalProfile?.nutritionalStatus || getInitialClinicalProfile().nutritionalStatus,
        disability: p.clinicalProfile?.disability || getInitialClinicalProfile().disability,
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
        pomr: p.clinicalProfile?.pomr || "",
        subspecialityFollowUp: p.clinicalProfile?.subspecialityFollowUp || 'NIL',
        smokingStatus: p.clinicalProfile?.smokingStatus || 'NIL',
        alcoholConsumption: p.clinicalProfile?.alcoholConsumption || 'NIL',
        aabhaNumber: p.clinicalProfile?.aabhaNumber || "",
        bloodGroup: p.clinicalProfile?.bloodGroup || (BLOOD_GROUPS.includes('Unknown') ? 'Unknown' : BLOOD_GROUPS[0] || ""),
        drugAllergies: p.clinicalProfile?.drugAllergies || "",
        compliance: p.clinicalProfile?.compliance || 'Unknown',
        whatsappNumber: p.clinicalProfile?.whatsappNumber || "",
      },
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
      patientStatus: 'OPD',
      nextAppointmentDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0], // Approx 2 weeks
      isTracked: true,
      clinicalProfile: {
        ...getInitialClinicalProfile(),
        primaryDiagnosis: 'Chronic Kidney Disease (CKD)',
        labels: ['Hypertension', 'Diabetes'],
        tags: ['Stage 3 CKD', 'Anemia'],
        nutritionalStatus: 'Mild malnutrition',
        disability: 'None',
        subspecialityFollowUp: 'Cardiology',
        smokingStatus: 'No',
        alcoholConsumption: 'No',
        vaccinations: [
          { name: 'Hepatitis B', administered: true, date: '2023-01-10', nextDoseDate: '2023-07-10' },
          { name: 'Pneumococcal', administered: true, date: '2023-02-15' },
          { name: 'Influenza', administered: false, date: '' },
          { name: 'Covid', administered: true, date: '2021-06-01', nextDoseDate: '2021-12-01'},
          { name: 'Varicella', administered: false, date: '' },
        ],
        pomr: 'Patient has a history of hypertension and type 2 diabetes. Compliant with medications. Advised regular follow-ups.',
        aabhaNumber: '12-3456-7890-1234',
        bloodGroup: 'O+',
        drugAllergies: 'Penicillin',
        compliance: 'Yes',
        whatsappNumber: '9876543210',
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
      patientStatus: 'IPD',
      isTracked: false,
      clinicalProfile: {
        ...getInitialClinicalProfile(), 
        primaryDiagnosis: 'Diabetic Nephropathy',
        labels: ['Type 2 Diabetes'],
        tags: ['Proteinuria', 'Controlled BP'],
        nutritionalStatus: 'Well-nourished',
        disability: 'Mild visual impairment',
        pomr: 'Recent onset of proteinuria. Blood pressure well controlled with medication. Needs regular monitoring of kidney function.',
        bloodGroup: 'A+',
        compliance: 'Yes',
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

  const addPatient = useCallback((patientData: Omit<Patient, 'id' | 'nephroId' | 'registrationDate' | 'clinicalProfile' | 'patientStatus' | 'isTracked'> & { clinicalProfile?: Partial<ClinicalProfile>, nextAppointmentDate?:string, isTracked?: boolean }): Patient => {
    const newPatient: Patient = {
      id: crypto.randomUUID(),
      nephroId: generateNephroId(nextNephroIdCounter++),
      name: patientData.name,
      dob: patientData.dob,
      gender: patientData.gender,
      contact: patientData.contact,
      email: patientData.email,
      address: patientData.address,
      guardian: patientData.guardian,
      registrationDate: new Date().toISOString().split('T')[0],
      patientStatus: 'OPD',
      isTracked: patientData.isTracked || false,
      nextAppointmentDate: patientData.nextAppointmentDate || undefined,
      clinicalProfile: {
        ...getInitialClinicalProfile(),
        ...(patientData.clinicalProfile || {}),
        labels: patientData.clinicalProfile?.labels || [], 
        tags: patientData.clinicalProfile?.tags || [],     
        vaccinations: patientData.clinicalProfile?.vaccinations && patientData.clinicalProfile.vaccinations.length > 0
                      ? patientData.clinicalProfile.vaccinations
                      : getDefaultVaccinations(),
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
      ...updatedPatientData, // Spread existing data first
      patientStatus: updatedPatientData.patientStatus || 'OPD', // Ensure patientStatus has a default
      isTracked: updatedPatientData.isTracked === undefined ? (patients[patientIndex]?.isTracked || false) : updatedPatientData.isTracked,
      nextAppointmentDate: updatedPatientData.nextAppointmentDate, // Can be undefined
      clinicalProfile: {
        ...getInitialClinicalProfile(), 
        ...(updatedPatientData.clinicalProfile || {}), 
        labels: Array.isArray(updatedPatientData.clinicalProfile?.labels) ? updatedPatientData.clinicalProfile.labels : [],
        tags: Array.isArray(updatedPatientData.clinicalProfile?.tags) ? updatedPatientData.clinicalProfile.tags : [],
        vaccinations: Array.isArray(updatedPatientData.clinicalProfile?.vaccinations) && updatedPatientData.clinicalProfile.vaccinations.length > 0
                      ? VACCINATION_NAMES.map(vaccineName => {
                          const existingVaccine = updatedPatientData.clinicalProfile.vaccinations.find((v: Vaccination) => v.name === vaccineName);
                          return {
                            name: vaccineName,
                            administered: existingVaccine?.administered || false,
                            date: existingVaccine?.date || "",
                            nextDoseDate: existingVaccine?.nextDoseDate || "",
                          };
                        })
                      : getDefaultVaccinations(),
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
