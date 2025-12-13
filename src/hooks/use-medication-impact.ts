import { useState, useEffect, useMemo } from 'react';
import { usePatientData } from './use-patient-data';
import type { Patient, Visit, InvestigationRecord } from '@/lib/types';
import { parseISO, differenceInDays } from 'date-fns';

export type PatientMedicationData = {
    patient: Patient;
    medicationStartDate: Date | null;
    eGFRBefore: number | null;
    eGFRAfter: number | null;
    albuminBefore: number | null;
    albuminAfter: number | null;
    changeInEGFR: number | null;
    changeInAlbumin: number | null;
};

export type TrendDataPoint = {
    date: Date;
    value: number;
    patientCount: number;
};

export type MedicationImpactData = {
    patients: PatientMedicationData[];
    eGFRTrend: TrendDataPoint[];
    albuminTrend: TrendDataPoint[];
    avgEGFRChange: number | null;
    avgAlbuminChange: number | null;
    isLoading: boolean;
};

// Helper to safely convert timestamps to dates
const toDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue;
    if (dateValue?.toDate && typeof dateValue.toDate === 'function') {
        return dateValue.toDate();
    }
    if (typeof dateValue === 'string') {
        return parseISO(dateValue);
    }
    return null;
};

// Helper to find medication start date from visits
const findMedicationStartDate = (visits: Visit[] | undefined, medicationName: string): Date | null => {
    if (!visits || visits.length === 0) return null;

    // Sort visits by date (oldest first)
    const sortedVisits = [...visits].sort((a, b) => {
        const dateA = toDate(a.date);
        const dateB = toDate(b.date);
        if (!dateA || !dateB) return 0;
        return dateA.getTime() - dateB.getTime();
    });

    // Find first visit where medication appears
    // Note: Medications in visits are stored in visit.clinicalData.medications, not diagnosis.medications
    for (const visit of sortedVisits) {
        // Check if there are medications in clinical data
        const medications = visit.clinicalData?.medications || [];
        const hasMedication = medications.some((med: any) =>
            med.name?.toLowerCase().includes(medicationName.toLowerCase())
        );
        if (hasMedication) {
            return toDate(visit.date);
        }
    }
    return null;
};

// Helper to find investigation value closest to a date
const findClosestInvestigation = (
    records: InvestigationRecord[] | undefined,
    testName: string,
    targetDate: Date | null,
    maxDaysDiff: number = 90
): number | null => {
    if (!records || records.length === 0 || !targetDate) return null;

    let closestValue: number | null = null;
    let minDaysDiff = Infinity;

    for (const record of records) {
        const recordDate = toDate(record.date);
        if (!recordDate) continue;

        const daysDiff = Math.abs(differenceInDays(recordDate, targetDate));
        if (daysDiff <= maxDaysDiff && daysDiff < minDaysDiff) {
            // Find the test in this record
            const test = record.tests?.find((t: any) =>
                t.name?.toLowerCase().includes(testName.toLowerCase())
            );
            if (test && test.result && !isNaN(parseFloat(test.result))) {
                closestValue = parseFloat(test.result);
                minDaysDiff = daysDiff;
            }
        }
    }

    return closestValue;
};

