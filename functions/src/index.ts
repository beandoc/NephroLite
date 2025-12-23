import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
    patientSchema,
    dialysisSessionSchema,
    visitSchema
} from './validation/schemas';
import { z } from 'zod';

// Export backup functions
export * from './backup';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

/**
 * Helper function to check user authorization
 */
async function checkAuthorization(
    userId: string,
    allowedRoles: string[]
): Promise<{ authorized: boolean; role?: string }> {
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
        return { authorized: false };
    }

    const userData = userDoc.data();
    const userRole = userData?.role;

    return {
        authorized: allowedRoles.includes(userRole),
        role: userRole
    };
}

/**
 * Helper function to log audit trail
 */
async function logAudit(auditData: {
    action: string;
    userId: string;
    resourceType: string;
    resourceId: string;
    metadata?: any;
}): Promise<void> {
    await db.collection('auditLogs').add({
        ...auditData,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
}

/**
 * Cloud Function: Create Patient
 * Validates and creates a new patient with server-side checks
 */
export const createPatient = functions.https.onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'User must be authenticated to create patients'
        );
    }

    // Check authorization
    const { authorized, role } = await checkAuthorization(
        context.auth.uid,
        ['doctor', 'admin', 'nurse']
    );

    if (!authorized) {
        throw new functions.https.HttpsError(
            'permission-denied',
            `Role '${role}' does not have permission to create patients`
        );
    }

    // Validate data
    try {
        const validatedData = patientSchema.parse(data);

        // Check for duplicate nephroId
        const existingPatient = await db.collection('patients')
            .where('nephroId', '==', validatedData.nephroId)
            .limit(1)
            .get();

        if (!existingPatient.empty) {
            throw new functions.https.HttpsError(
                'already-exists',
                `Patient with Nephro ID '${validatedData.nephroId}' already exists`
            );
        }

        // Create patient with server timestamp
        const patientRef = db.collection('patients').doc();
        await patientRef.set({
            ...validatedData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: context.auth.uid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Log audit trail
        await logAudit({
            action: 'CREATE_PATIENT',
            userId: context.auth.uid,
            resourceType: 'patient',
            resourceId: patientRef.id,
            metadata: { nephroId: validatedData.nephroId }
        });

        return {
            success: true,
            patientId: patientRef.id,
            message: 'Patient created successfully'
        };

    } catch (error) {
        if (error instanceof z.ZodError) {
            const firstError = error.errors[0];
            throw new functions.https.HttpsError(
                'invalid-argument',
                `Validation error: ${firstError.path.join('.')}: ${firstError.message} `
            );
        }
        throw error;
    }
});

/**
 * Cloud Function: Create Dialysis Session
 * Validates and creates a dialysis session with patient verification
 */
export const createDialysisSession = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { authorized } = await checkAuthorization(context.auth.uid, ['doctor', 'nurse']);
    if (!authorized) {
        throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
    }

    try {
        const validatedData = dialysisSessionSchema.parse(data);

        // Verify patient exists
        const patientDoc = await db.collection('patients').doc(validatedData.patientId).get();
        if (!patientDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Patient not found');
        }

        // Create session in a transaction to ensure data consistency
        const sessionRef = db.collection('dialysisSessions').doc();

        await db.runTransaction(async (transaction) => {
            // Create session
            transaction.set(sessionRef, {
                ...validatedData,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: context.auth!.uid,
                status: validatedData.status || 'Active',
            });

            // Update patient's last session date
            transaction.update(patientDoc.ref, {
                lastDialysisDate: validatedData.sessionDate,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        });

        await logAudit({
            action: 'CREATE_DIALYSIS_SESSION',
            userId: context.auth.uid,
            resourceType: 'dialysisSession',
            resourceId: sessionRef.id,
            metadata: {
                patientId: validatedData.patientId,
                dialysisType: validatedData.dialysisType
            }
        });

        return { success: true, sessionId: sessionRef.id };

    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                `Validation error: ${error.errors[0].message} `
            );
        }
        throw error;
    }
});

/**
 * Cloud Function: Create Visit
 * Validates and creates a patient visit record
 */
export const createVisit = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { authorized } = await checkAuthorization(context.auth.uid, ['doctor', 'nurse']);
    if (!authorized) {
        throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
    }

    try {
        const validatedData = visitSchema.parse(data);

        // Verify patient exists
        const patientDoc = await db.collection('patients').doc(validatedData.patientId).get();
        if (!patientDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Patient not found');
        }

        // Create visit
        const visitRef = db.collection('visits').doc();
        await visitRef.set({
            ...validatedData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: context.auth.uid,
        });

        await logAudit({
            action: 'CREATE_VISIT',
            userId: context.auth.uid,
            resourceType: 'visit',
            resourceId: visitRef.id,
            metadata: {
                patientId: validatedData.patientId,
                visitType: validatedData.visitType
            }
        });

        return { success: true, visitId: visitRef.id };

    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                `Validation error: ${error.errors[0].message} `
            );
        }
        throw error;
    }
});

/**
 * Cloud Function: Update Patient
 * Validates and updates patient data
 */
export const updatePatient = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { authorized } = await checkAuthorization(context.auth.uid, ['doctor', 'admin']);
    if (!authorized) {
        throw new functions.https.HttpsError('permission-denied', 'Only doctors and admins can update patients');
    }

    const { patientId, ...updateData } = data;

    if (!patientId) {
        throw new functions.https.HttpsError('invalid-argument', 'Patient ID is required');
    }

    try {
        // Validate update data (partial schema)
        const validatedData = patientSchema.partial().parse(updateData);

        // Check if patient exists
        const patientRef = db.collection('patients').doc(patientId);
        const patientDoc = await patientRef.get();

        if (!patientDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Patient not found');
        }

        // Update patient
        await patientRef.update({
            ...validatedData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: context.auth.uid,
        });

        await logAudit({
            action: 'UPDATE_PATIENT',
            userId: context.auth.uid,
            resourceType: 'patient',
            resourceId: patientId,
        });

        return { success: true, message: 'Patient updated successfully' };

    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                `Validation error: ${error.errors[0].message} `
            );
        }
        throw error;
    }
});

/**
 * Cloud Function: Delete Patient
 * Soft delete (archive) a patient record
 */
export const deletePatient = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { authorized } = await checkAuthorization(context.auth.uid, ['admin']);
    if (!authorized) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can delete patients');
    }

    const { patientId } = data;

    if (!patientId) {
        throw new functions.https.HttpsError('invalid-argument', 'Patient ID is required');
    }

    const patientRef = db.collection('patients').doc(patientId);
    const patientDoc = await patientRef.get();

    if (!patientDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Patient not found');
    }

    // Soft delete - mark as archived
    await patientRef.update({
        isArchived: true,
        archivedAt: admin.firestore.FieldValue.serverTimestamp(),
        archivedBy: context.auth.uid,
    });

    await logAudit({
        action: 'DELETE_PATIENT',
        userId: context.auth.uid,
        resourceType: 'patient',
        resourceId: patientId,
    });

    return { success: true, message: 'Patient archived successfully' };
});
