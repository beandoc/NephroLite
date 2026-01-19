import { BaseAPI } from './base-api';
import { apiLogger } from '@/lib/logger';
import type { InvestigationMaster, InvestigationPanel } from '@/lib/types';

/**
 * Master Data API
 * Handles investigation master list and panels
 */
export class MasterDataAPI extends BaseAPI {
    constructor() {
        super('investigation_master_list', apiLogger);
    }

    // --- Investigation Master List ---

    async getInvestigationMasterList(): Promise<InvestigationMaster[]> {
        return this.withErrorHandling(async () => {
            const { data, error } = await this.supabase
                .from('investigation_master_list')
                .select('*')
                .order('name');

            if (error) throw error;
            return data.map(this.mapToInvestigationMaster);
        }, 'getInvestigationMasterList');
    }

    async upsertInvestigationMaster(item: InvestigationMaster): Promise<void> {
        return this.withErrorHandling(async () => {
            const payload = {
                id: item.id,
                name: item.name,
                group_name: item.group,
                unit: item.unit,
                normal_range: item.normalRange,
                result_type: item.resultType || 'numeric',
                options: item.options,
                updated_at: new Date().toISOString()
            };

            const { error } = await this.supabase
                .from('investigation_master_list')
                .upsert(payload);

            if (error) throw error;
        }, 'upsertInvestigationMaster');
    }

    async deleteInvestigationMaster(id: string): Promise<void> {
        return this.withErrorHandling(async () => {
            const { error } = await this.supabase
                .from('investigation_master_list')
                .delete()
                .eq('id', id);

            if (error) throw error;
        }, 'deleteInvestigationMaster');
    }

    // --- Investigation Panels ---

    async getInvestigationPanels(): Promise<InvestigationPanel[]> {
        return this.withErrorHandling(async () => {
            const { data, error } = await this.supabase
                .from('investigation_panels')
                .select('*')
                .order('name');

            if (error) throw error;
            return data.map(this.mapToInvestigationPanel);
        }, 'getInvestigationPanels');
    }

    async upsertInvestigationPanel(panel: InvestigationPanel): Promise<void> {
        return this.withErrorHandling(async () => {
            const payload = {
                id: panel.id,
                name: panel.name,
                group_name: panel.group,
                test_ids: panel.testIds,
                updated_at: new Date().toISOString()
            };

            const { error } = await this.supabase
                .from('investigation_panels')
                .upsert(payload);

            if (error) throw error;
        }, 'upsertInvestigationPanel');
    }

    async deleteInvestigationPanel(id: string): Promise<void> {
        return this.withErrorHandling(async () => {
            const { error } = await this.supabase
                .from('investigation_panels')
                .delete()
                .eq('id', id);

            if (error) throw error;
        }, 'deleteInvestigationPanel');
    }

    // --- Mappers ---

    private mapToInvestigationMaster(row: any): InvestigationMaster {
        return {
            id: row.id,
            name: row.name,
            group: row.group_name,
            unit: row.unit,
            normalRange: row.normal_range,
            resultType: row.result_type,
            options: row.options
        };
    }

    private mapToInvestigationPanel(row: any): InvestigationPanel {
        return {
            id: row.id,
            name: row.name,
            group: row.group_name,
            testIds: row.test_ids || []
        };
    }
}

export const masterDataAPI = new MasterDataAPI();
