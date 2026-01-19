import { BaseAPI } from './base-api';
import { apiLogger } from '@/lib/logger';
import type { InvestigationRecord } from '@/lib/types';
export type { InvestigationRecord };

export type InvestigationRecordInput = Omit<InvestigationRecord, 'id' | 'createdAt' | 'updatedAt'> & { patientId: string };


/**
 * Investigation Records API
 * Handles all lab/investigation related Supabase operations
 */
export class InvestigationRecordsAPI extends BaseAPI {
    constructor() {
        super('investigation_records', apiLogger);
    }

    /**
     * Get all investigation records for a patient
     */
    async getAll(patientId: string): Promise<InvestigationRecord[]> {
        return this.withErrorHandling(async () => {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('patient_id', patientId)
                .order('date', { ascending: false });

            if (error) throw error;

            return data.map(this.mapToInvestigationRecord);
        }, 'getAll');
    }

    /**
     * Get record by ID
     */
    async getById(id: string): Promise<InvestigationRecord | null> {
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

            return this.mapToInvestigationRecord(data);
        }, 'getById');
    }

    /**
     * Create new investigation record
     */
    async create(data: InvestigationRecordInput): Promise<InvestigationRecord> {
        return this.withErrorHandling(async () => {
            const now = new Date().toISOString();
            const dbPayload = {
                patient_id: data.patientId,
                date: data.date,
                tests: data.tests, // JSONB
                notes: data.notes,
                created_at: now
            };

            const { data: newRecord, error } = await this.supabase
                .from(this.tableName)
                .insert(dbPayload)
                .select()
                .single();

            if (error) throw error;

            this.logger.info({
                recordId: newRecord.id,
                patientId: data.patientId,
                testCount: data.tests?.length
            }, 'Investigation record created');

            return this.mapToInvestigationRecord(newRecord);
        }, 'create');
    }

    /**
     * Update investigation record
     */
    async update(id: string, data: Partial<InvestigationRecordInput>): Promise<void> {
        return this.withErrorHandling(async () => {
            const updates: any = {};
            if (data.date) updates.date = data.date;
            if (data.tests) updates.tests = data.tests;
            if (data.notes) updates.notes = data.notes;

            const { error } = await this.supabase
                .from(this.tableName)
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            this.logger.info({ recordId: id }, 'Investigation record updated');
        }, 'update');
    }

    /**
     * Delete investigation record
     */
    async delete(id: string): Promise<void> {
        return this.withErrorHandling(async () => {
            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('id', id);

            if (error) throw error;

            this.logger.info({ recordId: id }, 'Investigation record deleted');
        }, 'delete');
    }

    private mapToInvestigationRecord(row: any): InvestigationRecord {
        return {
            id: row.id,
            patientId: row.patient_id,
            date: row.date,
            tests: row.tests,
            notes: row.notes
        };
    }
}

// Export singleton instance
export const investigationRecordsAPI = new InvestigationRecordsAPI();
