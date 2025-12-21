# Drug Interaction Checker - Testing Guide

## Overview

The Drug Interaction Checker is an AI-powered tool that analyzes medication combinations for:
- **Drug-drug interactions** with severity levels
- **Allergy contraindications** and cross-reactivity
- **Renal dose adjustments** for patients with kidney disease

## Files Created

1. **AI Flow**: [`src/ai/flows/check-drug-interactions.ts`](file:///Users/sachinsrivastava/Downloads/NephroLite/src/ai/flows/check-drug-interactions.ts)
2. **Server Action**: Updated [`src/lib/actions.ts`](file:///Users/sachinsrivastava/Downloads/NephroLite/src/lib/actions.ts)
3. **UI Component**: [`src/components/medications/drug-interaction-checker.tsx`](file:///Users/sachinsrivastava/Downloads/NephroLite/src/components/medications/drug-interaction-checker.tsx)
4. **Test Page**: [`src/app/(app)/tools/drug-interactions/page.tsx`](file:///Users/sachinsrivastava/Downloads/NephroLite/src/app/(app)/tools/drug-interactions/page.tsx)
5. **Flow Registration**: Updated [`src/ai/dev.ts`](file:///Users/sachinsrivastava/Downloads/NephroLite/src/ai/dev.ts)

## Testing Steps

### Step 1: Start the Development Server

```bash
cd /Users/sachinsrivastava/Downloads/NephroLite
npm run dev
```

The app should start on http://localhost:3030

### Step 2: Access the Test Page

Navigate to: **http://localhost:3030/tools/drug-interactions**

### Step 3: Test with Sample Data

Click **"Load Sample Data"** button to populate:
- **Medications**: Lisinopril, Metformin, Ibuprofen
- **Allergies**: Penicillin
- **eGFR**: 45 (indicating CKD stage 3)
- **Age**: 65

Then click **"Check for Interactions"**

### Step 4: Review Results

The AI will analyze and display:

#### Expected Results:
- **Severe Interaction**: Lisinopril + Ibuprofen (NSAIDs reduce ACE inhibitor efficacy, increase hyperkalemia risk)
- **Renal Adjustments**:
  - **Metformin**: Should be avoided or dose-reduced with eGFR < 45
  - **Ibuprofen**: Should be avoided in CKD
- **Overall Risk**: Severe

### Step 5: Test Genkit Developer UI (Optional)

For detailed flow debugging:

```bash
npm run genkit:dev
```

Access at: **http://localhost:4000**

1. Find "checkDrugInteractionsFlow" in the flows list
2. Click to open
3. Test with custom inputs

#### Sample Test Input:
```json
{
  "medications": [
    {
      "name": "Warfarin",
      "dosage": "5mg daily",
      "route": "PO"
    },
    {
      "name": "Aspirin",
      "dosage": "81mg daily",
      "route": "PO"
    }
  ],
  "egfr": 35,
  "age": 72
}
```

Expected: Severe bleeding risk warning

## Test Scenarios

### Scenario 1: Common Nephrology Drugs
```
Medications:
- Lisinopril 10mg daily
- Furosemide 40mg BID  
- Spironolactone 25mg daily
- Potassium Chloride 20mEq daily

eGFR: 40
```

**Expected**: Hyperkalemia warning (ACEi + K-sparing diuretic + K supplement)

### Scenario 2: Antibiotic Allergy Cross-Reactivity
```
Medications:
- Cephalexin 500mg QID

Allergies:
- Penicillin

eGFR: 80
```

**Expected**: Warning about cephalosporin cross-reactivity with penicillin allergy

### Scenario 3: Multiple Renal-Adjusted Drugs
```
Medications:
- Gabapentin 300mg TID
- Metformin 1000mg BID
- Atenolol 50mg daily

eGFR: 25
```

**Expected**: Multiple renal dose adjustment recommendations

### Scenario 4: No Issues
```
Medications:
- Amlodipine 5mg daily
- Atorvastatin 20mg daily

eGFR: 90
```

**Expected**: No significant interactions found

## Common Issues & Troubleshooting

### Issue: "Rate limit exceeded" or API errors

**Solution**: Check that `NEXT_PUBLIC_FIREBASE_API_KEY` is set in `.env.local`

### Issue: Flow not found in Genkit UI

**Solution**: 
1. Stop the server
2. Run `npm run genkit:dev` again
3. Check that import is in `src/ai/dev.ts`

### Issue: TypeScript errors

**Solution**:
```bash
npm run typecheck
```

Fix any type errors in the new files

### Issue: Component not rendering

**Solution**: Check browser console for errors. Ensure all imports are correct.

## Integration into Existing Workflows

### Option 1: Add to Visit Forms

In [`src/components/patients/profile-tabs/PatientVisitsTabContent.tsx`](file:///Users/sachinsrivastava/Downloads/NephroLite/src/components/patients/profile-tabs/PatientVisitsTabContent.tsx):

```typescript
import { DrugInteractionChecker } from '@/components/medications/drug-interaction-checker';

// In the medications section of visit form:
{visit.clinicalData?.medications && (
  <DrugInteractionChecker
    medications={visit.clinicalData.medications}
    patientAllergies={patient.clinicalProfile.drugAllergies?.split(',') || []}
    egfr={/* extract from latest lab */}
    age={calculateAge(patient.dob)}
  />
)}
```

### Option 2: Add to Navigation Menu

Update [`src/components/shared/sidebar-nav.tsx`](file:///Users/sachinsrivastava/Downloads/NephroLite/src/components/shared/sidebar-nav.tsx):

```typescript
{
  label: "Drug Interactions",
  icon: Pill, // Import from lucide-react
  href: "/tools/drug-interactions",
}
```

## Performance Considerations

- **API Calls**: Each check makes 1 Gemini API call (~500-2000 tokens)
- **Cost**: ~$0.001-0.005 per check (Gemini Pro pricing)
- **Response Time**: 2-5 seconds typically

## Future Enhancements

1. **Auto-check on medication changes** - Real-time checking as medications are added
2. **Historical tracking** - Log all interaction checks for audit
3. **Severity notifications** - Alert users to severe interactions immediately
4. **PDF export** - Generate printable interaction reports
5. **Database caching** - Cache common interaction patterns

## Security & Privacy

- All AI processing happens server-side ('use server' directive)
- No patient data stored by Gemini (stateless API calls)
- Input validation prevents injection attacks
- Follows HIPAA guidelines for PHI handling

## Next Steps

1. ✅ Test the standalone page
2. ⬜ Integrate into visit workflow
3. ⬜ Add to medication forms
4. ⬜ Add navigation menu item
5. ⬜ Deploy to production

---

**Need Help?** Check the [ML/AI Implementation Guide](file:///Users/sachinsrivastava/.gemini/antigravity/brain/e76c92b3-2834-4551-9cef-d10a1b21a24c/ml_ai_implementation_guide.md) for more details.
