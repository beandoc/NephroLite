// Disability Assessment Calculator - Core Logic
// Based on CKD staging (eGFR) and Albuminuria categories

export type Sex = 'Male' | 'Female';
export type CkdStage = 'G1' | 'G2' | 'G3a' | 'G3b' | 'G4' | 'G5';
export type AlbuminuriaCategory = 'A1' | 'A2' | 'A3';

export interface DisabilityAssessmentInput {
    age: number;
    sex: Sex;
    serumCreatinine: number; // mg/dL
    albuminuria: number; // mg/g (UACR) or mg/mmol (converted)
    albuminuriaUnit?: 'mg/g' | 'mg/mmol';
    onRenalReplacementTherapy?: boolean; // Dialysis or Transplant
}

export interface DisabilityAssessmentResult {
    egfr: number;
    ckdStage: CkdStage;
    albuminuriaCategory: AlbuminuriaCategory;
    disabilityPercentage: number;
    ckdStageDescription: string;
    albuminuriaCategoryDescription: string;
    onRRT: boolean;
    recommendations: string;
}

/**
 * Calculate eGFR using CKD-EPI 2021 formula (race-free)
 * Formula source: https://www.kidney.org/professionals/kdoqi/gfr_calculator
 */
export function calculateEgfr(age: number, sex: Sex, creatinine: number): number {
    // CKD-EPI 2021 (race-free) formula
    // For Female: eGFR = 142 × min(Scr/0.7, 1)^(-0.241) × max(Scr/0.7, 1)^(-1.200) × 0.9938^age
    // For Male: eGFR = 142 × min(Scr/0.9, 1)^(-0.302) × max(Scr/0.9, 1)^(-1.200) × 0.9938^age

    const kappa = sex === 'Female' ? 0.7 : 0.9;
    const alpha = sex === 'Female' ? -0.241 : -0.302;

    const minTerm = Math.min(creatinine / kappa, 1);
    const maxTerm = Math.max(creatinine / kappa, 1);

    const egfr = 142 * Math.pow(minTerm, alpha) * Math.pow(maxTerm, -1.200) * Math.pow(0.9938, age);

    return Math.round(egfr * 100) / 100; // Round to 2 decimals
}

/**
 * Determine CKD stage from eGFR value
 */
export function getCkdStage(egfr: number): CkdStage {
    if (egfr >= 90) return 'G1';
    if (egfr >= 60) return 'G2';
    if (egfr >= 45) return 'G3a';
    if (egfr >= 30) return 'G3b';
    if (egfr >= 15) return 'G4';
    return 'G5';
}

/**
 * Get CKD stage description
 */
export function getCkdStageDescription(stage: CkdStage): string {
    const descriptions: Record<CkdStage, string> = {
        'G1': 'Normal or high (≥90 ml/min/1.73m²)',
        'G2': 'Mildly decreased (60-89 ml/min/1.73m²)',
        'G3a': 'Mildly to moderately decreased (45-59 ml/min/1.73m²)',
        'G3b': 'Moderately to severely decreased (30-44 ml/min/1.73m²)',
        'G4': 'Severely decreased (15-29 ml/min/1.73m²)',
        'G5': 'Kidney failure (<15 ml/min/1.73m²)'
    };
    return descriptions[stage];
}

/**
 * Determine albuminuria category from UACR/PCR value
 * @param albuminuria - Value in mg/g or mg/mmol
 * @param unit - Unit of measurement (default: mg/g)
 */
export function getAlbuminuriaCategory(
    albuminuria: number,
    unit: 'mg/g' | 'mg/mmol' = 'mg/g'
): AlbuminuriaCategory {
    // Convert mg/mmol to mg/g if needed (multiply by ~8.8 for approximate conversion)
    const valueInMgG = unit === 'mg/mmol' ? albuminuria * 8.8 : albuminuria;

    if (valueInMgG < 30) return 'A1';
    if (valueInMgG < 300) return 'A2';
    return 'A3';
}

/**
 * Get albuminuria category description
 */
export function getAlbuminuriaCategoryDescription(category: AlbuminuriaCategory): string {
    const descriptions: Record<AlbuminuriaCategory, string> = {
        'A1': 'Normal to mildly increased (<30 mg/g or <3 mg/mmol)',
        'A2': 'Moderately increased (30-299 mg/g or 3-29 mg/mmol)',
        'A3': 'Severely increased (≥300 mg/g or ≥30 mg/mmol)'
    };
    return descriptions[category];
}

/**
 * Get disability percentage from CKD stage and albuminuria category matrix
 * Based on disability assessment matrix for serving personnel
 */
