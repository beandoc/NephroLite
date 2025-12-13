# Environment Variables for Firebase

# Add these to your .env.local file (create if it doesn't exist)
# You can get these values from Firebase Console > Project Settings > General

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Instructions:
# 1. Go to https://console.firebase.google.com/
# 2. Create a new project or select existing one
# 3. Go to Project Settings (gear icon)
# 4. Scroll to "Your apps" section
# 5. Click "Web" (</>) to add a web app
# 6. Copy the config values to this file
