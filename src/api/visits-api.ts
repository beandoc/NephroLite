import { BaseAPI } from './base-api';
import { apiLogger } from '@/lib/logger';

/**
 * Visit type representing a patient visit
 */
export interface Visit {
    id: string;
    patientId: string;
    visitDate: string;
    visitType?: string;
    chiefComplaint?: string;
    vitalSigns?: any;
    clinicalNotes?: string;
    groupName?: string;
    clinicalData?: any;
    diagnoses?: any[];
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
}

export type VisitInput = Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Visits API
 * Handles all visit-related Supabase operations
 */
export class VisitsAPI extends BaseAPI {
    constructor() {
        super('visits', apiLogger);
    }

    /**
     * Get all visits, optionally filtered by patient
     */
    async getAll(patientId?: string): Promise<Visit[]> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'getAll', { patientId });

            let query = this.supabase
                .from(this.tableName)
                .select('*')
                .order('date', { ascending: false });

            if (patientId) {
                query = query.eq('patient_id', patientId);
            }

            const { data, error } = await query;
            if (error) throw error;

            return data.map(this.mapToVisit);
        }, 'getAll');
    }

    /**
     * Get visit by ID
     */
    async getById(id: string): Promise<Visit | null> {
        return this.withErrorHandling(async () => {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw error;
            }

            return this.mapToVisit(data);
        }, 'getById');
    }

    /**
     * Create new visit
     */
    async create(data: VisitInput): Promise<Visit> {
        return this.withErrorHandling(async () => {
            const now = new Date().toISOString();

            // Extract Granular Metrics from clinicalData if present
            let systolic_bp: number | null = null;
            let diastolic_bp: number | null = null;
            let weight_kg: number | null = null;

            if (data.clinicalData) {
                if (data.clinicalData.systolicBP) systolic_bp = parseInt(data.clinicalData.systolicBP, 10);
                if (data.clinicalData.diastolicBP) diastolic_bp = parseInt(data.clinicalData.diastolicBP, 10);
                if (data.clinicalData.weight) weight_kg = parseFloat(data.clinicalData.weight);
            } else if (data.vitalSigns) {
                // Fallback if passing via vitalSigns
                if (data.vitalSigns.systolicBP) systolic_bp = parseInt(data.vitalSigns.systolicBP, 10);
                if (data.vitalSigns.diastolicBP) diastolic_bp = parseInt(data.vitalSigns.diastolicBP, 10);
                if (data.vitalSigns.weight) weight_kg = parseFloat(data.vitalSigns.weight);
            }

            // Map camelCase -> snake_case
            const dbPayload = {
                patient_id: data.patientId,
                date: data.visitDate,
                visit_type: data.visitType,
                visit_remark: data.visitRemark,
                group_name: data.groupName,
                clinical_data: data.clinicalData || data.vitalSigns ? { vitalSigns: data.vitalSigns } : null,
                diagnoses: data.diagnoses,

                // Granular Metrics
                systolic_bp,
                diastolic_bp,
                weight_kg,

                created_at: now
            };

            const { data: newRecord, error } = await this.supabase
                .from(this.tableName)
                .insert(dbPayload)
                .select()
                .single();

            if (error) throw error;

            this.logger.info({ visitId: newRecord.id, patientId: data.patientId }, 'Visit created');
            return this.mapToVisit(newRecord);
        }, 'create');
    }

    /**
     * Update existing visit
     */
    async update(id: string, data: Partial<VisitInput>): Promise<void> {
        return this.withErrorHandling(async () => {
            // Fetch existing record to safely merge JSONB fields
            const { data: existing, error: fetchError } = await this.supabase
                .from(this.tableName)
                .select('clinical_data')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            const updates: any = {};
            if (data.visitDate) updates.date = data.visitDate;
            if (data.visitType) updates.visit_type = data.visitType;
            if (data.visitRemark) updates.visit_remark = data.visitRemark;
            if (data.groupName) updates.group_name = data.groupName;

            // Merge clinicalData
            if (data.clinicalData) {
                updates.clinical_data = { ...existing.clinical_data, ...data.clinicalData };

                // Update granular metrics if they are in the update payload
                if (data.clinicalData.systolicBP) updates.systolic_bp = parseInt(data.clinicalData.systolicBP, 10);
                if (data.clinicalData.diastolicBP) updates.diastolic_bp = parseInt(data.clinicalData.diastolicBP, 10);
                if (data.clinicalData.weight) updates.weight_kg = parseFloat(data.clinicalData.weight);
            }

            // Diagnoses are usually an array that is replaced entirely, but if we wanted to merge:
            if (data.diagnoses) {
                updates.diagnoses = data.diagnoses;
            }

            const { error } = await this.supabase
                .from(this.tableName)
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            this.logger.info({ visitId: id }, 'Visit updated');
        }, 'update');
    }

    /**
     * Get recent visits
     */
    async getRecent(count: number = 10): Promise<Visit[]> {
        return this.withErrorHandling(async () => {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .order('date', { ascending: false })
                .limit(count);

            if (error) throw error;

            return data.map(this.mapToVisit);
        }, 'getRecent');
    }

    private mapToVisit(row: any): Visit {
        return {
            id: row.id,
            patientId: row.patient_id,
            visitDate: row.date,
            visitType: row.visit_type,
            visitRemark: row.visit_remark,
            groupName: row.group_name,
            clinicalData: row.clinical_data,
            diagnoses: row.diagnoses,
            createdAt: row.created_at
        };
    }
}

// Export singleton instance
export const visitsAPI = new VisitsAPI();

