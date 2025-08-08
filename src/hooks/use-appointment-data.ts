
"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Appointment, Patient } from '@/lib/types';
import { format } from 'date-fns';

export function useAppointmentData() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = collection(db, 'appointments');
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appointmentsData: Appointment[] = [];
      querySnapshot.forEach((doc) => {
        appointmentsData.push({ id: doc.id, ...doc.data() } as Appointment);
      });
      setAppointments(appointmentsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'status' | 'patientName'>, patient: Patient): Promise<Appointment> => {
    const newAppointmentData: Omit<Appointment, 'id'> = {
      ...appointmentData,
      patientName: patient.name, 
      status: 'Scheduled',
    };
    const docRef = await addDoc(collection(db, 'appointments'), newAppointmentData);
    return { id: docRef.id, ...newAppointmentData };
  }, []);

  const updateAppointmentStatus = useCallback(async (id: string, status: Appointment['status']): Promise<void> => {
    const appointmentDocRef = doc(db, 'appointments', id);
    await updateDoc(appointmentDocRef, { status });
  }, []);
  
  const updateMultipleAppointmentStatuses = useCallback(async (updates: { id: string, status: Appointment['status'] }[]): Promise<void> => {
    const batch = writeBatch(db);
    updates.forEach(update => {
      const appointmentDocRef = doc(db, 'appointments', update.id);
      batch.update(appointmentDocRef, { status: update.status });
    });
    await batch.commit();
  }, []);

  const updateAppointment = useCallback(async (updatedAppointmentData: Appointment): Promise<void> => {
    const appointmentDocRef = doc(db, 'appointments', updatedAppointmentData.id);
    const dataToUpdate = {
        ...updatedAppointmentData,
        date: format(new Date(updatedAppointmentData.date), 'yyyy-MM-dd') 
    };
    // Don't pass the id in the update payload
    delete (dataToUpdate as Partial<Appointment>).id;
    await updateDoc(appointmentDocRef, dataToUpdate);
  }, []);

  return {
    appointments,
    isLoading,
    addAppointment,
    updateAppointmentStatus,
    updateAppointment,
    updateMultipleAppointmentStatuses,
  };
}
