import { BaseAPI } from './base-api';
import { apiLogger } from '@/lib/logger';

/**
 * Dialysis Session type
 */
export interface DialysisSession {
    id: string;
    patientId: string;
    sessionDate: string;
    dialysisType?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
}

export type SessionInput = Omit<DialysisSession, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Dialysis Sessions API
 */
export class SessionsAPI extends BaseAPI {
    constructor() {
        super('dialysis_sessions', apiLogger);
    }

    /**
     * Get all sessions (with optional patient filter)
     */
    async getAll(patientId?: string): Promise<DialysisSession[]> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'getAll', { patientId });

            let query = this.supabase
                .from(this.tableName)
                .select('*')
                .order('date_of_session', { ascending: false }); // Note: DB column is date_of_session

            if (patientId) {
                query = query.eq('patient_id', patientId);
            }

            const { data, error } = await query;
            if (error) throw error;

            return data.map(this.mapToSession);
        }, 'getAll');
    }

    /**
     * Get session by ID
     */
    async getById(id: string): Promise<DialysisSession | null> {
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

            return this.mapToSession(data);
        }, 'getById');
    }

    /**
     * Create new session
     */
    async create(data: SessionInput): Promise<DialysisSession> {
        return this.withErrorHandling(async () => {
            const now = new Date().toISOString();

            // Map camelCase -> snake_case
            const dbPayload = {
                patient_id: data.patientId,
                date_of_session: data.sessionDate,
                type_of_dialysis: data.dialysisType,
                status: data.status,
                // Add other fields from earlier migration script if they exist in SessionInput
                // e.g. duration, stats, details
                ...data, // Spread remaining fields (careful with non-matching columns)

                created_at: now,
                updated_at: now
            };

            // Fix up specific internal fields if they leak through spread
            delete (dbPayload as any).patientId;
            delete (dbPayload as any).sessionDate;
            delete (dbPayload as any).dialysisType;

            const { data: newRecord, error } = await this.supabase
                .from(this.tableName)
                .insert(dbPayload)
                .select()
                .single();

            if (error) throw error;

            this.logger.info({ sessionId: newRecord.id, patientId: data.patientId }, 'Session created');
            return this.mapToSession(newRecord);
        }, 'create');
    }

    /**
     * Update session
     */
    async update(id: string, data: Partial<SessionInput>): Promise<void> {
        return this.withErrorHandling(async () => {
            const updates: any = { ...data };

            if (data.patientId) {
                updates.patient_id = data.patientId;
                delete updates.patientId;
            }
            if (data.sessionDate) {
                updates.date_of_session = data.sessionDate;
                delete updates.sessionDate;
            }
            if (data.dialysisType) {
                updates.type_of_dialysis = data.dialysisType;
                delete updates.dialysisType;
            }

            updates.updated_at = new Date().toISOString();

            const { error } = await this.supabase
                .from(this.tableName)
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            this.logger.info({ sessionId: id }, 'Session updated');
        }, 'update');
    }

    /**
     * Get recent sessions
     */
    async getRecent(count: number = 10): Promise<DialysisSession[]> {
        return this.withErrorHandling(async () => {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .order('date_of_session', { ascending: false })
                .limit(count);

            if (error) throw error;

            return data.map(this.mapToSession);
        }, 'getRecent');
    }

    private mapToSession(row: any): DialysisSession {
        return {
            id: row.id,
            patientId: row.patient_id,
            sessionDate: row.date_of_session,
            dialysisType: row.type_of_dialysis,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            ...row // Spread other fields
        };
    }
}

// Export singleton
export const sessionsAPI = new SessionsAPI();