export function getDisabilityPercentage(
    ckdStage: CkdStage,
    albuminuriaCategory: AlbuminuriaCategory,
    onRRT: boolean = false
): number {
    // Special rule: On Renal Replacement Therapy = 100%
    if (onRRT) return 100;

    // Disability matrix
    const matrix: Record<CkdStage, Record<AlbuminuriaCategory, number>> = {
        'G1': { 'A1': 15, 'A2': 40, 'A3': 60 },
        'G2': { 'A1': 15, 'A2': 40, 'A3': 60 },
        'G3a': { 'A1': 40, 'A2': 40, 'A3': 60 }, // Note: G3a with A1 shows 40% in matrix
        'G3b': { 'A1': 60, 'A2': 60, 'A3': 80 }, // Note: G3b with A1 shows 60%
        'G4': { 'A1': 80, 'A2': 80, 'A3': 100 },
        'G5': { 'A1': 100, 'A2': 100, 'A3': 100 }
    };

    return matrix[ckdStage][albuminuriaCategory];
}

/**
 * Generate recommendations based on assessment
 */
export function getRecommendations(
    ckdStage: CkdStage,
    albuminuriaCategory: AlbuminuriaCategory,
    disabilityPercentage: number,
    onRRT: boolean
): string {
    if (onRRT) {
        return 'Patient is on Renal Replacement Therapy (Dialysis/Transplant). Disability: 100% with Constant Attendance Allowance (CAA). Regular nephrology follow-up required.';
    }

    const recommendations: string[] = [];

    // Stage-specific recommendations
    if (ckdStage === 'G5' || ckdStage === 'G4') {
        recommendations.push('Consider referral for renal replacement therapy planning.');
        recommendations.push('Intensive nephrology follow-up required (monthly or more frequent).');
    } else if (ckdStage === 'G3b' || ckdStage === 'G3a') {
        recommendations.push('Regular nephrology follow-up recommended (every 3-6 months).');
        recommendations.push('Monitor for CKD progression and complications.');
    } else {
        recommendations.push('Annual nephrology review recommended.');
    }

    // Albuminuria-specific recommendations
    if (albuminuriaCategory === 'A3') {
        recommendations.push('Significant proteinuria present. Consider ACE inhibitor/ARB therapy if not contraindicated.');
        recommendations.push('Strict blood pressure control essential (target <130/80 mmHg).');
    } else if (albuminuriaCategory === 'A2') {
        recommendations.push('Moderate albuminuria present. Blood pressure optimization recommended.');
    }

    // Disability-specific recommendations
    if (disabilityPercentage >= 60) {
        recommendations.push(`High disability percentage (${disabilityPercentage}%). Consider medical board review for employment restrictions.`);
    } else if (disabilityPercentage >= 40) {
        recommendations.push(`Moderate disability (${disabilityPercentage}%). Regular monitoring and functional assessment recommended.`);
    }

    recommendations.push('Maintain CKD-appropriate diet (low sodium, appropriate protein restriction).');
    recommendations.push('Avoid nephrotoxic medications (NSAIDs, contrast agents) when possible.');

    return recommendations.join(' ');
}

/**
 * Complete disability assessment calculation
 */
export function calculateDisabilityAssessment(
    input: DisabilityAssessmentInput
): DisabilityAssessmentResult {
    const { age, sex, serumCreatinine, albuminuria, albuminuriaUnit = 'mg/g', onRenalReplacementTherapy = false } = input;

    // Calculate eGFR
    const egfr = calculateEgfr(age, sex, serumCreatinine);

    // Determine CKD stage
    const ckdStage = getCkdStage(egfr);

    // Determine albuminuria category
    const albuminuriaCategory = getAlbuminuriaCategory(albuminuria, albuminuriaUnit);

    // Get disability percentage
    const disabilityPercentage = getDisabilityPercentage(ckdStage, albuminuriaCategory, onRenalReplacementTherapy);

    // Get descriptions
    const ckdStageDescription = getCkdStageDescription(ckdStage);
    const albuminuriaCategoryDescription = getAlbuminuriaCategoryDescription(albuminuriaCategory);

    // Get recommendations
    const recommendations = getRecommendations(ckdStage, albuminuriaCategory, disabilityPercentage, onRenalReplacementTherapy);

    return {
        egfr,
        ckdStage,
        albuminuriaCategory,
        disabilityPercentage,
        ckdStageDescription,
        albuminuriaCategoryDescription,
        onRRT: onRenalReplacementTherapy,
        recommendations
    };
}
