import { BaseAPI } from './base-api';
import { apiLogger } from '@/lib/logger';
import type { Appointment } from '@/lib/types';
export type { Appointment };

export type AppointmentInput = Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'patientName'>; // patientName usually derived or passed for UI but in DB?

// DB doesn't have patient_name, only patient_id. 
// However, the App type `Appointment` requires `patientName`.
// We should perhaps fetch it via join in `select`?
// Or if it's not in DB, we return empty string or handle it.
// The schema showed `patient_id` FK.

export type AppointmentStatus = Appointment['status'];

/**
 * Appointments API
 * Handles all appointment-related Supabase operations
 */
export class AppointmentsAPI extends BaseAPI {
    constructor() {
        super('appointments', apiLogger);
    }

    /**
     * Get all appointments, optionally filtered by patient
     */
    async getAll(patientId?: string): Promise<Appointment[]> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'getAll', { patientId });

            let query = this.supabase
                .from(this.tableName)
                .select('*, patients(first_name, last_name)') // Join patients to get Name
                .order('date', { ascending: false });

            if (patientId) {
                query = query.eq('patient_id', patientId);
            }

            const { data, error } = await query;
            if (error) throw error;

            return data.map(this.mapToAppointment);
        }, 'getAll');
    }

    /**
     * Get appointment by ID
     */
    async getById(id: string): Promise<Appointment | null> {
        return this.withErrorHandling(async () => {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*, patients(first_name, last_name)')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw error;
            }

            return this.mapToAppointment(data);
        }, 'getById');
    }

    /**
     * Create new appointment
     */
    async create(data: AppointmentInput): Promise<Appointment> {
        return this.withErrorHandling(async () => {
            const now = new Date().toISOString();
            const dbPayload = {
                patient_id: data.patientId,
                date: data.date,
                time: data.time,
                status: data.status,
                type: data.type,
                doctor_name: data.doctorName,
                notes: data.notes,
                created_at: now
            };

            const { data: newRecord, error } = await this.supabase
                .from(this.tableName)
                .insert(dbPayload)
                .select('*, patients(first_name, last_name)')
                .single();

            if (error) throw error;

            this.logger.info({
                appointmentId: newRecord.id,
                patientId: data.patientId,
                date: data.date
            }, 'Appointment created');

            return this.mapToAppointment(newRecord);
        }, 'create');
    }

    /**
     * Update existing appointment
     */
    async update(id: string, data: Partial<AppointmentInput>): Promise<void> {
        return this.withErrorHandling(async () => {
            const updates: any = {};
            if (data.patientId) updates.patient_id = data.patientId;
            if (data.date) updates.date = data.date;
            if (data.time) updates.time = data.time;
            if (data.status) updates.status = data.status;
            if (data.type) updates.type = data.type;
            if (data.doctorName) updates.doctor_name = data.doctorName;
            if (data.notes) updates.notes = data.notes;

            const { error } = await this.supabase
                .from(this.tableName)
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            this.logger.info({ appointmentId: id }, 'Appointment updated');
        }, 'update');
    }

    /**
     * Update appointment status
     */
    async updateStatus(id: string, status: AppointmentStatus): Promise<void> {
        return this.withErrorHandling(async () => {
            await this.update(id, { status } as any);
            this.logger.info({ appointmentId: id, status }, 'Appointment status updated');
        }, 'updateStatus');
    }

    /**
     * Get appointments by date
     */
    async getByDate(date: string): Promise<Appointment[]> {
        return this.withErrorHandling(async () => {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*, patients(first_name, last_name)')
                .eq('date', date)
                .order('time', { ascending: true });

            if (error) throw error;

            const appointments = data.map(this.mapToAppointment);
            this.logger.info({ date, count: appointments.length }, 'Fetched appointments by date');
            return appointments;
        }, 'getByDate');
    }

    private mapToAppointment(row: any): Appointment {
        // Handle joined patient data if available
        let patientName = 'Unknown';
        if (row.patients) {
            patientName = `${row.patients.first_name} ${row.patients.last_name}`.trim();
        } else if (row.patient_name) { // Fallback if explicit column exists
            patientName = row.patient_name;
        }

        return {
            id: row.id,
            patientId: row.patient_id,
            date: row.date,
            time: row.time,
            status: row.status,
            type: row.type,
            doctorName: row.doctor_name,
            notes: row.notes,
            createdAt: row.created_at,
            patientName: patientName // Required by type
        };
    }
}

// Export singleton instance
export const appointmentsAPI = new AppointmentsAPI();

