import {
    collection,
    doc,
    getDocs,
    getDoc,
    updateDoc,
    query,
    where,
    orderBy,
} from 'firebase/firestore';
import { BaseAPI } from './base-api';
import { db } from '@/lib/firebase';
import { apiLogger } from '@/lib/logger';

/**
 * User role types
 */
export type UserRole = 'doctor' | 'nurse' | 'admin' | 'staff';

/**
 * User type representing staff members
 */
export interface User {
    id: string;
    email: string;
    displayName?: string;
    role: UserRole;
    phoneNumber?: string;
    isActive?: boolean;
    createdAt?: any;
    updatedAt?: any;
    [key: string]: any;
}

export type UserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Users API
 * Handles all user-related Firestore operations
 * 
 * Note: User creation is handled by Firebase Auth + Cloud Functions
 * This API is for reading and updating user metadata
 * 
 * @example
 * ```typescript
 * import { api } from '@/api';
 * 
 * // Get all users
 * const users = await api.users.getAll();
 * 
 * // Update user role
 * await api.users.updateRole('user123', 'doctor');
 * 
 * // Search by email
 * const user = await api.users.findByEmail('doctor@example.com');
 * ```
 */
export class UsersAPI extends BaseAPI {
    constructor() {
        super(db, 'users', apiLogger);
    }

    /**
     * Get all users
     * 
     * @param activeOnly - If true, only return active users (default: true)
     * @returns Promise with array of users
     * @throws {AppError} If database query fails
     */
    async getAll(activeOnly: boolean = true): Promise<User[]> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'getAll', { activeOnly });

            let q;
            if (activeOnly) {
                q = query(
                    collection(this.db, this.collectionName),
                    where('isActive', '==', true),
                    orderBy('displayName')
                );
            } else {
                q = query(
                    collection(this.db, this.collectionName),
                    orderBy('displayName')
                );
            }

            const snapshot = await getDocs(q);
            const users = this.formatDocs<User>(snapshot.docs);

            this.logger.info({ count: users.length, activeOnly }, 'Fetched users');
            return users;
        }, 'getAll');
    }

    /**
     * Get user by ID
     * 
     * @param id - User document ID (same as Firebase Auth UID)
     * @returns Promise with user or null if not found
     * @throws {AppError} If database query fails
     */
    async getById(id: string): Promise<User | null> {
        return this.withErrorHandling(async () => {
            const docRef = doc(this.db, this.collectionName, id);
            const snapshot = await getDoc(docRef);

            if (!snapshot.exists()) {
                this.logger.warn({ userId: id }, 'User not found');
                return null;
            }

            return this.formatDoc<User>(snapshot);
        }, 'getById');
    }

    /**
     * Find user by email
     * 
     * @param email - User email address
     * @returns Promise with user or null if not found
     * @throws {AppError} If database query fails
     * 
     * @example
     * ```typescript
     * const user = await api.users.findByEmail('doctor@example.com');
     * if (user) {
     *   console.log('User role:', user.role);
     * }
     * ```
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.withErrorHandling(async () => {
            const snapshot = await getDocs(
                query(
                    collection(this.db, this.collectionName),
                    where('email', '==', email.toLowerCase())
                )
            );

            if (snapshot.empty) {
                this.logger.warn({ email }, 'User not found by email');
                return null;
            }

            return this.formatDoc<User>(snapshot.docs[0]);
        }, 'findByEmail');
    }

    /**
     * Update user role
     * 
     * @param id - User document ID
     * @param role - New role to assign
     * @throws {AppError} If update fails
     * 
     * @example
     * ```typescript
     * // Promote nurse to doctor
     * await api.users.updateRole('user123', 'doctor');
     * ```
     */
    async updateRole(id: string, role: UserRole): Promise<void> {
        return this.withErrorHandling(async () => {
            const docRef = doc(this.db, this.collectionName, id);

            await updateDoc(docRef, {
                role,
                updatedAt: new Date(),
            });

            this.logger.info({ userId: id, role }, 'User role updated');
        }, 'updateRole');
    }

    /**
     * Update user profile
     * 
     * @param id - User document ID
     * @param data - Partial user data to update
     * @throws {AppError} If update fails
     * 
     * Note: Cannot change role via this method, use updateRole instead
     */
    async update(id: string, data: Partial<Omit<UserInput, 'role'>>): Promise<void> {
        return this.withErrorHandling(async () => {
            const docRef = doc(this.db, this.collectionName, id);

            await updateDoc(docRef, {
                ...data,
                updatedAt: new Date(),
            });

            this.logger.info({ userId: id }, 'User profile updated');
        }, 'update');
    }

    /**
     * Get users by role
     * 
     * @param role - User role to filter by
     * @returns Promise with array of users with specified role
     * 
     * @example
     * ```typescript
     * // Get all doctors
     * const doctors = await api.users.getByRole('doctor');
     * ```
     */
    async getByRole(role: UserRole): Promise<User[]> {
        return this.withErrorHandling(async () => {
            const snapshot = await getDocs(
                query(
                    collection(this.db, this.collectionName),
                    where('role', '==', role),
                    where('isActive', '==', true)
                )
            );

            const users = this.formatDocs<User>(snapshot.docs);
            this.logger.info({ role, count: users.length }, 'Fetched users by role');
            return users;
        }, 'getByRole');
    }
}

// Export singleton instance
export const usersAPI = new UsersAPI();
