'use server';

/**
 * @fileOverview AI agent for checking drug interactions and renal dosing
 * 
 * Analyzes medication combinations for:
 * - Drug-drug interactions
 * - Allergy contraindications  
 * - Renal dose adjustments (critical for nephrology)
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CheckDrugInteractionsInputSchema = z.object({
    medications: z.array(z.object({
        name: z.string().describe('Medication name'),
        dosage: z.string().optional().describe('Dosage and frequency'),
        route: z.string().optional().describe('Route of administration'),
    })).describe('List of current medications'),
    patientAllergies: z.array(z.string()).optional().describe('Known drug allergies'),
    egfr: z.number().optional().describe('Patient eGFR in mL/min/1.73m²'),
    age: z.number().optional().describe('Patient age in years'),
});

export type CheckDrugInteractionsInput = z.infer<typeof CheckDrugInteractionsInputSchema>;

const CheckDrugInteractionsOutputSchema = z.object({
    hasInteractions: z.boolean().describe('Whether any interactions were found'),
    overallRisk: z.enum(['None', 'Minor', 'Moderate', 'Severe']).describe('Highest risk level found'),
    interactions: z.array(z.object({
        drug1: z.string(),
        drug2: z.string(),
        severity: z.enum(['Minor', 'Moderate', 'Severe']),
        description: z.string().describe('Clinical description of the interaction'),
        mechanism: z.string().optional().describe('How the drugs interact'),
        recommendation: z.string().describe('Clinical recommendation'),
    })).describe('List of drug-drug interactions'),
    allergyWarnings: z.array(z.object({
        medication: z.string(),
        allergen: z.string(),
        severity: z.enum(['Mild', 'Moderate', 'Severe']),
        recommendation: z.string(),
    })).optional().describe('Allergy-related warnings'),
    renalAdjustments: z.array(z.object({
        medication: z.string(),
        currentDose: z.string().optional(),
        recommendedAction: z.string().describe('Dose adjustment or avoidance recommendation'),
        egfrThreshold: z.string().optional().describe('eGFR level triggering adjustment'),
        rationale: z.string().describe('Why adjustment is needed'),
    })).optional().describe('Renal dose adjustments needed'),
    summary: z.string().describe('Brief clinical summary of findings'),
});

export type CheckDrugInteractionsOutput = z.infer<typeof CheckDrugInteractionsOutputSchema>;

export async function checkDrugInteractions(
    input: CheckDrugInteractionsInput
): Promise<CheckDrugInteractionsOutput> {
    return checkDrugInteractionsFlow(input);
}

const prompt = ai.definePrompt({
    name: 'checkDrugInteractionsPrompt',
    input: { schema: CheckDrugInteractionsInputSchema },
    output: { schema: CheckDrugInteractionsOutputSchema },
    prompt: `You are a clinical pharmacology expert specializing in nephrology and internal medicine.

Analyze the following medications for potential interactions and safety concerns:

**Medications:**
{{jsonStringify medications}}

{{#if patientAllergies}}
**Known Allergies:** {{jsonStringify patientAllergies}}
{{/if}}

{{#if egfr}}
**Patient eGFR:** {{egfr}} mL/min/1.73m²
{{/if}}

{{#if age}}
**Patient Age:** {{age}} years
{{/if}}

Provide a comprehensive analysis including:

1. **Drug-Drug Interactions:**
   - Identify all clinically significant interactions
   - Categorize severity (Minor, Moderate, Severe)
   - Explain the mechanism and clinical significance
   - Provide clear recommendations

2. **Allergy Contraindications:**
   - Check each medication against known allergies
   - Consider cross-reactivity (e.g., penicillin allergies)

3. **Renal Dose Adjustments:**
   - For patients with eGFR < 60: identify medications requiring dose adjustment
   - Specify which medications to avoid entirely
   - Provide specific dosing recommendations based on kidney function
   - Pay special attention to nephrotoxic drugs

Focus on clinically significant interactions. Be specific and actionable in your recommendations.

Return a structured analysis suitable for clinical decision support.`,
});

const checkDrugInteractionsFlow = ai.defineFlow(
    {
        name: 'checkDrugInteractionsFlow',
        inputSchema: CheckDrugInteractionsInputSchema,
        outputSchema: CheckDrugInteractionsOutputSchema,
    },
    async input => {
        const { output } = await prompt(input);
        return output!;
    }
);
