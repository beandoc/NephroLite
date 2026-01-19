import { BaseAPI } from './base-api';
import { apiLogger } from '@/lib/logger';
import type { Patient } from '@/lib/types';
export type { Patient };

export type PatientInput = Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'visits' | 'investigationRecords' | 'dialysisSessions' | 'interventions'>;


/**
 * Patients API
 * Handles all patient-related Supabase operations
 */
export class PatientsAPI extends BaseAPI {
    constructor() {
        super('patients', apiLogger);
    }

    /**
     * Get all patients
     */
    async getAll(): Promise<Patient[]> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'getAll');

            const { data, error } = await this.supabase
                .from(this.tableName)
                // Fetch patient and related sub-resources
                .select(`
                    *,
                    visits(*),
                    investigation_records(*),
                    dialysis_sessions(*)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map DB snake_case to app camelCase
            return data.map(this.mapToPatient);
        }, 'getAll');
    }

    /**
     * Get patient by ID
     */
    async getById(id: string): Promise<Patient | null> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'getById', { patientId: id });

            const { data, error } = await this.supabase
                .from(this.tableName)
                .select(`
                    *,
                    visits(*),
                    investigation_records(*),
                    dialysis_sessions(*)
                `)
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found code
                throw error;
            }

            return this.mapToPatient(data);
        }, 'getById');
    }

    /**
     * Create new patient
     */
    async create(data: PatientInput): Promise<Patient> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'create');

            // Map app camelCase to DB snake_case
            const dbPayload = {
                nephro_id: data.nephroId,
                first_name: data.firstName,
                last_name: data.lastName,
                dob: data.dob,
                gender: data.gender,
                phone: data.phoneNumber,
                email: data.email,
                address: data.address,
                guardian: data.guardian,
                clinical_profile: data.clinicalProfile,
                registration_date: data.registrationDate,
                is_tracked: data.isTracked ?? true,
                patient_status: data.patientStatus,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data: newRecord, error } = await this.supabase
                .from(this.tableName)
                .insert(dbPayload)
                .select()
                .single();

            if (error) throw error;

            this.logger.info({ patientId: newRecord.id }, 'Patient created');
            return this.mapToPatient(newRecord);
        }, 'create');
    }

    /**
     * Update patient
     */
    async update(id: string, data: Partial<PatientInput>): Promise<void> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'update', { patientId: id });

            const updates: any = {};
            if (data.firstName) updates.first_name = data.firstName;
            if (data.lastName) updates.last_name = data.lastName;
            if (data.nephroId) updates.nephro_id = data.nephroId;
            if (data.dob) updates.dob = data.dob;
            if (data.gender) updates.gender = data.gender;
            if (data.phoneNumber) updates.phone = data.phoneNumber;
            if (data.email) updates.email = data.email;
            if (data.address) updates.address = data.address;
            if (data.guardian) updates.guardian = data.guardian;
            if (data.clinicalProfile) updates.clinical_profile = data.clinicalProfile;
            if (data.isTracked !== undefined) updates.is_tracked = data.isTracked;
            if (data.patientStatus) updates.patient_status = data.patientStatus;

            updates.updated_at = new Date().toISOString();

            const { error } = await this.supabase
                .from(this.tableName)
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            this.logger.info({ patientId: id }, 'Patient updated');
        }, 'update');
    }

    /**
     * Search patients by name
     * Uses Postgres ILIKE for case-insensitive partial match
     */
    async searchByName(name: string): Promise<Patient[]> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'searchByName', { query: name });

            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .or(`first_name.ilike.%${name}%,last_name.ilike.%${name}%`)
                .limit(20);

            if (error) throw error;

            const patients = data.map(this.mapToPatient);
            this.logger.info({ query: name, count: patients.length }, 'Search completed');
            return patients;
        }, 'searchByName');
    }

    /**
     * Get patients with pagination
     */
    async getPaginated(page: number = 1, pageSize: number = 20, filters?: any): Promise<{ data: Patient[], count: number }> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'getPaginated', { page, pageSize });

            let query = this.supabase
                .from(this.tableName)
                .select('*', { count: 'exact' });

            // Apply filters if needed (simple implementation for now)
            if (filters?.search) {
                query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`);
            }

            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            return {
                data: data.map(this.mapToPatient),
                count: count || 0
            };
        }, 'getPaginated');
    }

    // Helper to map DB columns to App types
    /**
     * Delete patient and all related data (cascaded by DB)
     */
    async delete(id: string): Promise<void> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'delete', { patientId: id });

            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('id', id);

            if (error) throw error;

            this.logger.info({ patientId: id }, 'Patient deleted');
        }, 'delete');
    }

    // Helper to map DB columns to App types
    private mapToPatient = (row: any): Patient => {
        // Map Visits
        const visits = Array.isArray(row.visits) ? row.visits.map((v: any) => ({
            id: v.id,
            patientId: v.patient_id,
            visitDate: v.date,
            visitType: v.visit_type,
            visitRemark: v.visit_remark,
            groupName: v.group_name,
            clinicalData: v.clinical_data,
            diagnoses: v.diagnoses,
            createdAt: v.created_at
        })) : [];

        // Map Investigation Records
        const investigationRecords = Array.isArray(row.investigation_records) ? row.investigation_records.map((i: any) => ({
            id: i.id,
            patientId: i.patient_id,
            date: i.date,
            tests: i.tests,
            notes: i.notes,
            createdAt: i.created_at
        })) : [];

        // Map Dialysis Sessions
        const dialysisSessions = Array.isArray(row.dialysis_sessions) ? row.dialysis_sessions.map((s: any) => ({
            id: s.id,
            patientId: s.patient_id,
            dateOfSession: s.date_of_session,
            typeOfDialysis: s.type_of_dialysis,
            duration: s.duration,
            stats: s.stats,
            details: s.details,
            createdAt: s.created_at
        })) : [];

        return {
            id: row.id,
            nephroId: row.nephro_id,
            firstName: row.first_name,
            lastName: row.last_name,
            dob: row.dob,
            gender: row.gender,
            phoneNumber: row.phone,
            email: row.email,
            address: row.address,
            guardian: row.guardian,
            clinicalProfile: row.clinical_profile,
            registrationDate: row.registration_date,
            createdAt: row.created_at,
            isTracked: row.is_tracked,
            patientStatus: row.patient_status,
            visits,
            investigationRecords,
            dialysisSessions
        };
    }
}

// Export singleton instance
export const patientsAPI = new PatientsAPI();


