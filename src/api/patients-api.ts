import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
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
 * Patient type (simplified - extend as needed)
 */
export interface Patient {
    id: string;
    personalInfo?: {
        name?: string;
        email?: string;
        phoneNumber?: string;
    };
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    isDeleted?: boolean;
    [key: string]: any;
}

export type PatientInput = Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Patients API
 * Handles all patient-related Firestore operations
 */
export class PatientsAPI extends BaseAPI {
    constructor() {
        super(db, 'patients', apiLogger);
    }

    /**
     * Get all patients
     */
    async getAll(): Promise<Patient[]> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'getAll');

            const snapshot = await getDocs(
                query(
                    collection(this.db, this.collectionName),
                    where('isDeleted', '!=', true),
                    orderBy('isDeleted'),
                    orderBy('createdAt', 'desc')
                )
            );

            const patients = this.formatDocs<Patient>(snapshot.docs);

            this.logger.info({ count: patients.length }, 'Fetched all patients');
            return patients;
        }, 'getAll');
    }

    /**
     * Get patient by ID
     */
    async getById(id: string): Promise<Patient | null> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'getById', { patientId: id });

            const docRef = doc(this.db, this.collectionName, id);
            const snapshot = await getDoc(docRef);

            if (!snapshot.exists()) {
                this.logger.warn({ patientId: id }, 'Patient not found');
                return null;
            }

            const patient = this.formatDoc<Patient>(snapshot);
            return patient;
        }, 'getById');
    }

    /**
     * Create new patient
     */
    async create(data: PatientInput): Promise<Patient> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'create');

            const now = Timestamp.now();
            const docData = {
                ...data,
                createdAt: now,
                updatedAt: now,
                isDeleted: false,
            };

            const docRef = await addDoc(
                collection(this.db, this.collectionName),
                docData
            );

            const patient: Patient = {
                id: docRef.id,
                ...docData,
            };

            this.logger.info({ patientId: patient.id }, 'Patient created');
            return patient;
        }, 'create');
    }

    /**
     * Update patient
     */
    async update(id: string, data: Partial<PatientInput>): Promise<void> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'update', { patientId: id });

            const docRef = doc(this.db, this.collectionName, id);

            await updateDoc(docRef, {
                ...data,
                updatedAt: Timestamp.now(),
            });

            this.logger.info({ patientId: id }, 'Patient updated');
        }, 'update');
    }

    /**
     * Soft delete patient
     */
    async delete(id: string): Promise<void> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'delete', { patientId: id });

            await this.update(id, {
                isDeleted: true
            } as any);

            this.logger.info({ patientId: id }, 'Patient soft-deleted');
        }, 'delete');
    }

    /**
     * Search patients by name
     */
    async searchByName(name: string): Promise<Patient[]> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'searchByName', { query: name });

            const snapshot = await getDocs(
                query(
                    collection(this.db, this.collectionName),
                    where('personalInfo.name', '>=', name),
                    where('personalInfo.name', '<=', name + '\uf8ff'),
                    where('isDeleted', '!=', true),
                    limit(20)
                )
            );

            const patients = this.formatDocs<Patient>(snapshot.docs);

            this.logger.info({ query: name, count: patients.length }, 'Search completed');
            return patients;
        }, 'searchByName');
    }

    /**
     * Get patients with pagination
     */
    async getPaginated(pageSize: number = 20, filters: QueryConstraint[] = []): Promise<Patient[]> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'getPaginated', { pageSize });

            const snapshot = await getDocs(
                query(
                    collection(this.db, this.collectionName),
                    where('isDeleted', '!=', true),
                    ...filters,
                    limit(pageSize)
                )
            );

            const patients = this.formatDocs<Patient>(snapshot.docs);

            this.logger.info({ pageSize, count: patients.length }, 'Paginated fetch completed');
            return patients;
        }, 'getPaginated');
    }
}

// Export singleton instance
export const patientsAPI = new PatientsAPI();
