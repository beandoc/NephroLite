/**
 * Data transformation utilities for importing patient data from old Firebase format
 * Maps fields from patient_import.json to current NephroLite schema
 */

import type { Patient } from './types';

/**
 * Parse full name into first and last name
 */
export function parsePatientName(fullName: string): { firstName: string; lastName: string } {
    const trimmed = fullName.trim();
    const parts = trimmed.split(/\s+/);

    if (parts.length === 0) {
        return { firstName: '', lastName: '' };
    }

    if (parts.length === 1) {
        return { firstName: parts[0], lastName: '' };
    }

    // Last word is the last name, everything else is first name
    const lastName = parts[parts.length - 1];
    const firstName = parts.slice(0, -1).join(' ');

    return { firstName, lastName };
}

/**
 * Convert age to approximate date of birth
 * Using current date as reference
 */
export function ageToDateOfBirth(age: string | number, referenceDate: Date = new Date()): string {
    const ageNum = typeof age === 'string' ? parseInt(age, 10) : age;

    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
        // Invalid age, return a default
        return new Date(1970, 0, 1).toISOString().split('T')[0];
    }

    const birthYear = referenceDate.getFullYear() - ageNum;
    // Use middle of year as approximation
    return `${birthYear}-06-15`;
}

/**
 * Parse blood pressure string into systolic and diastolic
 */
export function parseBloodPressure(bp: string): { systolicBP: string; diastolicBP: string } {
    const parts = bp.split('/');

    return {
        systolicBP: parts[0]?.trim() || '',
        diastolicBP: parts[1]?.trim() || ''
    };
}

/**
 * Strip HTML tags from content (basic implementation)
 * For rich text fields, keep HTML as-is
 */
export function stripHtmlTags(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Convert HTML to plain text for display
 */
export function htmlToPlainText(html: string): string {
    if (!html) return '';

    // Replace common HTML entities
    let text = html
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

    // Replace list items with bullets
    text = text.replace(/<li[^>]*>/gi, '\n• ');
    text = text.replace(/<\/li>/gi, '');

    // Replace paragraphs with line breaks
    text = text.replace(/<\/p>/gi, '\n');
    text = text.replace(/<p[^>]*>/gi, '');

    // Replace line breaks
    text = text.replace(/<br\s*\/?>/gi, '\n');

    // Remove all remaining HTML tags
    text = text.replace(/<[^>]*>/g, '');

    // Clean up multiple consecutive line breaks
    text = text.replace(/\n{3,}/g, '\n\n');

    return text.trim();
}

/**
 * Extract code or value from dropdown object
 */
export function extractDropdownValue(dropdown: { code?: string; value?: string } | string | undefined): string {
    if (!dropdown) return '';
    if (typeof dropdown === 'string') return dropdown;
    return dropdown.value || dropdown.code || '';
}

/**
 * Parse date string from various formats
 */
export function parseImportDate(dateStr: string | Date | undefined): string {
    if (!dateStr) return '';

    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            return '';
        }
        return date.toISOString();
    } catch {
        return '';
    }
}

/**
 * Investigation field mapping from import JSON to current schema
 */
