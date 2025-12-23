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
} from 'firebase/firestore';
import { BaseAPI } from './base-api';
import { db } from '@/lib/firebase';
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
    vitalSigns?: {
        bloodPressure?: string;
        pulse?: number;
        weight?: number;
        temperature?: number;
    };
    clinicalNotes?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    [key: string]: any;
}

export type VisitInput = Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Visits API
 * Handles all visit-related Firestore operations
 * 
 * @example
 * ```typescript
 * import { api } from '@/api';
 * 
 * // Get all visits for a patient
 * const visits = await api.visits.getAll('patient123');
 * 
 * // Create new visit
 * const visit = await api.visits.create({
 *   patientId: 'patient123',
 *   visitDate: '2024-12-23',
 *   visitType: 'follow-up'
 * });
 * ```
 */
export class VisitsAPI extends BaseAPI {
    constructor() {
        super(db, 'visits', apiLogger);
    }

    /**
     * Get all visits, optionally filtered by patient
     * 
     * @param patientId - Optional patient ID to filter visits
     * @returns Promise with array of visits
     * @throws {AppError} If database query fails
     * 
     * @example
     * ```typescript
     * // Get all visits
     * const allVisits = await api.visits.getAll();
     * 
     * // Get visits for specific patient
     * const patientVisits = await api.visits.getAll('patient123');
     * ```
     */
    async getAll(patientId?: string): Promise<Visit[]> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'getAll', { patientId });

            let q;
            if (patientId) {
                q = query(
                    collection(this.db, this.collectionName),
                    where('patientId', '==', patientId),
                    orderBy('visitDate', 'desc')
                );
            } else {
                q = query(
                    collection(this.db, this.collectionName),
                    orderBy('visitDate', 'desc')
                );
            }

            const snapshot = await getDocs(q);
            const visits = this.formatDocs<Visit>(snapshot.docs);

            this.logger.info({ count: visits.length, patientId }, 'Fetched visits');
            return visits;
        }, 'getAll');
    }

    /**
     * Get visit by ID
     * 
     * @param id - Visit document ID
     * @returns Promise with visit or null if not found
     * @throws {AppError} If database query fails
     */
    async getById(id: string): Promise<Visit | null> {
        return this.withErrorHandling(async () => {
            const docRef = doc(this.db, this.collectionName, id);
            const snapshot = await getDoc(docRef);

            if (!snapshot.exists()) {
                this.logger.warn({ visitId: id }, 'Visit not found');
                return null;
            }

            return this.formatDoc<Visit>(snapshot);
        }, 'getById');
    }

    /**
     * Create new visit
     * 
     * @param data - Visit data (without id, createdAt, updatedAt)
     * @returns Promise with created visit including generated ID
     * @throws {AppError} If creation fails
     * 
     * @example
     * ```typescript
     * const visit = await api.visits.create({
     *   patientId: 'patient123',
     *   visitDate: '2024-12-23',
     *   visitType: 'follow-up',
     *   chiefComplaint: 'Routine checkup',
     *   vitalSigns: {
     *     bloodPressure: '120/80',
     *     pulse: 72,
     *     weight: 70
     *   }
     * });
     * ```
     */
    async create(data: VisitInput): Promise<Visit> {
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

            const visit = {
                id: docRef.id,
                ...docData,
            } as Visit;

            this.logger.info({ visitId: visit.id, patientId: data.patientId }, 'Visit created');
            return visit;
        }, 'create');
    }

    /**
     * Update existing visit
     * 
     * @param id - Visit document ID
     * @param data - Partial visit data to update
     * @throws {AppError} If update fails
     */
    async update(id: string, data: Partial<VisitInput>): Promise<void> {
        return this.withErrorHandling(async () => {
            const docRef = doc(this.db, this.collectionName, id);

            await updateDoc(docRef, {
                ...data,
                updatedAt: Timestamp.now(),
            });

            this.logger.info({ visitId: id }, 'Visit updated');
        }, 'update');
    }

    /**
     * Get recent visits
     * 
     * @param count - Number of recent visits to fetch (default: 10)
     * @returns Promise with array of recent visits
     */
    async getRecent(count: number = 10): Promise<Visit[]> {
        return this.withErrorHandling(async () => {
            const snapshot = await getDocs(
                query(
                    collection(this.db, this.collectionName),
                    orderBy('visitDate', 'desc'),
                    limit(count)
                )
            );

            const visits = this.formatDocs<Visit>(snapshot.docs);
            this.logger.info({ count: visits.length }, 'Fetched recent visits');
            return visits;
        }, 'getRecent');
    }
}

// Export singleton instance
export const visitsAPI = new VisitsAPI();
