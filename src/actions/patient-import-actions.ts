'use server';

/**
 * Server actions for patient data import
 */

import { importPatientFromJSON, importPatientsFromJSON, previewImportData } from '@/lib/patient-import';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import type { Patient } from '@/lib/types';

/**
 * Import a single patient from JSON data
 */
export async function importSinglePatientAction(jsonString: string) {
    try {
        const jsonData = JSON.parse(jsonString);

        // Import and transform the patient data
        const patientData = importPatientFromJSON(jsonData);

        // Generate nephroId
        const nephroId = `NEPH-${Date.now()}`;

        // Add timestamps and ID
        const now = new Date().toISOString();
        const completePatient: Omit<Patient, 'id'> = {
            ...patientData,
            nephroId,
            createdAt: now,
            registrationDate: now,
        };

        // Save to Firestore
        const docRef = await addDoc(collection(db, 'patients'), {
            ...completePatient,
            createdAt: Timestamp.fromDate(new Date(now)),
            registrationDate: Timestamp.fromDate(new Date(now)),
        });

        return {
            success: true,
            patientId: docRef.id,
            nephroId,
            message: `Patient imported successfully: ${patientData.firstName} ${patientData.lastName}`,
        };
    } catch (error) {
        console.error('Error importing patient:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

/**
 * Import multiple patients from the full JSON file
 */
export async function importBatchPatientsAction(jsonString: string) {
    try {
        const jsonData = JSON.parse(jsonString);

        // Import all patients
        const patientsData = importPatientsFromJSON(jsonData);

        const results = {
            total: patientsData.length,
            successful: 0,
            failed: 0,
            errors: [] as string[],
        };

        // Import each patient
        for (const patientData of patientsData) {
            try {
                const nephroId = `NEPH-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                const now = new Date().toISOString();

                const completePatient: Omit<Patient, 'id'> = {
                    ...patientData,
                    nephroId,
                    createdAt: now,
                    registrationDate: now,
                };

                await addDoc(collection(db, 'patients'), {
                    ...completePatient,
                    createdAt: Timestamp.fromDate(new Date(now)),
                    registrationDate: Timestamp.fromDate(new Date(now)),
                });

                results.successful++;
            } catch (error) {
                results.failed++;
                results.errors.push(
                    `${patientData.firstName} ${patientData.lastName}: ${error instanceof Error ? error.message : 'Unknown error'
                    }`
                );
            }
        }

        return {
            success: true,
            results,
            message: `Import complete: ${results.successful} successful, ${results.failed} failed`,
        };
    } catch (error) {
        console.error('Error in batch import:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

/**
 * Preview import data without saving
 */
export async function previewImportAction(jsonString: string) {
    try {
        const jsonData = JSON.parse(jsonString);
        const preview = previewImportData(jsonData);

        return {
            success: true,
            preview,
        };
    } catch (error) {
        console.error('Error previewing import:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

/**
 * Validate JSON format before import
 */
export async function validateImportJSONAction(jsonString: string) {
    try {
        const jsonData = JSON.parse(jsonString);

        // Check if it has the expected structure
        const hasPatientForm = Object.keys(jsonData).some(key => key.startsWith('patientForm'));

        if (!hasPatientForm) {
            return {
                success: false,
                error: 'Invalid format: Expected patient_import.json format with patientForm keys',
            };
        }

        return {
            success: true,
            message: 'JSON format is valid',
            patientFormKeys: Object.keys(jsonData).filter(key => key.startsWith('patientForm')),
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Invalid JSON',
        };
    }
}
