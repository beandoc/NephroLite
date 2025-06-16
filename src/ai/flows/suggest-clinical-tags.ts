'use server';

/**
 * @fileOverview An AI agent that suggests relevant clinical tags based on a patient's diagnosis or medication.
 *
 * - suggestClinicalTags - A function that handles the clinical tag suggestion process.
 * - SuggestClinicalTagsInput - The input type for the suggestClinicalTags function.
 * - SuggestClinicalTagsOutput - The return type for the suggestClinicalTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestClinicalTagsInputSchema = z.object({
  text: z
    .string()
    .describe("The patient's diagnosis or medication text."),
});
export type SuggestClinicalTagsInput = z.infer<typeof SuggestClinicalTagsInputSchema>;

const SuggestClinicalTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of suggested clinical tags.'),
});
export type SuggestClinicalTagsOutput = z.infer<typeof SuggestClinicalTagsOutputSchema>;

export async function suggestClinicalTags(input: SuggestClinicalTagsInput): Promise<SuggestClinicalTagsOutput> {
  return suggestClinicalTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestClinicalTagsPrompt',
  input: {schema: SuggestClinicalTagsInputSchema},
  output: {schema: SuggestClinicalTagsOutputSchema},
  prompt: `You are a medical expert specializing in clinical tag suggestions.

  Based on the following patient diagnosis or medication text, suggest relevant clinical tags. Return a JSON array of strings.

  Text: {{{text}}}
  `,
});

const suggestClinicalTagsFlow = ai.defineFlow(
  {
    name: 'suggestClinicalTagsFlow',
    inputSchema: SuggestClinicalTagsInputSchema,
    outputSchema: SuggestClinicalTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
