
"use client";

import type { Patient, Vaccination, ClinicalProfile } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { VACCINATION_NAMES, PRIMARY_DIAGNOSIS_OPTIONS, NUTRITIONAL_STATUSES, DISABILITY_PROFILES, BLOOD_GROUPS, YES_NO_UNKNOWN_OPTIONS, RESIDENCE_TYPES } from '@/lib/constants';

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
      nephroId: p.nephroId || `MOCK-${p.id.substring(0,4)}`,
      patientStatus: p.patientStatus || 'OPD',
      nextAppointmentDate: p.nextAppointmentDate || undefined,
      isTracked: p.isTracked || false,
      residenceType: p.residenceType || (RESIDENCE_TYPES.includes('Not Set') ? 'Not Set' : RESIDENCE_TYPES[0]),
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
    return patients;
  }

  const mockPatients: Patient[] = [
    {
      id: crypto.randomUUID(),
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
        labels: ['Hypertension', 'Diabetes'],
        tags: ['Stage 3 CKD', 'Anemia', 'Diabetes'],
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
        tags: ['Diabetes', 'Proteinuria'],
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

  const addPatient = useCallback((patientData: Omit<Patient, 'id' | 'nephroId' | 'registrationDate' | 'clinicalProfile' | 'patientStatus' | 'residenceType'> & { clinicalProfile?: Partial<ClinicalProfile>, nextAppointmentDate?:string, isTracked?: boolean, customIdPrefix: string, residenceType?: Patient['residenceType'] }): Patient => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // MM
    const year = String(now.getFullYear()).slice(-2); // YY
    const constructedNephroId = `${patientData.customIdPrefix}/${month}${year}`;

    const newPatient: Patient = {
      id: crypto.randomUUID(),
      nephroId: constructedNephroId,
      name: patientData.name,
      dob: patientData.dob,
      gender: patientData.gender,
      contact: patientData.contact,
      email: patientData.email,
      address: patientData.address,
      guardian: patientData.guardian,
      registrationDate: now.toISOString().split('T')[0],
      patientStatus: 'OPD',
      isTracked: patientData.isTracked || false,
      nextAppointmentDate: patientData.nextAppointmentDate || undefined,
      residenceType: patientData.residenceType || 'Not Set',
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
    let finalNephroId = updatedPatientData.nephroId;
    if ((updatedPatientData as any).customIdPrefix) {
        const prefix = (updatedPatientData as any).customIdPrefix;
        const existingSuffix = updatedPatientData.nephroId.includes('/') ? updatedPatientData.nephroId.split('/')[1] : null;
        if (existingSuffix) {
            finalNephroId = `${prefix}/${existingSuffix}`;
        } else {
            const now = new Date();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = String(now.getFullYear()).slice(-2);
            finalNephroId = `${prefix}/${month}${year}`;
        }
    }


    updatedPatients[patientIndex] = {
      ...updatedPatientData,
      nephroId: finalNephroId,
      patientStatus: updatedPatientData.patientStatus || 'OPD',
      isTracked: updatedPatientData.isTracked === undefined ? (patients[patientIndex]?.isTracked || false) : updatedPatientData.isTracked,
      nextAppointmentDate: updatedPatientData.nextAppointmentDate,
      residenceType: updatedPatientData.residenceType || 'Not Set',
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