export function useMedicationImpact(
    patientGroup: string,
    medication: string
): MedicationImpactData {
    const { patients, isLoading: patientsLoading } = usePatientData();
    const [isLoading, setIsLoading] = useState(true);

    const analysisData = useMemo(() => {
        if (!patientGroup || !medication || patients.length === 0) {
            return {
                patients: [],
                eGFRTrend: [],
                albuminTrend: [],
                avgEGFRChange: null,
                avgAlbuminChange: null,
            };
        }

        // Filter patients by diagnosis
        const filteredPatients = patients.filter(p => {
            const diagnosis = (p as any).primaryDiagnosis || p.clinicalProfile?.primaryDiagnosis || '';
            return diagnosis.toLowerCase().includes(patientGroup.toLowerCase());
        });

        // Process each patient
        const patientData: PatientMedicationData[] = filteredPatients
            .map(patient => {
                // Find when medication was started
                const medStartDate = findMedicationStartDate(patient.visits, medication);
                if (!medStartDate) return null; // Patient not on this medication

                // Calculate baseline (before medication) - 3 months before start
                const beforeDate = new Date(medStartDate.getTime() - 90 * 24 * 60 * 60 * 1000);
                // Calculate follow-up (after medication) - 3 months after start
                const afterDate = new Date(medStartDate.getTime() + 90 * 24 * 60 * 60 * 1000);

                const eGFRBefore = findClosestInvestigation(patient.investigationRecords, 'eGFR', beforeDate);
                const eGFRAfter = findClosestInvestigation(patient.investigationRecords, 'eGFR', afterDate);

                const albuminBefore = findClosestInvestigation(
                    patient.investigationRecords,
                    'protein/creatinine',
                    beforeDate
                );
                const albuminAfter = findClosestInvestigation(
                    patient.investigationRecords,
                    'protein/creatinine',
                    afterDate
                );

                const changeInEGFR = (eGFRBefore !== null && eGFRAfter !== null)
                    ? eGFRAfter - eGFRBefore
                    : null;

                const changeInAlbumin = (albuminBefore !== null && albuminAfter !== null)
                    ? albuminAfter - albuminBefore
                    : null;

                return {
                    patient,
                    medicationStartDate: medStartDate,
                    eGFRBefore,
                    eGFRAfter,
                    albuminBefore,
                    albuminAfter,
                    changeInEGFR,
                    changeInAlbumin,
                };
            })
            .filter((data): data is NonNullable<typeof data> & { medicationStartDate: Date } =>
                data !== null && data.medicationStartDate !== null
            );

        // Calculate averages
        const validEGFRChanges = patientData
            .map(d => d.changeInEGFR)
            .filter((v): v is number => v !== null);
        const avgEGFRChange = validEGFRChanges.length > 0
            ? validEGFRChanges.reduce((sum, val) => sum + val, 0) / validEGFRChanges.length
            : null;

        const validAlbuminChanges = patientData
            .map(d => d.changeInAlbumin)
            .filter((v): v is number => v !== null);
        const avgAlbuminChange = validAlbuminChanges.length > 0
            ? validAlbuminChanges.reduce((sum, val) => sum + val, 0) / validAlbuminChanges.length
            : null;

        // Create trend data (simplified - grouping all patients together)
        const eGFRTrend: TrendDataPoint[] = [];
        const albuminTrend: TrendDataPoint[] = [];

        // Before medication (baseline)
        if (validEGFRChanges.length > 0) {
            const beforeValues = patientData
                .map(d => d.eGFRBefore)
                .filter((v): v is number => v !== null);
            if (beforeValues.length > 0) {
                eGFRTrend.push({
                    date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago (relative)
                    value: beforeValues.reduce((sum, v) => sum + v, 0) / beforeValues.length,
                    patientCount: beforeValues.length
                });
            }

            const afterValues = patientData
                .map(d => d.eGFRAfter)
                .filter((v): v is number => v !== null);
            if (afterValues.length > 0) {
                eGFRTrend.push({
                    date: new Date(), // Now (relative)
                    value: afterValues.reduce((sum, v) => sum + v, 0) / afterValues.length,
                    patientCount: afterValues.length
                });
            }
        }

        if (validAlbuminChanges.length > 0) {
            const beforeValues = patientData
                .map(d => d.albuminBefore)
                .filter((v): v is number => v !== null);
            if (beforeValues.length > 0) {
                albuminTrend.push({
                    date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                    value: beforeValues.reduce((sum, v) => sum + v, 0) / beforeValues.length,
                    patientCount: beforeValues.length
                });
            }

            const afterValues = patientData
                .map(d => d.albuminAfter)
                .filter((v): v is number => v !== null);
            if (afterValues.length > 0) {
                albuminTrend.push({
                    date: new Date(),
                    value: afterValues.reduce((sum, v) => sum + v, 0) / afterValues.length,
                    patientCount: afterValues.length
                });
            }
        }

        return {
            patients: patientData,
            eGFRTrend,
            albuminTrend,
            avgEGFRChange,
            avgAlbuminChange,
        };
    }, [patients, patientGroup, medication]);

    useEffect(() => {
        setIsLoading(patientsLoading);
    }, [patientsLoading]);

    return {
        ...analysisData,
        isLoading,
    };
}
