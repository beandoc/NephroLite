
'use server';

import { suggestClinicalTags, type SuggestClinicalTagsInput } from '@/ai/flows/suggest-clinical-tags';
import { z } from 'zod';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';

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
    return { success: false, error: 'Failed to get suggestions due to a server error. Please try again later.' };
  }
}

export async function addClinicalTagsToPatient(patientId: string, tags: string[]) {
    if (!patientId || !tags || tags.length === 0) {
        return { success: false, error: "Invalid patient ID or tags provided." };
    }
    try {
        const patientRef = doc(db, "patients", patientId);
        await updateDoc(patientRef, {
            "clinicalProfile.tags": arrayUnion(...tags)
        });
        return { success: true };
    } catch (error) {
        console.error("Error adding tags to patient:", error);
        return { success: false, error: "A server error occurred while adding tags." };
    }
}
