
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "nephrolite-d8e95",
  appId: "1:229893058058:web:99e59bee16b3630a0139f3",
  storageBucket: "nephrolite-d8e95.appspot.com",
  apiKey: "AIzaSyByw3ekGvxQCE0Fht5muCVNSH-bYwHSSpg",
  authDomain: "nephrolite-d8e95.firebaseapp.com",
  messagingSenderId: "229893058058",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db, getApps, getApp };
