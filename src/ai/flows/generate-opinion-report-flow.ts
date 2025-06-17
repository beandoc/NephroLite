
'use server';
/**
 * @fileOverview An AI agent that generates a medical opinion report.
 *
 * - generateOpinionReport - A function that handles the opinion report generation.
 * - GenerateOpinionReportInput - The input type for the generateOpinionReport function.
 * - GenerateOpinionReportOutput - The return type for the generateOpinionReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOpinionReportInputSchema = z.object({
  patientName: z.string().describe("The full name of the patient."),
  dateOfOpinion: z.string().describe("The date the opinion is being provided (e.g., YYYY-MM-DD)."),
  referringPhysician: z.string().optional().describe("The name of the referring physician, if any."),
  reasonForOpinion: z.string().describe("The primary reason for seeking this medical opinion."),
  historyOfPresentIllness: z.string().describe("A summary of the patient's current medical condition and history relevant to the opinion."),
  examinationFindings: z.string().describe("Key findings from the physical examination pertinent to the opinion."),
  investigationResultsSummary: z.string().describe("A summary of relevant investigation results (labs, imaging, etc.)."),
  medicalOpinion: z.string().describe("The core medical opinion based on the available information."),
  recommendations: z.string().describe("Specific recommendations for treatment, further investigation, or management."),
  providingDoctorName: z.string().describe("The full name of the doctor providing the opinion."),
  patientServiceNumber: z.string().optional().describe("Patient's service number, if applicable."),
  patientRank: z.string().optional().describe("Patient's rank, if applicable."),
});
export type GenerateOpinionReportInput = z.infer<typeof GenerateOpinionReportInputSchema>;

const GenerateOpinionReportOutputSchema = z.object({
  opinionReportText: z.string().describe('The generated text of the medical opinion report.'),
});
export type GenerateOpinionReportOutput = z.infer<typeof GenerateOpinionReportOutputSchema>;

export async function generateOpinionReport(input: GenerateOpinionReportInput): Promise<GenerateOpinionReportOutput> {
  return generateOpinionReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOpinionReportPrompt',
  input: {schema: GenerateOpinionReportInputSchema},
  output: {schema: GenerateOpinionReportOutputSchema},
  prompt: `You are a medical expert assistant tasked with drafting a formal medical opinion report.

MEDICAL OPINION REPORT

Date of Opinion: {{{dateOfOpinion}}}
Patient Name: {{{patientName}}}
{{#if patientServiceNumber}}Service Number: {{{patientServiceNumber}}}{{/if}}
{{#if patientRank}}Rank: {{{patientRank}}}{{/if}}
{{#if referringPhysician}}Referring Physician: {{{referringPhysician}}}{{/if}}

Reason for Opinion:
{{{reasonForOpinion}}}

History of Present Illness:
{{{historyOfPresentIllness}}}

Relevant Examination Findings:
{{{examinationFindings}}}

Summary of Investigation Results:
{{{investigationResultsSummary}}}

Medical Opinion:
{{{medicalOpinion}}}

Recommendations:
{{{recommendations}}}

This opinion is based on the information provided and my professional medical judgment.

Sincerely,
{{{providingDoctorName}}}

Please ensure the report is well-structured, uses formal medical language, and addresses all input fields.
Return the entire report as a single block of text in the 'opinionReportText' field.
`,
});

const generateOpinionReportFlow = ai.defineFlow(
  {
    name: 'generateOpinionReportFlow',
    inputSchema: GenerateOpinionReportInputSchema,
    outputSchema: GenerateOpinionReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

