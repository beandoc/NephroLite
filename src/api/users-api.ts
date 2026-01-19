import { BaseAPI } from './base-api';
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
 */
export class UsersAPI extends BaseAPI {
    constructor() {
        // Assuming we created a 'profiles' table which is common in Supabase for user metadata
        // If not, we might need to fallback to 'users' table if we migrated it exactly
        super('profiles', apiLogger);
    }

    /**
     * Get all users
     */
    async getAll(activeOnly: boolean = true): Promise<User[]> {
        return this.withErrorHandling(async () => {
            this.logOperation('start', 'getAll', { activeOnly });

            let query = this.supabase
                .from(this.tableName)
                .select('*')
                .order('display_name', { ascending: true }); // snake_case

            if (activeOnly) {
                query = query.eq('is_active', true);
            }

            const { data, error } = await query;
            if (error) throw error;

            return data.map(this.mapToUser);
        }, 'getAll');
    }

    /**
     * Get user by ID
     */
    async getById(id: string): Promise<User | null> {
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

            return this.mapToUser(data);
        }, 'getById');
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.withErrorHandling(async () => {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('email', email.toLowerCase())
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw error;
            }

            return this.mapToUser(data);
        }, 'findByEmail');
    }

    /**
     * Update user role
     */
    async updateRole(id: string, role: UserRole): Promise<void> {
        return this.withErrorHandling(async () => {
            const { error } = await this.supabase
                .from(this.tableName)
                .update({
                    role,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            this.logger.info({ userId: id, role }, 'User role updated');
        }, 'updateRole');
    }

    /**
     * Update user profile
     */
    async update(id: string, data: Partial<Omit<UserInput, 'role'>>): Promise<void> {
        return this.withErrorHandling(async () => {
            const updates: any = {};
            if (data.displayName) updates.display_name = data.displayName;
            if (data.phoneNumber) updates.phone = data.phoneNumber; // Assuming phone column
            if (data.email) updates.email = data.email;
            if (data.isActive !== undefined) updates.is_active = data.isActive;

            updates.updated_at = new Date().toISOString();

            const { error } = await this.supabase
                .from(this.tableName)
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            this.logger.info({ userId: id }, 'User profile updated');
        }, 'update');
    }

    /**
     * Get users by role
     */
    async getByRole(role: UserRole): Promise<User[]> {
        return this.withErrorHandling(async () => {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('role', role)
                .eq('is_active', true);

            if (error) throw error;

            return data.map(this.mapToUser);
        }, 'getByRole');
    }

    private mapToUser(row: any): User {
        return {
            id: row.id,
            email: row.email,
            displayName: row.display_name,
            role: row.role,
            phoneNumber: row.phone,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            ...row
        };
    }
}

// Export singleton instance
export const usersAPI = new UsersAPI();

