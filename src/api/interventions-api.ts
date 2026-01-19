import { BaseAPI } from './base-api';
import { apiLogger } from '@/lib/logger';
import type { Intervention } from '@/lib/types';

export type InterventionInput = Omit<Intervention, 'id' | 'createdAt' | 'updatedAt'>;

export class InterventionsAPI extends BaseAPI {
    constructor() {
        super('interventions', apiLogger);
    }

    /**
     * Get all interventions for a patient
     */
    async getAll(patientId: string): Promise<Intervention[]> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'getAll', { patientId });

            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(this.mapToIntervention);
        }, 'getAll');
    }

    /**
     * Get intervention by ID
     */
    async getById(id: string): Promise<Intervention | null> {
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

            return this.mapToIntervention(data);
        }, 'getById');
    }

    /**
     * Create new intervention
     */
    async create(patientId: string, data: InterventionInput): Promise<Intervention> {
        return this.withErrorHandling(async () => {
            const now = new Date().toISOString();

            const dbPayload = {
                patient_id: patientId,
                date: data.date,
                type: data.type,
                details: data.details,
                notes: data.notes,
                complications: data.complications,
                attachments: data.attachments,
                created_at: now
            };

            const { data: newRecord, error } = await this.supabase
                .from(this.tableName)
                .insert(dbPayload)
                .select()
                .single();

            if (error) throw error;

            this.logger.info({ interventionId: newRecord.id, patientId }, 'Intervention created');
            return this.mapToIntervention(newRecord);
        }, 'create');
    }

    /**
     * Update existing intervention
     */
    async update(id: string, data: Partial<InterventionInput>): Promise<void> {
        return this.withErrorHandling(async () => {
            const updates: any = {};
            if (data.date) updates.date = data.date;
            if (data.type) updates.type = data.type;
            if (data.details) updates.details = data.details;
            if (data.notes) updates.notes = data.notes;
            if (data.complications) updates.complications = data.complications;
            if (data.attachments) updates.attachments = data.attachments;

            const { error } = await this.supabase
                .from(this.tableName)
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            this.logger.info({ interventionId: id }, 'Intervention updated');
        }, 'update');
    }

    /**
     * Delete intervention
     */
    async delete(id: string): Promise<void> {
        return this.withErrorHandling(async () => {
            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('id', id);

            if (error) throw error;

            this.logger.info({ interventionId: id }, 'Intervention deleted');
        }, 'delete');
    }

    private mapToIntervention(row: any): Intervention {
        return {
            id: row.id,
            date: row.date,
            type: row.type,
            details: row.details,
            notes: row.notes,
            complications: row.complications,
            attachments: row.attachments
        };
    }
}

export const interventionsAPI = new InterventionsAPI();
