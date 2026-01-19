import { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase/client';
import { handleError } from '@/lib/error-handler';

/**
 * Base API class for all Supabase operations
 * Provides common functionality: error handling, logging
 */
export abstract class BaseAPI {
    protected supabase: SupabaseClient;
    protected logger: typeof logger;
    protected tableName: string;

    constructor(tableName: string, loggerInstance: typeof logger) {
        this.supabase = supabase;
        this.tableName = tableName;
        this.logger = loggerInstance.child({
            api: this.constructor.name,
            table: tableName
        });
    }

    /**
     * Wrap operations with error handling
     */
    protected async withErrorHandling<T>(
        operation: () => Promise<T>,
        context: string
    ): Promise<T> {
        try {
            const result = await operation();
            this.logOperation('success', context);
            return result;
        } catch (error) {
            this.logger.error({ error, context }, `API operation failed: ${context}`);
            throw handleError(error, `${this.constructor.name}.${context}`, false);
        }
    }

    /**
     * Log successful operations
     */
    protected logOperation(status: 'success' | 'start', operation: string, data?: any) {
        this.logger.info({
            status,
            operation,
            table: this.tableName,
            ...data
        }, `${operation}`);
    }
}

