import { Timestamp } from 'firebase/firestore';

/**
 * Patient portal account information structure
 */
export interface PatientAccountInfo {
    userId: string;
    email: string;
    phone: string | null;
    isActive: boolean;
    lastLogin: Timestamp | null;
    createdAt: Timestamp;
}

/**
 * Extended patient account info with optional fields for UI display
 */
export interface PatientAccountInfoDisplay extends PatientAccountInfo {
    deactivatedAt?: Timestamp;
    reactivatedAt?: Timestamp;
}
