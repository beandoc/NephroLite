
'use server';
/**
 * @fileOverview An AI agent that searches through patient visit notes.
 *
 * - searchNotifications - A function that handles the search process.
 * - SearchNotificationsInput - The input type for the function.
 * - SearchNotificationsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Visit } from '@/lib/types';

// Define a more specific type for visits that includes the patient's name.
type VisitWithPatientName = Visit & { patientName: string };

const SearchableVisitSchema = z.object({
    patientId: z.string(),
    patientName: z.string(),
    visitId: z.string(),
    visitDate: z.string(),
    note: z.string(),
});

const SearchNotificationsInputSchema = z.object({
  query: z.string().describe("The user's search query."),
  visits: z.array(SearchableVisitSchema).describe("An array of searchable patient visit objects."),
});
export type SearchNotificationsInput = z.infer<typeof SearchNotificationsInputSchema>;

const SearchResultItemSchema = z.object({
    patientId: z.string(),
    patientName: z.string(),
    visitId: z.string(),
    visitDate: z.string(),
    relevantText: z.string().describe("The specific text snippet from the visit note that matches the query."),
});

const SearchNotificationsOutputSchema = z.object({
  results: z.array(SearchResultItemSchema).describe('An array of matching visit notifications.'),
});
export type SearchNotificationsOutput = z.infer<typeof SearchNotificationsOutputSchema>;

export async function searchNotifications(input: {query: string, visits: VisitWithPatientName[]}): Promise<SearchNotificationsOutput> {
  
  // To avoid passing massive amounts of data, we'll extract relevant text from visits.
  const searchableVisits = input.visits.map(visit => ({
      patientId: visit.patientId,
      patientName: visit.patientName,
      visitId: visit.id,
      visitDate: visit.date,
      note: `
        Visit Type: ${visit.visitType}. 
        Remark: ${visit.visitRemark}. 
        Diagnoses: ${visit.diagnoses?.map(d => d.name).join(', ')}.
        History: ${visit.clinicalData?.history}.
        Examination: ${visit.clinicalData?.generalExamination} ${visit.clinicalData?.systemicExamination}.
        Medications: ${visit.clinicalData?.medications?.map(m => m.name).join(', ')}.
      `.replace(/\s+/g, ' ').trim(),
  }));

  const flowInput: SearchNotificationsInput = {
    query: input.query,
    visits: searchableVisits,
  };

  return searchNotificationsFlow(flowInput);
}

const prompt = ai.definePrompt({
  name: 'searchNotificationsPrompt',
  input: {schema: SearchNotificationsInputSchema},
  output: {schema: SearchNotificationsOutputSchema},
  prompt: `You are an intelligent clinical notification search engine.
Search through the provided list of patient visits to find notes that match the user's query.

For each match you find, extract the patient's ID and name, the visit ID and date, and the specific text snippet that is relevant to the query.

User Query: {{{query}}}

Visits Data:
"{{jsonStringify visits}}"
`,
});

const searchNotificationsFlow = ai.defineFlow(
  {
    name: 'searchNotificationsFlow',
    inputSchema: SearchNotificationsInputSchema,
    outputSchema: SearchNotificationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
