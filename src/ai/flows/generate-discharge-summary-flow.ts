
'use server';
/**
 * @fileOverview An AI agent that generates a patient discharge summary.
 *
 * - generateDischargeSummary - A function that handles the discharge summary generation.
 * - GenerateDischargeSummaryInput - The input type for the generateDischargeSummary function.
 * - GenerateDischargeSummaryOutput - The return type for the generateDischargeSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDischargeSummaryInputSchema = z.object({
  patientName: z.string().describe("The full name of the patient."),
  admissionDate: z.string().describe("The date of admission (e.g., YYYY-MM-DD)."),
  dischargeDate: z.string().describe("The date of discharge (e.g., YYYY-MM-DD)."),
  primaryDiagnosis: z.string().describe("The primary diagnosis at the time of discharge."),
  treatmentSummary: z.string().describe("A summary of the treatment provided during the hospital stay, including key procedures and medications administered."),
  conditionAtDischarge: z.string().describe("The patient's condition at the time of discharge (e.g., stable, improved)."),
  followUpInstructions: z.string().describe("Instructions for follow-up care, including appointments, medications, and lifestyle recommendations."),
  doctorName: z.string().describe("The full name of the discharging doctor."),
  hospitalName: z.string().optional().describe("The name of the hospital or clinic."),
  patientServiceNumber: z.string().optional().describe("Patient's service number, if applicable."),
  patientRank: z.string().optional().describe("Patient's rank, if applicable."),
});
export type GenerateDischargeSummaryInput = z.infer<typeof GenerateDischargeSummaryInputSchema>;

const GenerateDischargeSummaryOutputSchema = z.object({
  dischargeSummaryText: z.string().describe('The generated text of the patient discharge summary.'),
});
export type GenerateDischargeSummaryOutput = z.infer<typeof GenerateDischargeSummaryOutputSchema>;

export async function generateDischargeSummary(input: GenerateDischargeSummaryInput): Promise<GenerateDischargeSummaryOutput> {
  return generateDischargeSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDischargeSummaryPrompt',
  input: {schema: GenerateDischargeSummaryInputSchema},
  output: {schema: GenerateDischargeSummaryOutputSchema},
  prompt: `You are a medical assistant tasked with generating a comprehensive patient discharge summary.

{{#if hospitalName}}Hospital/Clinic: {{{hospitalName}}}{{/if}}

Patient Name: {{{patientName}}}
{{#if patientServiceNumber}}Service Number: {{{patientServiceNumber}}}{{/if}}
{{#if patientRank}}Rank: {{{patientRank}}}{{/if}}
Admission Date: {{{admissionDate}}}
Discharge Date: {{{dischargeDate}}}

Primary Diagnosis: {{{primaryDiagnosis}}}

Summary of Hospital Stay & Treatment:
{{{treatmentSummary}}}

Condition at Discharge: {{{conditionAtDischarge}}}

Follow-up Instructions & Medications:
{{{followUpInstructions}}}

Discharging Physician: {{{doctorName}}}

Please ensure the summary is clear, concise, and professionally formatted.
Include all relevant sections typically found in a discharge summary.
Focus on medical accuracy and completeness based on the provided inputs.
Return the entire summary as a single block of text in the 'dischargeSummaryText' field.
`,
});

const generateDischargeSummaryFlow = ai.defineFlow(
  {
    name: 'generateDischargeSummaryFlow',
    inputSchema: GenerateDischargeSummaryInputSchema,
    outputSchema: GenerateDischargeSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

