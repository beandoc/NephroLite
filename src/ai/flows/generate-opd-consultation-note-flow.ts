
'use server';
/**
 * @fileOverview An AI agent that generates an OPD consultation note.
 *
 * - generateOpdConsultationNote - A function that handles OPD note generation.
 * - GenerateOpdConsultationNoteInput - The input type for the function.
 * - GenerateOpdConsultationNoteOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOpdConsultationNoteInputSchema = z.object({
  patientName: z.string().describe("The full name of the patient."),
  visitDate: z.string().describe("The date of the OPD visit (e.g., YYYY-MM-DD)."),
  doctorName: z.string().describe("The full name of the consulting doctor."),
  chiefComplaints: z.string().describe("The patient's primary reasons for the visit."),
  examinationFindings: z.string().describe("Key findings from the physical examination."),
  investigationsOrdered: z.string().optional().describe("Any investigations ordered during this visit (e.g., KFT, Urine R/M)."),
  medicationsPrescribed: z.string().describe("Medications prescribed or advice given during this visit."),
  assessmentAndPlan: z.string().describe("The doctor's assessment of the patient's condition and the plan for management."),
  followUpInstructions: z.string().optional().describe("Instructions for follow-up appointments or care."),
  patientServiceNumber: z.string().optional().describe("Patient's service number, if applicable."),
  patientRank: z.string().optional().describe("Patient's rank, if applicable."),
});
export type GenerateOpdConsultationNoteInput = z.infer<typeof GenerateOpdConsultationNoteInputSchema>;

const GenerateOpdConsultationNoteOutputSchema = z.object({
  opdConsultationNoteText: z.string().describe('The generated text of the OPD consultation note.'),
});
export type GenerateOpdConsultationNoteOutput = z.infer<typeof GenerateOpdConsultationNoteOutputSchema>;

export async function generateOpdConsultationNote(input: GenerateOpdConsultationNoteInput): Promise<GenerateOpdConsultationNoteOutput> {
  return generateOpdConsultationNoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOpdConsultationNotePrompt',
  input: {schema: GenerateOpdConsultationNoteInputSchema},
  output: {schema: GenerateOpdConsultationNoteOutputSchema},
  prompt: `You are a medical assistant tasked with drafting a concise and structured OPD consultation note.

OPD CONSULTATION NOTE

Patient Name: {{{patientName}}}
{{#if patientServiceNumber}}Service Number: {{{patientServiceNumber}}}{{/if}}
{{#if patientRank}}Rank: {{{patientRank}}}{{/if}}
Date of Visit: {{{visitDate}}}
Consulting Doctor: {{{doctorName}}}

Chief Complaints:
{{{chiefComplaints}}}

Examination Findings:
{{{examinationFindings}}}

{{#if investigationsOrdered}}
Investigations Ordered:
{{{investigationsOrdered}}}
{{/if}}

Medications / Advice:
{{{medicationsPrescribed}}}

Assessment & Plan:
{{{assessmentAndPlan}}}

{{#if followUpInstructions}}
Follow-up:
{{{followUpInstructions}}}
{{/if}}

Ensure the note is clear, professionally formatted, and includes all relevant sections based on the provided inputs.
Return the entire note as a single block of text in the 'opdConsultationNoteText' field.
`,
});

const generateOpdConsultationNoteFlow = ai.defineFlow(
  {
    name: 'generateOpdConsultationNoteFlow',
    inputSchema: GenerateOpdConsultationNoteInputSchema,
    outputSchema: GenerateOpdConsultationNoteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

