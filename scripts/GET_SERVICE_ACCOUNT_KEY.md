# How to Get Your Firebase Service Account Key

## Steps to Download Service Account Key

1. **Go to Firebase Console**
   - Open: https://console.firebase.google.com
   - Select your project (NephroLite)

2. **Navigate to Project Settings**
   - Click the gear icon (⚙️) next to "Project Overview"
   - Click "Project settings"

3. **Go to Service Accounts Tab**
   - Click "Service accounts" tab
   - You should see "Firebase Admin SDK" section

4. **Generate New Private Key**
   - Click "Generate new private key" button
   - A dialog will appear warning you to keep it secure
   - Click "Generate key"

5. **Save the Downloaded File**
   - A JSON file will download automatically
   - Rename it to: `serviceAccountKey.json`
   - Move it to your project root: `/Users/sachinsrivastava/Downloads/NephroLite/`

## Security Note

⚠️ **IMPORTANT**: 
- Do NOT commit this file to Git (it's already in `.gitignore`)
- Keep this file secure - it provides admin access to your Firebase project
- Never share this file publicly

## After Getting the Key

Once you have the `serviceAccountKey.json` file in place, run:

```bash
# 1. Diagnose the issue
node scripts/diagnose-staff-access.js

# 2. Fix the issue
node scripts/fix-staff-access.js

# 3. Verify the fix
node scripts/diagnose-staff-access.js
```

## Alternative: Use Firebase Admin via Environment Variable

If you prefer not to download the service account key, you can:

1. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable
2. Or manually create the staff user document in Firestore Console

Let me know which approach you prefer!
