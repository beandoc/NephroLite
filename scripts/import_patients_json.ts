
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, writeBatch } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import dotenv from 'dotenv';
import { GENDERS } from '../src/lib/constants';

// Load environment variables
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const rl = readline.createInterface({ input, output });

// Helper to remove undefined values
function sanitize<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

// Mapping from JSON test keys to Application Investigation IDs
const TEST_KEY_MAP: { [key: string]: string } = {
    'hb': 'hem_001',
    'tlc': 'hem_002',
    'plt': 'hem_004',
    'esr': 'hem_005',
    'pt': 'hem_006',
    'inr': 'hem_010',

    'urea': 'bio_001',
    'creatinine': 'bio_002',
    'sodium': 'bio_003',
    'potassium': 'bio_004',
    'calcium': 'bio_006',
    'phosphate': 'bio_007',
    'uricAcid': 'bio_008',
    'alp': 'bio_009',
    'tp': 'bio_010',
    'albumin': 'bio_011',
    'bloodSugarFPi': 'bio_012', // Guessing FPi = Fasting
    'bloodSugarR': 'bio_013',   // Guessing R = Random/PP

    'totalBilirubin': 'bio_022',
    'directBilirubin': 'bio_023',
    'ast': 'bio_024',
    'alt': 'bio_025',
    'tg': 'bio_026',
    'tChol': 'bio_019',
    'hdl': 'bio_020',
    'ldl': 'bio_021',

    'serumCThree': 'ser_006',
    'serumCFour': 'ser_007',
    'dsDNA': 'ser_005',
    'ana': 'ser_004',
    'vitaminD': 'spc_004',
    'kidneyBiopsy': 'spc_001', // Added Kidney Biopsy mapping
    'antiHcv': 'ser_002',
    'hbsAg': 'ser_001',
    'hiv': 'ser_003',

    'twentyFourHrUrineProtein': 'urn_003',
    // 'urineAcRatio': 'urn_005' // Not commonly found in map but good to know
};

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  PATIENT DATA IMPORT TOOL (FULL)                           ║');
    console.log('║  Importing from src/lib/patient_import.json                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    try {
        // 1. Authenticate
        console.log('🔐 Authentication Required (to write to Firestore)');

        let email = process.env.IMPORT_EMAIL;
        let password = process.env.IMPORT_PASSWORD;

        if (!email || !password) {
            email = await rl.question('   Email: ');
            password = await rl.question('   Password: ');
        } else {
            console.log('   Using credentials from environment.');
        }

        console.log('\n🔄 Logging in...');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log(`✅ Logged in as: ${userCredential.user.email} (${userCredential.user.uid})\n`);

        // 2. Read JSON
        const jsonPath = path.join(process.cwd(), 'src/lib/patient_import.json');
        if (!fs.existsSync(jsonPath)) {
            throw new Error(`File not found: ${jsonPath}`);
        }

        console.log('📂 Reading JSON file (this may take a moment)...');
        const rawData = fs.readFileSync(jsonPath, 'utf-8');
        const jsonData = JSON.parse(rawData);

        const patientsMap = jsonData.patientForm;
        if (!patientsMap) {
            throw new Error("JSON structure invalid: 'patientForm' key not found.");
        }

        const patientIds = Object.keys(patientsMap);
        console.log(`📊 Found ${patientIds.length} patient records in JSON.\n`);

        let shouldProceed = process.env.IMPORT_CONFIRM;
        if (!shouldProceed) {
            shouldProceed = await rl.question('❓ Proceed with import? (y/n): ');
        } else {
            console.log('   Auto-confirming from environment.');
        }

        if (shouldProceed.toLowerCase() !== 'y') {
            console.log('❌ Import cancelled.');
            process.exit(0);
        }

        // 3. Process and Import
        let processed = 0;
        let errors = 0;
        let batchInfo = { count: 0, batch: writeBatch(db) };

        console.log('\n🚀 Starting import...');

        for (const key of patientIds) {
            try {
                const source = patientsMap[key];
                const info = source.patientInfo;

                // --- MAPPING LOGIC ---

                // 1. Basic Info
                const firstName = info.patientName?.split(' ')[0] || 'Unknown';
                const lastName = info.patientName?.split(' ').slice(1).join(' ') || '.';

                let gender = 'Male';
                if (info.gender?.code === 'F' || info.gender?.code?.toLowerCase() === 'female') gender = 'Female';
                else if (info.gender?.code === 'M' || info.gender?.code?.toLowerCase() === 'male') gender = 'Male';
                if (!GENDERS.includes(gender as any)) gender = 'Male';

                const patientId = key;

                // 2. Process Visits & Investigations
                const rawVisits = source.patientVisitDetails || [];
                const mappedVisits = [];
                const mappedInvestigations = [];

                for (let i = 0; i < rawVisits.length; i++) {
                    const v = rawVisits[i];

                    // A. Extract Date
                    // Try to find a date in tests first, as it's most reliable
                    let visitDate = v.patientTestInfo?.[0]?.dateOfTest;
                    if (!visitDate && v.patientDiseaseDetails?.patientPrimaryDiseaseList?.[0]?.dateOfDetection) {
                        visitDate = v.patientDiseaseDetails.patientPrimaryDiseaseList[0].dateOfDetection;
                    }
                    // Fallback to current date or placeholder if absolutely nothing found
                    // But we want valid dates.
                    if (!visitDate) {
                        // Check for visitTypeIndex (nested deep late in file?)
                        // If not found, use a fixed past date + index to keep order
                        visitDate = new Date().toISOString();
                    }

                    // B. Map Visit
                    const summaryHistory = v.patientHistoryExamination?.examinationsSummaryHistory || v.patientDischarge?.historySummary || '';
                    const exam = v.patientHistoryExamination?.examinationsExamination || '';
                    const bp = v.patientHistoryExamination?.bloodPressure;
                    const pulse = v.patientHistoryExamination?.pulse;
                    const weight = v.patientHistoryExamination?.weight;

                    const opinion = v.patientOpinion?.patientOpinion || '';
                    const recommendations = v.patientOpinion?.patientRecommendations || '';
                    const treatment = v.patientOpinion?.patientTreatmentAdvised || '';

                    // Combine history/exam into one string? Or keep separate if schema allows.
                    // Schema `clinicalData` has: `history`, `generalExamination`, `systemicExamination`, `diagnosisProfile`.
                    // Does it have `diagnoses`? Yes `diagnoses: InvestigationDiagnosis[]`.

                    const mappedVisit = {
                        id: `visit-${i + 1}`, // Generate IDs
                        date: visitDate,
                        visitType: 'Consultation', // Default
                        visitRemark: 'Imported from JSON',
                        clinicalData: {
                            history: summaryHistory,
                            generalExamination: `${exam} ${bp ? 'BP: ' + bp : ''} ${pulse ? 'Pulse: ' + pulse : ''} ${weight ? 'Wt: ' + weight : ''}`.trim(),
                            systemicExamination: '', // Could put exam here, but general covers it often in legacy
                            recommendations: `${opinion} <br/> ${recommendations} <br/> ${treatment}`,
                            treatmentAdvised: treatment, // Specific field we also added
                            diagnosisProfile: {
                                // Use the display name if available, otherwise fallback
                                diagnosis: v.patientDiseaseDetails?.patientPrimaryDiseaseList?.[0]?.primaryDiseaseReportDisplayName || v.patientDischarge?.diagnosis || '',
                            }
                        },
                        diagnoses: [{
                            id: 'imported-dx',
                            name: v.patientDiseaseDetails?.patientPrimaryDiseaseList?.[0]?.primaryDiseaseReportDisplayName || v.patientDischarge?.diagnosis || 'Diagnosis Not Recorded',
                            icdCode: '',
                            icdName: ''
                        }]
                    };
                    mappedVisits.push(mappedVisit);


                    // C. Map Investigations
                    const tests = v.patientTestInfo || [];
                    for (const testEntry of tests) {
                        const testDate = testEntry.dateOfTest || visitDate;
                        const details = testEntry.testDetail || {};
                        const mappedTests = [];

                        for (const [key, value] of Object.entries(details)) {
                            if (!value || (typeof value === 'string' && value.trim() === '')) continue;

                            // Map key to ID
                            const masterId = TEST_KEY_MAP[key] || `custom_${key}`;
                            const masterName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'); // Camel to Title

                            const mappedTest = {
                                id: masterId,
                                name: masterName,
                                group: 'Imported',
                                result: String(value),
                                resultType: isNaN(Number(value)) ? 'text' : 'numeric',
                            };
                            mappedTests.push(mappedTest);
                        }

                        if (mappedTests.length > 0) {
                            mappedInvestigations.push({
                                id: crypto.randomUUID(),
                                date: testDate,
                                notes: testEntry.testComment || 'Imported Investigation',
                                tests: mappedTests
                            });
                        }
                    }
                } // End of Visits Loop

                // 3. Clinical Profile (Latest)
                const latestVisit = rawVisits[0];
                const diseaseDetails = latestVisit?.patientDiseaseDetails;
                const opinionDetails = latestVisit?.patientOpinion;

                const patientData = {
                    id: patientId,
                    nephroId: info.referenceNumber || patientId,
                    firstName: firstName,
                    lastName: lastName,
                    dob: "1970-01-01",
                    gender: gender as any,

                    age: info.patientAge ? String(info.patientAge) : undefined,
                    relationshipToServiceMember: info.relationToFauzi?.value || undefined,
                    referenceNumber: info.referenceNumber,

                    clinicalProfile: {
                        // Specific User Request: Map primaryDiseaseReportDisplayName
                        primaryDiagnosis: diseaseDetails?.patientPrimaryDiseaseList?.[0]?.primaryDiseaseReportDisplayName || diseaseDetails?.patientPrimaryDiseaseList?.[0]?.primaryDisease?.value,
                        secondaryDisability: diseaseDetails?.secondaryDisabilityPlainText,
                        treatmentAdvised: opinionDetails?.patientTreatmentAdvised,
                        vaccinations: [],
                        bloodGroup: 'Unknown',
                    },

                    registrationDate: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    trackUser: true,
                    isTracked: true,

                    visits: mappedVisits, // Populating visits array!
                    investigationRecords: mappedInvestigations, // Populating investigations array!

                    address: {},
                    guardian: {},
                    patientStatus: 'OPD' as const,
                };

                // Remove visits and investigations from main doc to avoid bloat/duplication
                // But keep them in variables to write to subcols
                const { visits, investigationRecords, ...patientDocData } = patientData;

                // Write Patient Doc
                const docRef = doc(db, 'patients', patientId);
                batchInfo.batch.set(docRef, sanitize(patientDocData));
                batchInfo.count++;

                // Write Visits to Subcollection
                // collection(db, 'patients', patientId, 'visits')
                for (const visit of mappedVisits) {
                    const visitRef = doc(db, 'patients', patientId, 'visits', visit.id);
                    batchInfo.batch.set(visitRef, sanitize(visit));
                    batchInfo.count++;
                }

                // Write Investigations to Subcollection
                // collection(db, 'patients', patientId, 'investigationRecords')
                for (const inv of mappedInvestigations) {
                    const invRef = doc(db, 'patients', patientId, 'investigationRecords', inv.id);
                    batchInfo.batch.set(invRef, sanitize(inv));
                    batchInfo.count++;
                }

                if (batchInfo.count >= 400) {
                    process.stdout.write('.');
                    await batchInfo.batch.commit();
                    batchInfo.batch = writeBatch(db);
                    batchInfo.count = 0;
                }

                processed++;

            } catch (err: any) {
                console.error(`\n❌ Error processing ${key}: ${err.message}`);
                errors++;
            }
        }

        // Commit final batch
        if (batchInfo.count > 0) {
            process.stdout.write('.');
            await batchInfo.batch.commit();
        }

        console.log('\n\n╔════════════════════════════════════════════════════════════╗');
        console.log('║  IMPORT COMPLETE ✅                                        ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log(`   Processed: ${processed}`);
        console.log(`   Errors: ${errors}`);

        rl.close();
        process.exit(0);

    } catch (error: any) {
        console.error('\n❌ Fatal Error:', error.message);
        rl.close();
        process.exit(1);
    }
}

main();
