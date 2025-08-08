
/**
 * @fileoverview Utility for calculating the Kidney Failure Risk Equation (KFRE).
 * Based on the 8-variable model from Tangri et al., JAMA 2016.
 * This implementation uses the coefficients for the North American cohort.
 */

interface KFRE_Input {
  age: number; // in years
  sex: 'Male' | 'Female';
  egfr: number; // in mL/min/1.73m^2
  uacr: number; // Urine Albumin-to-Creatinine Ratio in mg/g
  calcium?: number; // Serum Calcium in mg/dL
  phosphate?: number; // Serum Phosphate in mg/dL
  albumin?: number; // Serum Albumin in g/dL
  bicarbonate?: number; // Serum Bicarbonate in mEq/L
}

interface KFRE_Output {
  twoYear: number | null;
  fiveYear: number | null;
}

// Coefficients from Tangri et al., JAMA 2016, Table 3 (North American validation cohort)
const COEFFS_8_VAR = {
  age: -0.2301,      // per 10 years
  sex_female: -0.1899, // reference: male
  egfr: -0.5364,      // per 5 mL/min/1.73m^2
  uacr_log: 0.4633,   // per log-unit
  calcium: -0.1031,   // per 0.4 mg/dL (1 mg/dL)
  phosphate: 0.2882, // per 0.5 mg/dL (1 mg/dL)
  albumin: -0.3204,   // per 0.4 g/dL (1 g/dL)
  bicarbonate: -0.1251, // per 4 mEq/L (1 mEq/L)
};

const SUM_OF_COEFFS_TIMES_MEAN_8_VAR = 3.3644;

/**
 * Calculates the 2-year and 5-year risk of kidney failure requiring dialysis or transplant.
 * This implementation uses the 8-variable model. Optional parameters can be added for more accuracy.
 * @param {KFRE_Input} input - The patient's clinical data.
 * @returns {KFRE_Output} The 2-year and 5-year risk percentages, or null if inputs are invalid.
 */
export function calculateKfre(input: KFRE_Input): KFRE_Output {
  const {
    age,
    sex,
    egfr,
    uacr,
    calcium,
    phosphate,
    albumin,
    bicarbonate,
  } = input;

  if (egfr >= 60 || !age || !egfr || !uacr) {
    return { twoYear: null, fiveYear: null };
  }

  // Calculate the linear predictor (Σβixi)
  let linearPredictor = 0;
  linearPredictor += COEFFS_8_VAR.age * (age / 10);
  linearPredictor += sex === 'Female' ? COEFFS_8_VAR.sex_female : 0;
  linearPredictor += COEFFS_8_VAR.egfr * (egfr / 5);
  linearPredictor += COEFFS_8_VAR.uacr_log * Math.log(uacr);

  // Add optional variables if they are provided
  if (calcium) linearPredictor += COEFFS_8_VAR.calcium * calcium;
  if (phosphate) linearPredictor += COEFFS_8_VAR.phosphate * phosphate;
  if (albumin) linearPredictor += COEFFS_8_VAR.albumin * albumin;
  if (bicarbonate) linearPredictor += COEFFS_8_VAR.bicarbonate * bicarbonate;
  
  // The full formula for the linear predictor sum is Σβi(xi - x̄i), which expands to Σβixi - Σβix̄i
  // The paper provides Σβix̄i as a single value (SUM_OF_COEFFS_TIMES_MEAN)
  const predictorSum = linearPredictor - SUM_OF_COEFFS_TIMES_MEAN_8_VAR;

  // Calculate risk using the formula: Risk = 1 - S(t)^exp(predictorSum)
  // Where S(t) is the baseline survival probability at time t.
  
  // Baseline survival from the paper for North American cohort
  const BASELINE_SURVIVAL_2_YEAR = 0.9835;
  const BASELINE_SURVIVAL_5_YEAR = 0.9525;
  
  const twoYearRisk = 100 * (1 - Math.pow(BASELINE_SURVIVAL_2_YEAR, Math.exp(predictorSum)));
  const fiveYearRisk = 100 * (1 - Math.pow(BASELINE_SURVIVAL_5_YEAR, Math.exp(predictorSum)));

  return {
    twoYear: twoYearRisk,
    fiveYear: fiveYearRisk,
  };
}
