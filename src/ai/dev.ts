
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-clinical-tags';
import '@/ai/flows/generate-consent-form-flow';
import '@/ai/flows/generate-discharge-summary-flow';
import '@/ai/flows/generate-opinion-report-flow';
import '@/ai/flows/generate-opd-consultation-note-flow';
import '@/ai/flows/search-notifications-flow';
import '@/ai/flows/generate-patient-outreach-flow';