export const INVESTIGATION_FIELD_MAP: Record<string, { name: string; group: string; unit?: string; normalRange?: string }> = {
    'hb': { name: 'Hemoglobin (Hb)', group: 'Hematological', unit: 'g/dL', normalRange: '13.5-17.5' },
    'tlc': { name: 'Total Leucocyte Count (TLC)', group: 'Hematological', unit: '/mm³', normalRange: '4000-11000' },
    'dlc': { name: 'Differential Leucocyte Count (DLC)', group: 'Hematological', unit: '%', normalRange: 'N:40-75,L:20-45' },
    'plt': { name: 'Platelet Count', group: 'Hematological', unit: 'lakh/mm³', normalRange: '1.5-4.5' },
    'esr': { name: 'Erythrocyte Sedimentation Rate (ESR)', group: 'Hematological', unit: 'mm/hr', normalRange: '0-20' },
    'pt': { name: 'Prothrombin Time (PT)', group: 'Hematological', unit: 'sec', normalRange: '11-13.5' },
    'inr': { name: 'INR', group: 'Hematological', unit: '', normalRange: '0.8-1.2' },

    'urea': { name: 'Blood Urea', group: 'Biochemistry', unit: 'mg/dL', normalRange: '15-45' },
    'creatinine': { name: 'Serum Creatinine', group: 'Biochemistry', unit: 'mg/dL', normalRange: '0.6-1.2' },
    'sodium': { name: 'Serum Sodium (Na+)', group: 'Biochemistry', unit: 'mEq/L', normalRange: '135-145' },
    'potassium': { name: 'Serum Potassium (K+)', group: 'Biochemistry', unit: 'mEq/L', normalRange: '3.5-5.1' },
    'calcium': { name: 'Serum Calcium', group: 'Biochemistry', unit: 'mg/dL', normalRange: '8.5-10.5' },
    'phosphate': { name: 'Serum Phosphate', group: 'Biochemistry', unit: 'mg/dL', normalRange: '2.5-4.5' },
    'uricAcid': { name: 'Serum Uric Acid', group: 'Biochemistry', unit: 'mg/dL', normalRange: '3.5-7.2' },
    'alp': { name: 'Alkaline Phosphatase (ALP)', group: 'Biochemistry', unit: 'IU/L', normalRange: '44-147' },
    'tp': { name: 'Total Protein', group: 'Biochemistry', unit: 'g/dL', normalRange: '6.0-8.3' },
    'albumin': { name: 'Serum Albumin', group: 'Biochemistry', unit: 'g/dL', normalRange: '3.5-5.5' },
    'bloodSugarFPi': { name: 'Fasting Blood Sugar (FBS)', group: 'Biochemistry', unit: 'mg/dL', normalRange: '70-100' },
    'bloodSugarR': { name: 'Random Blood Sugar', group: 'Biochemistry', unit: 'mg/dL', normalRange: '70-140' },
    'pBs': { name: 'Post Prandial Blood Sugar (PPBS)', group: 'Biochemistry', unit: 'mg/dL', normalRange: '<140' },
    'tChol': { name: 'Total Cholesterol', group: 'Biochemistry', unit: 'mg/dL', normalRange: '<200' },
    'hdl': { name: 'HDL Cholesterol', group: 'Biochemistry', unit: 'mg/dL', normalRange: '>40' },
    'ldl': { name: 'LDL Cholesterol', group: 'Biochemistry', unit: 'mg/dL', normalRange: '<100' },
    'tg': { name: 'Triglycerides (TG)', group: 'Biochemistry', unit: 'mg/dL', normalRange: '<150' },
    'totalBilirubin': { name: 'Total Bilirubin', group: 'Biochemistry', unit: 'mg/dL', normalRange: '0.3-1.2' },
    'directBilirubin': { name: 'Direct Bilirubin', group: 'Biochemistry', unit: 'mg/dL', normalRange: '0.0-0.3' },
    'ast': { name: 'AST (SGOT)', group: 'Biochemistry', unit: 'IU/L', normalRange: '5-40' },
    'alt': { name: 'ALT (SGPT)', group: 'Biochemistry', unit: 'IU/L', normalRange: '7-56' },
    'iPTh': { name: 'iPTH (Intact PTH)', group: 'Special Investigations', unit: 'pg/mL', normalRange: '15-65' },
    'vitaminD': { name: 'Vitamin D', group: 'Special Investigations', unit: 'ng/mL', normalRange: '30-100' },

    'hbsAg': { name: 'HBsAg', group: 'Serology' },
    'antiHcv': { name: 'Anti-HCV', group: 'Serology' },
    'hiv': { name: 'HIV I & II', group: 'Serology' },
    'ana': { name: 'ANA (Antinuclear Antibody)', group: 'Serology' },
    'dsDNA': { name: 'dsDNA', group: 'Serology', unit: 'IU/mL' },
    'serumCThree': { name: 'C3', group: 'Serology', unit: 'mg/dL', normalRange: '90-180' },
    'serumCFour': { name: 'C4', group: 'Serology', unit: 'mg/dL', normalRange: '10-40' },
    'cAnca': { name: 'c-ANCA', group: 'Serology' },
    'pAnca': { name: 'p-ANCA', group: 'Serology' },
    'widal': { name: 'WIDAL', group: 'Serology' },

    'urineREME': { name: 'Urine Routine & Microscopy (R/M)', group: 'Urine Analysis' },
    'urineCS': { name: 'Urine Culture & Sensitivity', group: 'Urine Analysis' },
    'twentyFourHrUrineProtein': { name: '24-hour Urine Protein', group: 'Urine Analysis', unit: 'mg/day', normalRange: '<150' },

    'usgAbdo': { name: 'USG KUB', group: 'Radiology' },
    'kidneyBiopsy': { name: 'Kidney Biopsy', group: 'Special Investigations' },
    'twoDEchoReport': { name: '2D Echocardiography', group: 'Special Investigations' },
    'dtpaGFR': { name: 'DTPA GFR', group: 'Special Investigations', unit: 'mL/min/1.73m²' },
    'ncctAbdomenKub': { name: 'CT KUB (NCCT)', group: 'Radiology' },
    'mriBrain': { name: 'MRI Brain', group: 'Radiology' },
};

