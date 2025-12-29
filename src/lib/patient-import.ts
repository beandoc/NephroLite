/**
 * Patient data import from old Firebase format (patient_import.json)
 * Converts and validates patient data for NephroLite system
 */

import type { Patient, Visit, InvestigationRecord, Medication, Diagnosis } from './types';
import {
    parsePatientName,
    ageToDateOfBirth,
    parseBloodPressure,
    extractDropdownValue,
    parseImportDate,
    mapInvestigationTests,
    generateId,
    validateImportData,
} from './patient-import-transform';

interface ImportPatientData {
    patientInfo: {
        patientName: string;
        patientAge?: string;
        gender: { code: string; value: string };
        referenceNumber?: string;
        relationToFauzi?: { code: string; value: string };
        visitNumber?: number;
    };
    patientReferenceNumber?: number;
    patientTotalVisitNumber?: string;
    patientVisitDetails?: Array<{
        patientDiseaseDetails?: {
            pastMedicalClassification?: { code: string; value: string };
            patientPrimaryDiseaseList?: Array<{
                primaryDisease?: { code: string; value: string };
                disabilityProfile?: { code: string; value: string };
                locationOfOnset?: string;
                dateOfDetection?: string;
                dateOfDetectionStringFormat?: string;
                primaryDiseaseReportDisplayName?: string;
            }>;
            secondaryDisabilityPlainText?: string;
        };
        patientHistoryExamination?: {
            examinationsSummaryHistory?: string;
            examinationsExamination?: string;
            height?: string;
            weight?: string;
            bmi?: string;
            idealWeight?: string;
            pulse?: string;
            bloodPressure?: string;
        };
        patientOpinion?: {
            patientOpinion?: string;
            patientTreatmentAdvised?: string;
            patientRecommendations?: string;
        };
        patientDischarge?: {
            diagnosis?: string;
            secondaryDiagnosis?: string;
            historySummary?: string;
            patientInstruction?: {
                patientRemark?: string;
            };
        };
        patientTestInfo?: Array<{
            dateOfTest?: string;
            testDetail?: any;
            testName?: string;
            testComment?: string;
            reportStatus?: string;
        }>;
    }>;
}

/**
 * Import a single patient from the old Firebase format
 */
