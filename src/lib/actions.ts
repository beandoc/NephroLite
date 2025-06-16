
'use server';

import { suggestClinicalTags, type SuggestClinicalTagsInput } from '@/ai/flows/suggest-clinical-tags';
import { z } from 'zod';

const SuggestTagsSchema = z.object({
  text: z.string().min(3, "Input text must be at least 3 characters long."),
});

export async function getAiSuggestedTagsAction(input: SuggestClinicalTagsInput) {
  const validation = SuggestTagsSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: "Invalid input: " + validation.error.errors.map(e => e.message).join(', ') };
  }

  try {
    const result = await suggestClinicalTags(validation.data);
    return { success: true, tags: result.tags };
  } catch (error) {
    console.error('Error getting AI suggested tags:', error);
    // It's good practice to not expose raw error messages to the client.
    // Log the detailed error on the server and return a generic message.
    return { success: false, error: 'Failed to get suggestions due to a server error. Please try again later.' };
  }
}
