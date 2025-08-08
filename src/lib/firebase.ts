
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "nephrolite",
  appId: "1:394298048885:web:3125f8277a73b0b841133c",
  storageBucket: "nephrolite.firebasestorage.app",
  apiKey: "AIzaSyCisWk-DXkR8bejj1ey82uIzL9ps-tp-_8",
  authDomain: "nephrolite.firebaseapp.com",
  messagingSenderId: "394298048885",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
