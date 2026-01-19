import { BaseAPI } from './base-api';
import { apiLogger } from '@/lib/logger';
import type { DiagnosisTemplate, MasterDiagnosis } from '@/lib/types';

export class TemplatesAPI extends BaseAPI {
    constructor() {
        super('templates', apiLogger);
    }

    // --- Templates ---

    async getTemplates(userId: string): Promise<Record<string, DiagnosisTemplate>> {
        return this.withErrorHandling(async () => {
            const { data, error } = await this.supabase
                .from('templates')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;

            const templateMap: Record<string, DiagnosisTemplate> = {};
            data.forEach((row: any) => {
                templateMap[row.name] = {
                    ...row.content,
                    templateName: row.name, // Ensure consistency
                    templateType: row.type
                };
            });
            return templateMap;
        }, 'getTemplates');
    }

    async saveTemplate(userId: string, template: DiagnosisTemplate): Promise<void> {
        return this.withErrorHandling(async () => {
            const payload = {
                user_id: userId,
                name: template.templateName,
                type: template.templateType,
                content: template,
                updated_at: new Date().toISOString()
            };

            const { error } = await this.supabase
                .from('templates')
                .upsert(payload, { onConflict: 'user_id, name' });

            if (error) throw error;
        }, 'saveTemplate');
    }

    // --- Master Diagnoses ---

    async getMasterDiagnoses(userId: string): Promise<MasterDiagnosis[]> {
        return this.withErrorHandling(async () => {
            const { data, error } = await this.supabase
                .from('master_diagnoses')
                .select('*')
                .eq('user_id', userId)
                .order('clinical_diagnosis');

            if (error) throw error;

            return data.map((row: any) => ({
                id: row.id,
                clinicalDiagnosis: row.clinical_diagnosis,
                icdMappings: row.icd_mappings
            }));
        }, 'getMasterDiagnoses');
    }

    async saveMasterDiagnoses(userId: string, diagnoses: MasterDiagnosis[]): Promise<void> {
        return this.withErrorHandling(async () => {
            // Bulk upsert
            const upserts = diagnoses.map(d => ({
                id: d.id,
                user_id: userId,
                clinical_diagnosis: d.clinicalDiagnosis,
                icd_mappings: d.icdMappings,
                updated_at: new Date().toISOString()
            }));

            const { error } = await this.supabase
                .from('master_diagnoses')
                .upsert(upserts);

            if (error) throw error;
        }, 'saveMasterDiagnoses');
    }
}

export const templatesAPI = new TemplatesAPI();
