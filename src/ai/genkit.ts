import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { config } from 'dotenv';
config();


export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY})],
  model: 'googleai/gemini-pro',
});