export function importPatientFromJSON(importData: ImportPatientData): Omit<Patient, 'id' | 'nephroId' | 'createdAt' | 'registrationDate'> {
    // Validate input
    const validation = validateImportData(importData);
    if (!validation.isValid) {
        throw new Error(`Invalid patient data: ${validation.errors.join(', ')}`);
    }

    const { patientInfo, patientVisitDetails = [] } = importData;

    // Parse patient name
    const { firstName, lastName } = parsePatientName(patientInfo.patientName);

    // Extract gender
    const gender = extractDropdownValue(patientInfo.gender) as 'Male' | 'Female';

    // Calculate DOB from age
    const dob = patientInfo.patientAge
        ? ageToDateOfBirth(patientInfo.patientAge)
        : new Date(1970, 0, 1).toISOString().split('T')[0];

    // Get relationship
    const relationshipToServiceMember = extractDropdownValue(patientInfo.relationToFauzi);

    // Initialize patient object
    const patient: Omit<Patient, 'id' | 'nephroId' | 'createdAt' | 'registrationDate'> = {
        firstName,
        lastName,
        dob,
        gender,
        phoneNumber: '',
        email: '',
        address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
        },
        guardian: {
            name: '',
            relation: '',
            contact: '',
        },
        clinicalProfile: {
            vaccinations: [],
        },
        patientStatus: 'OPD',
        isTracked: true,
        visits: [],
        investigationRecords: [],
        interventions: [],
        dialysisSessions: [],
        referenceNumber: patientInfo.referenceNumber,
        relationshipToServiceMember,
    };

    // Process visits
    const visits: Visit[] = [];
    const investigationRecords: InvestigationRecord[] = [];

    // Check if patient is military personnel (SELF) or dependent
    const isMilitaryPersonnel = relationshipToServiceMember?.toUpperCase() === 'SELF';

    patientVisitDetails.forEach((visitData, index) => {
        const visitId = `visit_${generateId()}`;
        const visitDate = new Date().toISOString(); // Use current date as we don't have visit date in source

        // Extract disease/disability details
        const diseaseDetails = visitData.patientDiseaseDetails;
        if (diseaseDetails) {
            // Update clinical profile with disability info (from first visit)
            // BUSINESS RULE: Only populate military-specific fields for SELF (military personnel), not dependents
            if (index === 0 && isMilitaryPersonnel) {
                patient.clinicalProfile.pastMedicalClassification = extractDropdownValue(
                    diseaseDetails.pastMedicalClassification
                );

                // Import ALL disability entries from the array
                const disabilityEntries = diseaseDetails.patientPrimaryDiseaseList?.map(entry => ({
                    id: crypto.randomUUID(),
                    primaryDisability: extractDropdownValue(entry.primaryDisease),
                    locationOfOnset: entry.locationOfOnset || '',
                    dateOfOnset: parseImportDate(entry.dateOfDetection) || '',
                })) || [];

                // Store array of disability entries
                patient.clinicalProfile.disabilityEntries = disabilityEntries;

                // For backward compatibility, also store the first entry in the old fields
                const primaryDiseaseEntry = diseaseDetails.patientPrimaryDiseaseList?.[0];
                if (primaryDiseaseEntry) {
                    patient.clinicalProfile.primaryDisability = extractDropdownValue(
                        primaryDiseaseEntry.primaryDisease
                    );
                    patient.clinicalProfile.disabilityProfile = extractDropdownValue(
                        primaryDiseaseEntry.disabilityProfile
                    );
                    patient.clinicalProfile.disabilityLocationOfOnset = primaryDiseaseEntry.locationOfOnset;
                    patient.clinicalProfile.disabilityDateOfOnset = parseImportDate(
                        primaryDiseaseEntry.dateOfDetection
                    );
                    patient.clinicalProfile.pdDispositionValue =
                        primaryDiseaseEntry.primaryDiseaseReportDisplayName;
                }

                patient.clinicalProfile.secondaryDisability = diseaseDetails.secondaryDisabilityPlainText;
            }
        }

        // Extract history and examination
        const historyExam = visitData.patientHistoryExamination;
        const opinion = visitData.patientOpinion;
        const discharge = visitData.patientDischarge;

        // Parse diagnoses
        const diagnoses: Diagnosis[] = [];

        // Add primary diagnosis
        if (discharge?.diagnosis && discharge.diagnosis.trim()) {
            diagnoses.push({
                id: `dx_${generateId()}`,
                name: discharge.diagnosis.replace(/<[^>]*>/g, '').trim(),
            });
        }

        // Add secondary diagnosis as second diagnosis in array
        if (discharge?.secondaryDiagnosis && discharge.secondaryDiagnosis.trim()) {
            diagnoses.push({
                id: `dx_${generateId()}`,
                name: discharge.secondaryDiagnosis.replace(/<[^>]*>/g, '').trim(),
            });
        }

        // Parse medications (would need to extract from treatment advised text)
        const medications: Medication[] = [];

        // Parse blood pressure
        let systolicBP = '';
        let diastolicBP = '';
        if (historyExam?.bloodPressure) {
            const bp = parseBloodPressure(historyExam.bloodPressure);
            systolicBP = bp.systolicBP;
            diastolicBP = bp.diastolicBP;
        }

        // Create visit object
        const visit: Visit = {
            id: visitId,
            date: visitDate,
            createdAt: visitDate,
            visitType: 'Routine',
            visitRemark: 'Imported from old system',
            groupName: 'Misc',
            patientGender: gender,
            diagnoses,
            clinicalData: {
                diagnoses, // Array now contains both primary and secondary diagnoses
                history: historyExam?.examinationsSummaryHistory || discharge?.historySummary,
                height: historyExam?.height,
                weight: historyExam?.weight,
                bmi: historyExam?.bmi,
                idealBodyWeight: historyExam?.idealWeight,
                pulse: historyExam?.pulse,
                systolicBP,
                diastolicBP,
                generalExamination: historyExam?.examinationsExamination,
                systemicExamination: historyExam?.examinationsExamination, // Could split this
                medications,
                // BUSINESS RULE: Opinion and Recommendations only for military personnel (SELF)
                opinionText: isMilitaryPersonnel ? opinion?.patientOpinion : undefined,
                treatmentAdvised: opinion?.patientTreatmentAdvised, // Treatment applies to all
                recommendations: isMilitaryPersonnel ? opinion?.patientRecommendations : undefined,
                dischargeInstructions: discharge?.patientInstruction?.patientRemark,
            },
            patientId: '', // Will be set when saving
        };

        visits.push(visit);

        // Process investigations for this visit
        if (visitData.patientTestInfo && visitData.patientTestInfo.length > 0) {
            visitData.patientTestInfo.forEach((testInfo) => {
                if (testInfo.testDetail) {
                    const invRecord = mapInvestigationTests(
                        testInfo.testDetail,
                        testInfo.dateOfTest || visitDate
                    );

                    // Only add if there are actual tests
                    if (invRecord.tests.length > 0) {
                        investigationRecords.push(invRecord);
                    }
                }
            });
        }
    });

    patient.visits = visits;
    patient.investigationRecords = investigationRecords;

    return patient;
}

