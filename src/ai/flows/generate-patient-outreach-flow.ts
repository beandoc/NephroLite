
'use server';
/**
 * @fileOverview An AI agent that generates a patient outreach message.
 *
 * - generatePatientOutreach - A function that handles the outreach message generation.
 * - GeneratePatientOutreachInput - The input type for the function.
 * - GeneratePatientOutreachOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePatientOutreachInputSchema = z.object({
  patientName: z.string().describe("The full name of the patient."),
  primaryDiagnosis: z.string().describe("The patient's primary diagnosis."),
  messageContext: z.string().describe("The context or goal of the message (e.g., 'Dietary reminder', 'Appointment follow-up')."),
});
export type GeneratePatientOutreachInput = z.infer<typeof GeneratePatientOutreachInputSchema>;

const GeneratePatientOutreachOutputSchema = z.object({
  outreachMessage: z.string().describe('The generated text for the patient outreach message.'),
});
export type GeneratePatientOutreachOutput = z.infer<typeof GeneratePatientOutreachOutputSchema>;

export async function generatePatientOutreach(input: GeneratePatientOutreachInput): Promise<GeneratePatientOutreachOutput> {
  return generatePatientOutreachFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePatientOutreachPrompt',
  input: {schema: GeneratePatientOutreachInputSchema},
  output: {schema: GeneratePatientOutreachOutputSchema},
  prompt: `You are a helpful medical assistant drafting a concise and friendly outreach message to a patient.

The message should be professional, empathetic, and clear.

Patient Name: {{{patientName}}}
Primary Diagnosis: {{{primaryDiagnosis}}}
Message Goal: {{{messageContext}}}

Please generate a short message (suitable for SMS or a brief email) based on the goal. For example, if the goal is a dietary reminder for a patient with hypertension, the message could be: "Dear {{{patientName}}}, this is a friendly reminder to follow your low-salt diet as discussed. It's important for managing your hypertension. Best, [Clinic Name]".

Generate the message now.
`,
});

const generatePatientOutreachFlow = ai.defineFlow(
  {
    name: 'generatePatientOutreachFlow',
    inputSchema: GeneratePatientOutreachInputSchema,
    outputSchema: GeneratePatientOutreachOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
