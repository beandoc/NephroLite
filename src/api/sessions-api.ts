import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    QueryConstraint,
} from 'firebase/firestore';
import { BaseAPI } from './base-api';
import { db } from '@/lib/firebase';
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
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    [key: string]: any;
}

export type SessionInput = Omit<DialysisSession, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Dialysis Sessions API
 */
export class SessionsAPI extends BaseAPI {
    constructor() {
        super(db, 'dialysisSessions', apiLogger);
    }

    /**
     * Get all sessions (with optional patient filter)
     */
    async getAll(patientId?: string): Promise<DialysisSession[]> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'getAll', { patientId });

            let q;
            if (patientId) {
                q = query(
                    collection(this.db, this.collectionName),
                    where('patientId', '==', patientId),
                    orderBy('sessionDate', 'desc')
                );
            } else {
                q = query(
                    collection(this.db, this.collectionName),
                    orderBy('sessionDate', 'desc')
                );
            }

            const snapshot = await getDocs(q);

            const sessions = this.formatDocs<DialysisSession>(snapshot.docs);
            this.logger.info({ count: sessions.length, patientId }, 'Fetched sessions');
            return sessions;
        }, 'getAll');
    }

    /**
     * Get session by ID
     */
    async getById(id: string): Promise<DialysisSession | null> {
        return this.withErrorHandling(async () => {
            const docRef = doc(this.db, this.collectionName, id);
            const snapshot = await getDoc(docRef);

            if (!snapshot.exists()) {
                this.logger.warn({ sessionId: id }, 'Session not found');
                return null;
            }

            return this.formatDoc<DialysisSession>(snapshot);
        }, 'getById');
    }

    /**
     * Create new session
     */
    async create(data: SessionInput): Promise<DialysisSession> {
        return this.withErrorHandling(async () => {
            const now = Timestamp.now();
            const docData = {
                ...data,
                createdAt: now,
                updatedAt: now,
            };

            const docRef = await addDoc(
                collection(this.db, this.collectionName),
                docData
            );

            const session = {
                id: docRef.id,
                ...docData,
            } as DialysisSession;

            this.logger.info({ sessionId: session.id, patientId: data.patientId }, 'Session created');
            return session;
        }, 'create');
    }

    /**
     * Update session
     */
    async update(id: string, data: Partial<SessionInput>): Promise<void> {
        return this.withErrorHandling(async () => {
            const docRef = doc(this.db, this.collectionName, id);

            await updateDoc(docRef, {
                ...data,
                updatedAt: Timestamp.now(),
            });

            this.logger.info({ sessionId: id }, 'Session updated');
        }, 'update');
    }

    /**
     * Get recent sessions
     */
    async getRecent(count: number = 10): Promise<DialysisSession[]> {
        return this.withErrorHandling(async () => {
            const snapshot = await getDocs(
                query(
                    collection(this.db, this.collectionName),
                    orderBy('sessionDate', 'desc'),
                    limit(count)
                )
            );

            const sessions = this.formatDocs<DialysisSession>(snapshot.docs);
            this.logger.info({ count: sessions.length }, 'Fetched recent sessions');
            return sessions;
        }, 'getRecent');
    }
}

// Export singleton
export const sessionsAPI = new SessionsAPI();