/**
 * Import multiple patients from the JSON file
 */
export function importPatientsFromJSON(jsonData: {
    patientForm?: Record<string, ImportPatientData>;
    patientForm0123?: Record<string, ImportPatientData>;
    // ... other variations
}): Array<Omit<Patient, 'id' | 'nephroId' | 'createdAt' | 'registrationDate'>> {
    const patients: Array<Omit<Patient, 'id' | 'nephroId' | 'createdAt' | 'registrationDate'>> = [];
    const errors: Array<{ patientKey: string; error: string }> = [];

    // Find all patient form keys
    const patientFormKeys = Object.keys(jsonData).filter(key => key.startsWith('patientForm'));

    for (const formKey of patientFormKeys) {
        const patientForm = jsonData[formKey as keyof typeof jsonData] as Record<string, ImportPatientData>;

        if (!patientForm || typeof patientForm !== 'object') {
            continue;
        }

        // Each form contains multiple patients keyed by Firebase ID
        for (const [patientKey, patientData] of Object.entries(patientForm)) {
            try {
                const patient = importPatientFromJSON(patientData);
                patients.push(patient);
            } catch (error) {
                errors.push({
                    patientKey,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                console.error(`Error importing patient ${patientKey}:`, error);
            }
        }
    }

    console.log(`Successfully imported ${patients.length} patients`);
    if (errors.length > 0) {
        console.warn(`Failed to import ${errors.length} patients:`, errors);
    }

    return patients;
}

/**
 * Preview import data without actually importing
 */
export function previewImportData(importData: ImportPatientData): {
    patientName: string;
    age: string;
    gender: string;
    visitCount: number;
    investigationCount: number;
    hasOpinion: boolean;
    hasDischarge: boolean;
} {
    const { patientInfo, patientVisitDetails = [] } = importData;

    let investigationCount = 0;
    let hasOpinion = false;
    let hasDischarge = false;

    patientVisitDetails.forEach((visit) => {
        if (visit.patientTestInfo) {
            investigationCount += visit.patientTestInfo.length;
        }
        if (visit.patientOpinion?.patientOpinion) {
            hasOpinion = true;
        }
        if (visit.patientDischarge?.diagnosis) {
            hasDischarge = true;
        }
    });

    return {
        patientName: patientInfo.patientName,
        age: patientInfo.patientAge || 'Unknown',
        gender: extractDropdownValue(patientInfo.gender),
        visitCount: patientVisitDetails.length,
        investigationCount,
        hasOpinion,
        hasDischarge,
    };
}
