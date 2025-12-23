import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import { BaseAPI } from './base-api';
import { db } from '@/lib/firebase';
import { apiLogger } from '@/lib/logger';

/**
 * Appointment status types
 */
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

/**
 * Appointment type representing patient appointments
 */
export interface Appointment {
    id: string;
    patientId: string;
    appointmentDate: string;
    appointmentTime: string;
    status: AppointmentStatus;
    appointmentType?: string;
    doctorId?: string;
    notes?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    [key: string]: any;
}

export type AppointmentInput = Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Appointments API
 * Handles all appointment-related Firestore operations
 * 
 * @example
 * ```typescript
 * import { api } from '@/api';
 * 
 * // Create appointment
 * const appointment = await api.appointments.create({
 *   patientId: 'patient123',
 *   appointmentDate: '2024-12-25',
 *   appointmentTime: '10:00',
 *   status: 'scheduled'
 * });
 * 
 * // Get appointments for a date
 * const appointments = await api.appointments.getByDate('2024-12-25');
 * ```
 */
export class AppointmentsAPI extends BaseAPI {
    constructor() {
        super(db, 'appointments', apiLogger);
    }

    /**
     * Get all appointments, optionally filtered by patient
     * 
     * @param patientId - Optional patient ID to filter appointments
     * @returns Promise with array of appointments
     * @throws {AppError} If database query fails
     */
    async getAll(patientId?: string): Promise<Appointment[]> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'getAll', { patientId });

            let q;
            if (patientId) {
                q = query(
                    collection(this.db, this.collectionName),
                    where('patientId', '==', patientId),
                    orderBy('appointmentDate', 'desc')
                );
            } else {
                q = query(
                    collection(this.db, this.collectionName),
                    orderBy('appointmentDate', 'desc')
                );
            }

            const snapshot = await getDocs(q);
            const appointments = this.formatDocs<Appointment>(snapshot.docs);

            this.logger.info({ count: appointments.length, patientId }, 'Fetched appointments');
            return appointments;
        }, 'getAll');
    }

    /**
     * Get appointment by ID
     * 
     * @param id - Appointment document ID
     * @returns Promise with appointment or null if not found
     * @throws {AppError} If database query fails
     */
    async getById(id: string): Promise<Appointment | null> {
        return this.withErrorHandling(async () => {
            const docRef = doc(this.db, this.collectionName, id);
            const snapshot = await getDoc(docRef);

            if (!snapshot.exists()) {
                this.logger.warn({ appointmentId: id }, 'Appointment not found');
                return null;
            }

            return this.formatDoc<Appointment>(snapshot);
        }, 'getById');
    }

    /**
     * Create new appointment
     * 
     * @param data - Appointment data (without id, createdAt, updatedAt)
     * @returns Promise with created appointment including generated ID
     * @throws {AppError} If creation fails
     * 
     * @example
     * ```typescript
     * const appointment = await api.appointments.create({
     *   patientId: 'patient123',
     *   appointmentDate: '2024-12-25',
     *   appointmentTime: '10:00',
     *   status: 'scheduled',
     *   appointmentType: 'follow-up',
     *   doctorId: 'doctor456'
     * });
     * ```
     */
    async create(data: AppointmentInput): Promise<Appointment> {
        return this.withErrorHandling(async () => {
            const now = Timestamp.now();
            const docData = {
                ...data,
                createdAt: now,
                updatedAt: now,
            };

            const docRef = await addDoc(
                collection(this.db, this.collectionName),
                docData
            );

            const appointment = {
                id: docRef.id,
                ...docData,
            } as Appointment;

            this.logger.info({
                appointmentId: appointment.id,
                patientId: data.patientId,
                date: data.appointmentDate
            }, 'Appointment created');

            return appointment;
        }, 'create');
    }

    /**
     * Update existing appointment
     * 
     * @param id - Appointment document ID
     * @param data - Partial appointment data to update
     * @throws {AppError} If update fails
     */
    async update(id: string, data: Partial<AppointmentInput>): Promise<void> {
        return this.withErrorHandling(async () => {
            const docRef = doc(this.db, this.collectionName, id);

            await updateDoc(docRef, {
                ...data,
                updatedAt: Timestamp.now(),
            });

            this.logger.info({ appointmentId: id }, 'Appointment updated');
        }, 'update');
    }

    /**
     * Update appointment status
     * 
     * @param id - Appointment document ID
     * @param status - New status
     * @throws {AppError} If update fails
     * 
     * @example
     * ```typescript
     * // Mark appointment as completed
     * await api.appointments.updateStatus('appt123', 'completed');
     * 
     * // Cancel appointment
     * await api.appointments.updateStatus('appt123', 'cancelled');
     * ```
     */
    async updateStatus(id: string, status: AppointmentStatus): Promise<void> {
        return this.withErrorHandling(async () => {
            await this.update(id, { status });
            this.logger.info({ appointmentId: id, status }, 'Appointment status updated');
        }, 'updateStatus');
    }

    /**
     * Get appointments by date
     * 
     * @param date - Date in YYYY-MM-DD format
     * @returns Promise with array of appointments for the specified date
     * 
     * @example
     * ```typescript
     * // Get all appointments for today
     * const today = new Date().toISOString().split('T')[0];
     * const appointments = await api.appointments.getByDate(today);
     * ```
     */
    async getByDate(date: string): Promise<Appointment[]> {
        return this.withErrorHandling(async () => {
            const snapshot = await getDocs(
                query(
                    collection(this.db, this.collectionName),
                    where('appointmentDate', '==', date),
                    orderBy('appointmentTime')
                )
            );

            const appointments = this.formatDocs<Appointment>(snapshot.docs);
            this.logger.info({ date, count: appointments.length }, 'Fetched appointments by date');
            return appointments;
        }, 'getByDate');
    }
}

// Export singleton instance
export const appointmentsAPI = new AppointmentsAPI();
