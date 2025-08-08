import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByw3ekGvxQCE0Fht5muCVNSH-bYwHSSpg",
  authDomain: "nephrolite-d8e95.firebaseapp.com",
  projectId: "nephrolite-d8e95",
  storageBucket: "nephrolite-d8e95.appspot.com",
  messagingSenderId: "229893058058",
  appId: "1:229893058058:web:99e59bee16b3630a0139f3",
  measurementId: "G-L9C6LQEXDJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and export it so your app can use it
export const db = getFirestore(app);