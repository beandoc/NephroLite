
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-clinical-tags.ts';
import '@/ai/flows/generate-consent-form-flow.ts';
import '@/ai/flows/generate-discharge-summary-flow.ts';
import '@/ai/flows/generate-opinion-report-flow.ts';