/**
 * Map investigation test fields from import format to current schema
 */
export function mapInvestigationTests(testDetail: any, dateOfTest: string): {
    id: string;
    date: string;
    tests: Array<{
        id: string;
        group: string;
        name: string;
        result: string;
        unit?: string;
        normalRange?: string;
    }>;
    notes?: string;
} {
    const tests: any[] = [];

    for (const [field, testInfo] of Object.entries(INVESTIGATION_FIELD_MAP)) {
        const result = testDetail[field];
        if (result && result.toString().trim() !== '' && result !== 'NAD' && result !== '___') {
            // Handle dropdown values for some fields
            const resultValue = typeof result === 'object' && result.value
                ? result.value
                : result.toString();

            tests.push({
                id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                group: testInfo.group,
                name: testInfo.name,
                result: resultValue,
                unit: testInfo.unit,
                normalRange: testInfo.normalRange,
            });
        }
    }

    // Handle special fields that are text reports
    const notes: string[] = [];
    if (testDetail.chestXRay) {
        const cxrValue = extractDropdownValue(testDetail.chestXRay);
        if (cxrValue && cxrValue !== 'NAD') {
            notes.push(`CXR: ${cxrValue}`);
        }
    }
    if (testDetail.ecg) {
        const ecgValue = extractDropdownValue(testDetail.ecg);
        if (ecgValue && ecgValue !== 'NAD') {
            notes.push(`ECG: ${ecgValue}`);
        }
    }
    if (testDetail.others && testDetail.others !== 'Others : ') {
        notes.push(testDetail.others);
    }

    return {
        id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: parseImportDate(dateOfTest),
        tests,
        notes: notes.length > 0 ? notes.join('\n') : undefined,
    };
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate and sanitize patient data before import
 */
export function validateImportData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.patientInfo) {
        errors.push('Missing patient information');
        return { isValid: false, errors };
    }

    if (!data.patientInfo.patientName || data.patientInfo.patientName.trim() === '') {
        errors.push('Patient name is required');
    }

    if (!data.patientInfo.gender) {
        errors.push('Patient gender is required');
    }

    // Warnings for missing optional but important fields
    if (!data.patientInfo.patientAge && !data.patientInfo.dob) {
        errors.push('Warning: Missing patient age and date of birth');
    }

    return {
        isValid: errors.filter(e => !e.startsWith('Warning')).length === 0,
        errors
    };
}
