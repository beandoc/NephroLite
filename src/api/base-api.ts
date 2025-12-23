import { Firestore } from 'firebase/firestore';
import { logger } from '@/lib/logger';
import { handleError } from '@/lib/error-handler';

/**
 * Base API class for all Firestore operations
 * Provides common functionality: retry logic, logging, error handling
 */
export abstract class BaseAPI {
    protected db: Firestore;
    protected logger: typeof logger;
    protected collectionName: string;

    constructor(db: Firestore, collectionName: string, loggerInstance: typeof logger) {
        this.db = db;
        this.collectionName = collectionName;
        this.logger = loggerInstance.child({
            api: this.constructor.name,
            collection: collectionName
        });
    }

    /**
     * Wrap operations with error handling and retry logic
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
            collection: this.collectionName,
            ...data
        }, `${operation}`);
    }

    /**
     * Format Firestore document for API response
     */
    protected formatDoc<T>(doc: any): T {
        return {
            id: doc.id,
            ...doc.data(),
        } as T;
    }

    /**
     * Format multiple Firestore documents
     */
    protected formatDocs<T>(docs: any[]): T[] {
        return docs.map(doc => this.formatDoc<T>(doc));
    }
}
