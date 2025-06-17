
'use server';
/**
 * @fileOverview An AI agent that generates a basic patient consent form.
 *
 * - generateConsentForm - A function that handles the consent form generation process.
 * - GenerateConsentFormInput - The input type for the generateConsentForm function.
 * - GenerateConsentFormOutput - The return type for the generateConsentForm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateConsentFormInputSchema = z.object({
  patientName: z.string().describe("The full name of the patient."),
  procedureName: z.string().describe("The name of the medical procedure for which consent is being sought."),
  doctorName: z.string().describe("The full name of the doctor performing the procedure."),
  patientServiceNumber: z.string().optional().describe("Patient's service number, if applicable."),
  patientRank: z.string().optional().describe("Patient's rank, if applicable."),
});
export type GenerateConsentFormInput = z.infer<typeof GenerateConsentFormInputSchema>;

const GenerateConsentFormOutputSchema = z.object({
  consentFormText: z.string().describe('The generated text of the patient consent form.'),
});
export type GenerateConsentFormOutput = z.infer<typeof GenerateConsentFormOutputSchema>;

export async function generateConsentForm(input: GenerateConsentFormInput): Promise<GenerateConsentFormOutput> {
  return generateConsentFormFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConsentFormPrompt',
  input: {schema: GenerateConsentFormInputSchema},
  output: {schema: GenerateConsentFormOutputSchema},
  prompt: `You are a helpful assistant tasked with generating a standard patient consent form for a medical procedure.

Please generate a consent form based on the following information:
Patient Name: {{{patientName}}}
{{#if patientServiceNumber}}Service Number: {{{patientServiceNumber}}}{{/if}}
{{#if patientRank}}Rank: {{{patientRank}}}{{/if}}
Procedure Name: {{{procedureName}}}
Doctor Name: {{{doctorName}}}

The consent form should include:
1.  A clear statement of consent for the specified procedure.
2.  Acknowledgement that the patient has had the opportunity to discuss the procedure, its risks, benefits, and alternatives with the doctor.
3.  A section for the patient's signature and date.
4.  A section for a witness's signature and date (optional, but good practice).
5.  A section for the doctor's confirmation of explanation.

Ensure the language is clear and formal. This is a template and may need review by legal counsel.
Return the entire form as a single block of text in the 'consentFormText' field.
Example structure:

PATIENT CONSENT FORM

Patient Name: {{patientName}}
{{#if patientServiceNumber}}Service Number: {{patientServiceNumber}}{{/if}}
{{#if patientRank}}Rank: {{patientRank}}{{/if}}
Date of Birth: [Placeholder for DOB]

Procedure: {{procedureName}}
Physician: {{doctorName}}

1. I, {{patientName}}, hereby authorize Dr. {{doctorName}} and such assistants as may be selected to perform the following procedure: {{procedureName}}.
2. The procedure, its purpose, potential risks, benefits, and alternatives have been explained to me by Dr. {{doctorName}}. I have had the opportunity to ask questions and all my questions have been answered to my satisfaction.
3. I understand that no guarantee can be made as to the outcome of the procedure.
... (include other standard consent clauses as appropriate) ...

_________________________
Patient Signature
Date: _______________

_________________________
Witness Signature (Optional)
Date: _______________

Physician's Confirmation:
I confirm that I have explained the procedure, its risks, benefits, and alternatives to the patient.
_________________________
Dr. {{doctorName}} Signature
Date: _______________

`,
});

const generateConsentFormFlow = ai.defineFlow(
  {
    name: 'generateConsentFormFlow',
    inputSchema: GenerateConsentFormInputSchema,
    outputSchema: GenerateConsentFormOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

