
"use client";

import type { Appointment, Patient } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { MOCK_DOCTORS, APPOINTMENT_TYPES } from '@/lib/constants';

const APPOINTMENTS_STORAGE_KEY = 'nephrolite_appointments';

const getInitialAppointments = (): Appointment[] => {
  if (typeof window === 'undefined') return [];
  const storedAppointments = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
  if (storedAppointments) {
    return JSON.parse(storedAppointments);
  }

  // Initialize with some mock data if localStorage is empty
  // Requires patient data, which might not be available here directly without prop drilling or another hook.
  // For simplicity, we'll create appointments without real patient names initially, or assume some patient IDs.
  // This part might need adjustment if direct access to patient list is needed for mock data generation.
  const mockAppointments: Appointment[] = [
    {
      id: crypto.randomUUID(),
      patientId: 'mock-patient-id-1', // Replace with actual patient ID if available
      patientName: 'Rajesh Kumar', // Ideally fetched or passed
      date: format(new Date(Date.now() + 86400000 * 2), 'yyyy-MM-dd'), // 2 days from now
      time: '10:00',
      type: APPOINTMENT_TYPES[0],
      doctorName: MOCK_DOCTORS[0],
      status: 'Scheduled',
      notes: 'Routine checkup for CKD management.'
    },
    {
      id: crypto.randomUUID(),
      patientId: 'mock-patient-id-2', // Replace with actual patient ID
      patientName: 'Priya Sharma', // Ideally fetched or passed
      date: format(new Date(Date.now() + 86400000 * 5), 'yyyy-MM-dd'), // 5 days from now
      time: '14:30',
      type: APPOINTMENT_TYPES[1],
      doctorName: MOCK_DOCTORS[1],
      status: 'Scheduled',
      notes: 'Follow-up regarding recent lab results.'
    }
  ];
  localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(mockAppointments));
  return mockAppointments;
};

export function useAppointmentData() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setAppointments(getInitialAppointments());
    setIsLoading(false);
  }, []);

  const saveData = useCallback((updatedAppointments: Appointment[]) => {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(updatedAppointments));
    setAppointments(updatedAppointments);
  }, []);

  const getAppointmentsList = useCallback((): Appointment[] => {
    return appointments;
  }, [appointments]);

  const getAppointmentById = useCallback((id: string): Appointment | undefined => {
    return appointments.find(a => a.id === id);
  }, [appointments]);

  const addAppointment = useCallback((appointmentData: Omit<Appointment, 'id' | 'status'>, patient: Patient): Appointment => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: crypto.randomUUID(),
      patientName: patient.name, // Store patient name
      status: 'Scheduled',
    };
    const updatedAppointments = [...appointments, newAppointment];
    saveData(updatedAppointments);
    return newAppointment;
  }, [appointments, saveData]);

  const updateAppointmentStatus = useCallback((id: string, status: 'Completed' | 'Cancelled'): Appointment | undefined => {
    const appointmentIndex = appointments.findIndex(a => a.id === id);
    if (appointmentIndex === -1) return undefined;

    const updatedAppointments = [...appointments];
    updatedAppointments[appointmentIndex] = { ...updatedAppointments[appointmentIndex], status };
    saveData(updatedAppointments);
    return updatedAppointments[appointmentIndex];
  }, [appointments, saveData]);
  
  const updateAppointment = useCallback((updatedAppointmentData: Appointment): Appointment | undefined => {
    const appointmentIndex = appointments.findIndex(a => a.id === updatedAppointmentData.id);
    if (appointmentIndex === -1) return undefined;

    const updatedAppointments = [...appointments];
    updatedAppointments[appointmentIndex] = updatedAppointmentData;
    saveData(updatedAppointments);
    return updatedAppointmentData;
  }, [appointments, saveData]);


  return {
    appointments,
    isLoading,
    getAppointmentsList,
    getAppointmentById,
    addAppointment,
    updateAppointmentStatus,
    updateAppointment,
  };
}
