
"use client";

import type { Appointment, Patient } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { format, addDays, subDays, setHours, setMinutes } from 'date-fns';
import { MOCK_DOCTORS, APPOINTMENT_TYPES, APPOINTMENT_STATUSES } from '@/lib/constants'; // Added APPOINTMENT_STATUSES

const APPOINTMENTS_STORAGE_KEY = 'nephrolite_appointments';

const getInitialAppointments = (): Appointment[] => {
  if (typeof window === 'undefined') return [];
  const storedAppointments = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
  if (storedAppointments) {
    try {
      const parsedAppointments = JSON.parse(storedAppointments).map((app: any) => ({
        ...app,
        date: format(new Date(app.date), 'yyyy-MM-dd'),
        status: APPOINTMENT_STATUSES.includes(app.status) ? app.status : 'Scheduled', // Ensure status is valid
      }));
      return parsedAppointments;
    } catch (e) {
      console.error("Error parsing appointments from localStorage", e);
      localStorage.removeItem(APPOINTMENTS_STORAGE_KEY); 
    }
  }

  const today = new Date();
  const mockAppointments: Appointment[] = [
    {
      id: crypto.randomUUID(),
      patientId: 'mock-patient-id-1', 
      patientName: 'Rajesh Kumar', 
      date: format(setMinutes(setHours(today, 9), 0), 'yyyy-MM-dd'), 
      time: '09:00',
      type: APPOINTMENT_TYPES[2], 
      doctorName: MOCK_DOCTORS[0],
      status: 'Scheduled',
      notes: 'Scheduled dialysis session.'
    },
    {
      id: crypto.randomUUID(),
      patientId: 'mock-patient-id-2', 
      patientName: 'Priya Sharma', 
      date: format(setMinutes(setHours(today, 10), 30), 'yyyy-MM-dd'), 
      time: '10:30',
      type: APPOINTMENT_TYPES[3], 
      doctorName: MOCK_DOCTORS[1],
      status: 'Waiting', // Example of new status
      notes: 'First consultation for kidney health assessment.'
    },
    {
      id: crypto.randomUUID(),
      patientId: 'mock-patient-id-3', 
      patientName: 'Amit Singh', 
      date: format(setMinutes(setHours(today, 13), 15), 'yyyy-MM-dd'), 
      time: '13:15',
      type: 'Lab Results Review', 
      doctorName: MOCK_DOCTORS[2],
      status: 'Scheduled',
      notes: 'Review recent blood work.'
    },
    {
      id: crypto.randomUUID(),
      patientId: 'mock-patient-id-4', 
      patientName: 'Sunita Devi', 
      date: format(setMinutes(setHours(today, 15), 45), 'yyyy-MM-dd'), 
      time: '15:45',
      type: 'Transplant Evaluation', 
      doctorName: MOCK_DOCTORS[3],
      status: 'Scheduled',
      notes: 'Pre-transplant assessment.'
    },
    {
      id: crypto.randomUUID(),
      patientId: 'mock-patient-id-1',
      patientName: 'Rajesh Kumar',
      date: format(addDays(today, 2), 'yyyy-MM-dd'), 
      time: '10:00',
      type: APPOINTMENT_TYPES[0],
      doctorName: MOCK_DOCTORS[0],
      status: 'Scheduled',
      notes: 'Routine checkup for CKD management.'
    },
    {
      id: crypto.randomUUID(),
      patientId: 'mock-patient-id-2',
      patientName: 'Priya Sharma',
      date: format(addDays(today, 5), 'yyyy-MM-dd'), 
      time: '14:30',
      type: APPOINTMENT_TYPES[1],
      doctorName: MOCK_DOCTORS[1],
      status: 'Scheduled',
      notes: 'Follow-up regarding recent lab results.'
    },
     {
      id: crypto.randomUUID(),
      patientId: 'mock-patient-id-3',
      patientName: 'Amit Singh',
      date: format(subDays(today, 3), 'yyyy-MM-dd'), 
      time: '11:00',
      type: APPOINTMENT_TYPES[0],
      doctorName: MOCK_DOCTORS[2],
      status: 'Completed',
      notes: 'Completed routine checkup.'
    },
    {
      id: crypto.randomUUID(),
      patientId: 'mock-patient-id-4',
      patientName: 'Sunita Devi',
      date: format(subDays(today, 1), 'yyyy-MM-dd'),
      time: '16:00',
      type: 'Emergency',
      doctorName: MOCK_DOCTORS[3],
      status: 'Not Showed', // Example of new status
      notes: 'Patient did not arrive for emergency follow-up.',
    },
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

  const addAppointment = useCallback((appointmentData: Omit<Appointment, 'id' | 'status' | 'patientName'>, patient: Patient): Appointment => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: crypto.randomUUID(),
      patientName: patient.name, 
      status: 'Scheduled',
    };
    const updatedAppointments = [...appointments, newAppointment];
    saveData(updatedAppointments);
    return newAppointment;
  }, [appointments, saveData]);

  const updateAppointmentStatus = useCallback((id: string, status: Appointment['status']): Appointment | undefined => {
    const appointmentIndex = appointments.findIndex(a => a.id === id);
    if (appointmentIndex === -1) return undefined;

    const updatedAppointments = [...appointments];
    updatedAppointments[appointmentIndex] = { ...updatedAppointments[appointmentIndex], status };
    saveData(updatedAppointments);
    return updatedAppointments[appointmentIndex];
  }, [appointments, saveData]);
  
  const updateMultipleAppointmentStatuses = useCallback((updates: { id: string, status: Appointment['status'] }[]): void => {
    const updatedAppointments = appointments.map(app => {
        const update = updates.find(u => u.id === app.id);
        if (update) {
            return { ...app, status: update.status };
        }
        return app;
    });
    saveData(updatedAppointments);
  }, [appointments, saveData]);


  const updateAppointment = useCallback((updatedAppointmentData: Appointment): Appointment | undefined => {
    const appointmentIndex = appointments.findIndex(a => a.id === updatedAppointmentData.id);
    if (appointmentIndex === -1) return undefined;

    const updatedAppointments = [...appointments];
    updatedAppointments[appointmentIndex] = {
        ...updatedAppointmentData,
        date: format(new Date(updatedAppointmentData.date), 'yyyy-MM-dd') 
    };
    saveData(updatedAppointments);
    return updatedAppointments[appointmentIndex];
  }, [appointments, saveData]);


  return {
    appointments,
    isLoading,
    getAppointmentsList,
    getAppointmentById,
    addAppointment,
    updateAppointmentStatus,
    updateAppointment,
    updateMultipleAppointmentStatuses,
  };
}
