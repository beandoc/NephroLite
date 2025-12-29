
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// ... config ...
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function checkData() {
    // Authenticate
    const email = process.env.IMPORT_EMAIL || 'testuser@nephrolite.com';
    const password = process.env.IMPORT_PASSWORD || 'testuser';
    await signInWithEmailAndPassword(auth, email, password);
    console.log(`Logged in.`);

    // List first 50 patients to find Gopal
    const patientsRef = collection(db, 'patients');
    const q = query(patientsRef, limit(50));
    const snap = await getDocs(q);

    console.log(`Checking ${snap.size} patients...`);

    let gopalId = '';

    for (const d of snap.docs) {
        const data = d.data();
        const name = `${data.firstName} ${data.lastName}`;
        console.log(`ID: ${d.id}, Name: ${name}`);
        if (name.toUpperCase().includes('GOPAL')) {
            gopalId = d.id;
            console.log('>>> FOUND MATCH!');
        }
    }

    if (gopalId) {
        console.log(`\nVerifying Subcollections for ${gopalId}...`);
        // Check Visits Subcollection
        const visitsRef = collection(db, 'patients', gopalId, 'visits');
        const visitsSnap = await getDocs(visitsRef);
        console.log(`   📂 Visits: ${visitsSnap.size}`);
        visitsSnap.forEach(d => console.log(`      - ${d.data().date}`));

        // Check Investigations
        const invRef = collection(db, 'patients', gopalId, 'investigationRecords');
        const invSnap = await getDocs(invRef);
        console.log(`   📂 Investigations: ${invSnap.size}`);
    }

    process.exit(0);
}

checkData();
