/**
 * @fileoverview Utility for calculating the PREVENT cardiovascular risk score.
 * This is a simplified implementation based on the user-provided logic and coefficients.
 * It does not include all interaction terms found in the full AHA model.
 */

export interface PreventInput {
    age: number; // years
    sex: 'Male' | 'Female';
    totalCholesterol: number; // mg/dL
    hdlCholesterol: number; // mg/dL
    systolicBP: number; // mmHg
    isSmoker: boolean;
    hasDiabetes: boolean;
    onAntiHypertensiveMedication: boolean;
    onStatinMedication: boolean;
    egfr: number; // mL/min/1.73m^2
    bmi: number; // kg/m^2
}

interface PreventOutput {
    tenYearRisk: number;
    thirtyYearRisk: number;
}

// These are example coefficients and means based on the user's provided logic.
// In a real-world scenario, these MUST be replaced with the official values from the AHA publication.
const COEFFS = {
    age: 0.7099,
    nonHdlC: 0.2921,
    sbpTreated: 0.1508,
    sbpUntreated: 0.1508, // Simplified, assume same for now
    diabetes: 0.7189,
    smoking: 0.3957,
    bmi: 0.2, // Simplified, using the user's example transformation logic
    egfr: 0.3, // Simplified, using the user's example transformation logic
    statin: 0.1, // Placeholder
    hypertensiveMeds: 0.1, // Placeholder
};

const MEANS = {
    age: 5.54,
    nonHdlC: 3.49,
    sbpTreated: 0.73,
    sbpUntreated: 0.73, // Simplified
    diabetes: 0.17,
    smoking: 0.44,
    bmi: 0, // Simplified
    egfr: 0, // Simplified
    statin: 0, // Placeholder
    hypertensiveMeds: 0, // Placeholder
};

const MG_DL_TO_MMOL_L = 1 / 38.67;

export function calculatePreventRisk(input: PreventInput): PreventOutput {
    // Step 1: Transform Raw Data into Model Variables
    const age_t = input.age / 10;
    const nonHdlC_t = (input.totalCholesterol - input.hdlCholesterol) * MG_DL_TO_MMOL_L;
    
    let sbp_t = 0;
    if(input.systolicBP >= 110) {
        sbp_t = (input.systolicBP - 110) / 20;
    }
    
    let bmi_t = 0;
    if(input.bmi >= 30) {
        bmi_t = (input.bmi - 30) / 5;
    }

    let egfr_t = 0;
    if(input.egfr < 60) {
        egfr_t = (input.egfr - 60) / -15;
    }
    
    const diabetes_t = input.hasDiabetes ? 1 : 0;
    const smoker_t = input.isSmoker ? 1 : 0;
    const hypertensiveMeds_t = input.onAntiHypertensiveMedication ? 1 : 0;
    const statin_t = input.onStatinMedication ? 1 : 0;

    // Step 2: Calculate the Linear Predictor (Risk Sum)
    let linearPredictor = 0;
    linearPredictor += COEFFS.age * (age_t - MEANS.age);
    linearPredictor += COEFFS.nonHdlC * (nonHdlC_t - MEANS.nonHdlC);
    
    if (hypertensiveMeds_t === 1) {
        linearPredictor += COEFFS.sbpTreated * (sbp_t - MEANS.sbpTreated);
    } else {
        linearPredictor += COEFFS.sbpUntreated * (sbp_t - MEANS.sbpUntreated);
    }
    
    linearPredictor += COEFFS.diabetes * (diabetes_t - MEANS.diabetes);
    linearPredictor += COEFFS.smoking * (smoker_t - MEANS.smoking);
    linearPredictor += COEFFS.bmi * (bmi_t - MEANS.bmi);
    linearPredictor += COEFFS.egfr * (egfr_t - MEANS.egfr);
    // Note: Statin and other interaction terms are simplified/omitted here

    // Step 3: Calculate the Final Risk
    // Baseline survival rates (S0) are specific to outcome (ASCVD, HF, CVD) and sex.
    // The user provided S0(10) = 0.9634 for 10-year ASCVD risk for males. We'll use this as an example.
    const baselineSurvival10Year = input.sex === 'Male' ? 0.9634 : 0.98; // Placeholder for female
    const baselineSurvival30Year = input.sex === 'Male' ? 0.85 : 0.92; // Placeholder

    const tenYearRisk = 100 * (1 - Math.pow(baselineSurvival10Year, Math.exp(linearPredictor)));
    
    let thirtyYearRisk = 0;
    if (input.age < 60) {
       thirtyYearRisk = 100 * (1 - Math.pow(baselineSurvival30Year, Math.exp(linearPredictor)));
    }


    return {
        tenYearRisk: Math.max(0, Math.min(100, tenYearRisk)), // Clamp between 0 and 100
        thirtyYearRisk: Math.max(0, Math.min(100, thirtyYearRisk)),
    };
}
