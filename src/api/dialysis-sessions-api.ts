import { BaseAPI } from './base-api';
import { apiLogger } from '@/lib/logger';
import type { DialysisSession } from '@/lib/types';

export type DialysisSessionInput = Omit<DialysisSession, 'id' | 'createdAt' | 'updatedAt'>;

export class DialysisSessionsAPI extends BaseAPI {
    constructor() {
        super('dialysis_sessions', apiLogger);
    }

    /**
     * Get all dialysis sessions for a patient
     */
    async getAll(patientId: string): Promise<DialysisSession[]> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'getAll', { patientId });

            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('patient_id', patientId)
                .order('date_of_session', { ascending: false });

            if (error) throw error;

            return data.map(this.mapToDialysisSession);
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

            return this.mapToDialysisSession(data);
        }, 'getById');
    }

    /**
     * Create new dialysis session
     */
    /**
     * Create new dialysis session
     */
    async create(patientId: string, data: DialysisSessionInput): Promise<DialysisSession> {
        return this.withErrorHandling(async () => {
            const now = new Date().toISOString();

            // Extract top-level fields
            const {
                dateOfSession,
                typeOfDialysis,
                duration,
                // Stats fields
                dryWeight, ultrafiltration, weightBefore, weightAfter,
                bpBefore, bpDuring, bpPeak, bpNadir, bpAfter,
                bloodFlowRate, dialysateFlowRate,
                // Everything else falls into details
                ...detailsRest
            } = data;

            // Construct structured objects
            const stats = {
                dryWeight, ultrafiltration, weightBefore, weightAfter,
                bpBefore, bpDuring, bpPeak, bpNadir, bpAfter,
                bloodFlowRate, dialysateFlowRate
            };

            // Helper to parse BP string "120/80" -> [120, 80]
            const parseBP = (bpStr: string | undefined): { sys: number | null, dia: number | null } => {
                if (!bpStr) return { sys: null, dia: null };
                const parts = bpStr.split('/');
                if (parts.length !== 2) return { sys: null, dia: null };
                const sys = parseInt(parts[0], 10);
                const dia = parseInt(parts[1], 10);
                return {
                    sys: isNaN(sys) ? null : sys,
                    dia: isNaN(dia) ? null : dia
                };
            };

            const bp = parseBP(data.bpBefore);

            const dbPayload = {
                patient_id: patientId,
                date_of_session: dateOfSession,
                type_of_dialysis: typeOfDialysis,
                duration: duration,

                // Granular Metrics
                systolic_bp: bp.sys,
                diastolic_bp: bp.dia,
                weight_kg: data.weightBefore ?? null,
                uf_volume_ml: data.ultrafiltration ?? null,

                stats: stats,
                details: detailsRest, // Spread the rest into details automatically
                created_at: now
            };

            const { data: newRecord, error } = await this.supabase
                .from(this.tableName)
                .insert(dbPayload)
                .select()
                .single();

            if (error) throw error;

            this.logger.info({ sessionId: newRecord.id, patientId }, 'Dialysis session created');
            return this.mapToDialysisSession(newRecord);
        }, 'create');
    }

    /**
     * Update existing dialysis session
     */
    async update(id: string, data: Partial<DialysisSessionInput>): Promise<void> {
        return this.withErrorHandling(async () => {
            // Fetch existing record to safely merge JSONB fields
            const { data: existing, error: fetchError } = await this.supabase
                .from(this.tableName)
                .select('stats, details')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            const updates: any = {};
            if (data.dateOfSession) updates.date_of_session = data.dateOfSession;
            if (data.typeOfDialysis) updates.type_of_dialysis = data.typeOfDialysis;
            if (data.duration) updates.duration = data.duration;

            // Update Granular Metrics if relevant fields change
            if (data.bpBefore) {
                const parts = data.bpBefore.split('/');
                if (parts.length === 2) {
                    updates.systolic_bp = parseInt(parts[0], 10);
                    updates.diastolic_bp = parseInt(parts[1], 10);
                }
            }
            if (data.weightBefore !== undefined) updates.weight_kg = data.weightBefore;
            if (data.ultrafiltration !== undefined) updates.uf_volume_ml = data.ultrafiltration;

            // Merge Stats
            const statsUpdates = {
                dryWeight: data.dryWeight,
                ultrafiltration: data.ultrafiltration,
                weightBefore: data.weightBefore,
                weightAfter: data.weightAfter,
                bpBefore: data.bpBefore,
                bpDuring: data.bpDuring,
                bpPeak: data.bpPeak,
                bpNadir: data.bpNadir,
                bpAfter: data.bpAfter,
                bloodFlowRate: data.bloodFlowRate,
                dialysateFlowRate: data.dialysateFlowRate
            };
            // Filter out undefined from updates
            const cleanStatsUpdates = Object.fromEntries(
                Object.entries(statsUpdates).filter(([_, v]) => v !== undefined)
            );

            if (Object.keys(cleanStatsUpdates).length > 0) {
                updates.stats = { ...existing.stats, ...cleanStatsUpdates };
            }

            // Merge Details
            // Identify keys that belong to top-level or stats, and exclude them to find 'details' keys
            const knownKeys = new Set([
                'dateOfSession', 'typeOfDialysis', 'duration',
                'dryWeight', 'ultrafiltration', 'weightBefore', 'weightAfter',
                'bpBefore', 'bpDuring', 'bpPeak', 'bpNadir', 'bpAfter',
                'bloodFlowRate', 'dialysateFlowRate'
            ]);

            const detailUpdates: any = {};
            Object.entries(data).forEach(([key, value]) => {
                if (!knownKeys.has(key) && value !== undefined) {
                    detailUpdates[key] = value;
                }
            });

            if (Object.keys(detailUpdates).length > 0) {
                updates.details = { ...existing.details, ...detailUpdates };
            }

            const { error } = await this.supabase
                .from(this.tableName)
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            this.logger.info({ sessionId: id }, 'Dialysis session updated');
        }, 'update');
    }

    /**
     * Delete session
     */
    async delete(id: string): Promise<void> {
        return this.withErrorHandling(async () => {
            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('id', id);

            if (error) throw error;

            this.logger.info({ sessionId: id }, 'Dialysis session deleted');
        }, 'delete');
    }

    private mapToDialysisSession(row: any): DialysisSession {
        return {
            id: row.id,
            patientId: row.patient_id,
            dateOfSession: row.date_of_session,
            typeOfDialysis: row.type_of_dialysis,
            duration: row.duration,
            ...row.stats,
            ...row.details
        };
    }
}

export const dialysisSessionsAPI = new DialysisSessionsAPI();
