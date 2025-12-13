import { auth, db } from './firebase';
import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    User as FirebaseUser
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';

/**
 * Create a patient login account linked to an existing patient record
 */
export async function createPatientAccount(
    patientId: string,
    email: string,
    password: string,
    phone?: string
): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
        // 1. Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        // 2. Create patientUsers document
        await setDoc(doc(db, `patientUsers/${userId}`), {
            role: 'patient',
            patientId: patientId,
            email: email,
            phone: phone || null,
            createdAt: serverTimestamp(),
            lastLogin: null,
            isActive: true,
        });

        // 3. Update patient record to link userId
        await updateDoc(doc(db, `patients/${patientId}`), {
            userId: userId,
            hasLoginAccess: true,
            portalEmail: email,
            portalCreatedAt: serverTimestamp(),
        });

        return { success: true, userId };
    } catch (error: any) {
        console.error('Error creating patient account:', error);
        return {
            success: false,
            error: error.message || 'Failed to create patient account'
        };
    }
}

/**
 * Check if a patient already has a login account
 */
export async function hasPatientAccount(patientId: string): Promise<boolean> {
    try {
        const patientDoc = await getDoc(doc(db, `patients/${patientId}`));
        if (!patientDoc.exists()) return false;

        const data = patientDoc.data();
        return data.hasLoginAccess === true && !!data.userId;
    } catch (error) {
        console.error('Error checking patient account:', error);
        return false;
    }
}

/**
 * Get patient account details
 */
export async function getPatientAccountInfo(patientId: string) {
    try {
        const patientDoc = await getDoc(doc(db, `patients/${patientId}`));
        if (!patientDoc.exists()) return null;

        const data = patientDoc.data();
        if (!data.userId) return null;

        const patientUserDoc = await getDoc(doc(db, `patientUsers/${data.userId}`));
        if (!patientUserDoc.exists()) return null;

        const userData = patientUserDoc.data();
        return {
            userId: data.userId,
            email: userData.email,
            phone: userData.phone,
            isActive: userData.isActive,
            lastLogin: userData.lastLogin,
            createdAt: userData.createdAt,
        };
    } catch (error) {
        console.error('Error getting patient account info:', error);
        return null;
    }
}

/**
 * Deactivate patient portal access
 */
export async function deactivatePatientAccount(patientId: string): Promise<boolean> {
    try {
        const patientDoc = await getDoc(doc(db, `patients/${patientId}`));
        if (!patientDoc.exists()) return false;

        const data = patientDoc.data();
        if (!data.userId) return false;

        // Deactivate in patientUsers
        await updateDoc(doc(db, `patientUsers/${data.userId}`), {
            isActive: false,
            deactivatedAt: serverTimestamp(),
        });

        // Update patient record
        await updateDoc(doc(db, `patients/${patientId}`), {
            hasLoginAccess: false,
        });

        return true;
    } catch (error) {
        console.error('Error deactivating patient account:', error);
        return false;
    }
}

/**
 * Reactivate patient portal access
 */
export async function reactivatePatientAccount(patientId: string): Promise<boolean> {
    try {
        const patientDoc = await getDoc(doc(db, `patients/${patientId}`));
        if (!patientDoc.exists()) return false;

        const data = patientDoc.data();
        if (!data.userId) return false;

        await updateDoc(doc(db, `patientUsers/${data.userId}`), {
            isActive: true,
            reactivatedAt: serverTimestamp(),
        });

        await updateDoc(doc(db, `patients/${patientId}`), {
            hasLoginAccess: true,
        });

        return true;
    } catch (error) {
        console.error('Error reactivating patient account:', error);
        return false;
    }
}

/**
 * Send password reset email to patient
 */
export async function sendPatientPasswordReset(email: string): Promise<boolean> {
    try {
        await sendPasswordResetEmail(auth, email);
        return true;
    } catch (error) {
        console.error('Error sending password reset:', error);
        return false;
    }
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(userId: string, role: 'patient' | 'staff'): Promise<void> {
    try {
        const collection = role === 'patient' ? 'patientUsers' : 'users';
        await updateDoc(doc(db, `${collection}/${userId}`), {
            lastLogin: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating last login:', error);
    }
}
