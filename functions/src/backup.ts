import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const firestore = require('@google-cloud/firestore');
const client = new firestore.v1.FirestoreAdminClient();

/**
 * Scheduled Firestore Backup
 * Runs daily at 2:00 AM IST
 * Backs up critical collections to Google Cloud Storage
 */
export const scheduledFirestoreBackup = functions
    .runWith({
        timeoutSeconds: 540,
        memory: '2GB'
    })
    .pubsub
    .schedule('every day 02:00')
    .timeZone('Asia/Kolkata')
    .onRun(async (context) => {
        const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
        const databaseName = client.databasePath(projectId, '(default)');

        // Bucket name for backups
        const bucket = `gs://${projectId}-firestore-backups`;

        // Collections to backup
        const collectionsToBackup = [
            'patients',
            'visits',
            'dialysisSessions',
            'users',
            'staffMessages',
            'auditLogs'
        ];

        try {
            console.log('Starting Firestore backup...');
            console.log(`Database: ${databaseName}`);
            console.log(`Bucket: ${bucket}`);
            console.log(`Collections: ${collectionsToBackup.join(', ')}`);

            const [operation] = await client.exportDocuments({
                name: databaseName,
                outputUriPrefix: bucket,
                collectionIds: collectionsToBackup,
            });

            console.log(`Backup operation started: ${operation.name}`);

            // Log to Firestore for tracking
            await admin.firestore().collection('backupLogs').add({
                type: 'scheduled',
                status: 'started',
                operationName: operation.name,
                collections: collectionsToBackup,
                bucket: bucket,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });

            return {
                success: true,
                operation: operation.name,
                collections: collectionsToBackup.length
            };

        } catch (error) {
            console.error('Backup failed:', error);

            // Log failure
            await admin.firestore().collection('backupLogs').add({
                type: 'scheduled',
                status: 'failed',
                error: error instanceof Error ? error.message : String(error),
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });

            throw error;
        }
    });

/**
 * Manual Backup Trigger
 * Allows admins to trigger backup on-demand
 */
export const triggerManualBackup = functions.https.onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Check authorization (admin only)
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    const userRole = userDoc.data()?.role;

    if (userRole !== 'admin') {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Only admins can trigger manual backups'
        );
    }

    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const databaseName = client.databasePath(projectId, '(default)');
    const bucket = `gs://${projectId}-firestore-backups`;

    const collections = data.collections || [
        'patients',
        'visits',
        'dialysisSessions',
        'users'
    ];

    try {
        const [operation] = await client.exportDocuments({
            name: databaseName,
            outputUriPrefix: bucket,
            collectionIds: collections,
        });

        // Log manual backup
        await admin.firestore().collection('backupLogs').add({
            type: 'manual',
            status: 'started',
            operationName: operation.name,
            collections: collections,
            triggeredBy: context.auth.uid,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
            success: true,
            message: 'Backup started successfully',
            operation: operation.name
        };

    } catch (error) {
        console.error('Manual backup failed:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new functions.https.HttpsError('internal', errorMessage);
    }
});

/**
 * Restore Documentation Function
 * Provides instructions for restoring from backup
 */
export const getRestoreInstructions = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    if (userDoc.data()?.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }

    return {
        instructions: `
      To restore from a Firestore backup:
      
      1. List available backups:
         gcloud firestore operations list
      
      2. Find the backup you want to restore (look for EXPORT operations)
      
      3. Import the backup:
         gcloud firestore import gs://[BUCKET_NAME]/[BACKUP_FOLDER]
      
      IMPORTANT:
      - Restoring will overwrite existing data
      - Test restore in a separate project first
      - Always verify backup integrity before restoring
      
      For assistance, contact your system administrator.
    `,
        projectId: process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT,
        bucket: `${process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT}-firestore-backups`
    };
});

/**
 * Backup Status Check
 * Get recent backup logs
 */
export const getBackupStatus = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    if (userDoc.data()?.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }

    const limit = data.limit || 10;

    const backupLogs = await admin.firestore()
        .collection('backupLogs')
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

    return {
        backups: backupLogs.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
    };
});
