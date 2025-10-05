
import type { Patient, Appointment, Vaccination } from './types';
import { format, subDays, addDays } from 'date-fns';
import { VACCINATION_NAMES } from './constants';

const today = new Date('2024-08-10T10:00:00.000Z');

const getDefaultVaccinations = (): Vaccination[] => {
  const vaccineSchedules: Record<string, number> = {
    'Hepatitis B': 4,
    'Pneumococcal': 2,
    'Influenza': 1,
    'Covid': 2,
    'Varicella': 2,
  };

  return VACCINATION_NAMES.map(name => ({
    name: name,
    totalDoses: vaccineSchedules[name] || 1,
    nextDoseDate: null,
    doses: Array.from({ length: vaccineSchedules[name] || 1 }, (_, i) => ({
      id: `${name.replace(/\s/g, '')}-${i + 1}`,
      doseNumber: i + 1,
      administered: false,
      date: null,
    }))
  }));
};

const getExampleVaccinations = (): Vaccination[] => {
  const defaultVaccinations = getDefaultVaccinations();
  const hepB = defaultVaccinations.find(v => v.name === 'Hepatitis B');
  if (hepB) {
    hepB.doses[0].administered = true;
    hepB.doses[0].date = '2023-01-10';
    hepB.nextDoseDate = '2023-02-10';
  }
  const pneumo = defaultVaccinations.find(v => v.name === 'Pneumococcal');
  if (pneumo) {
    pneumo.doses[0].administered = true;
    pneumo.doses[0].date = '2023-03-15';
  }
   const covid = defaultVaccinations.find(v => v.name === 'Covid');
   if(covid) {
    covid.doses[0].administered = true;
    covid.doses[0].date = '2022-11-20';
   }
  return defaultVaccinations;
}

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'patient-1',
    nephroId: '1001/0824',
    firstName: 'Aarav',
    lastName: 'Sharma',
    dob: '1968-05-15',
    gender: 'Male',
    contact: '9876543210',
    email: 'aarav.sharma@example.com',
    address: { street: '123 MG Road', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
    guardian: { name: 'Priya Sharma', relation: 'Spouse', contact: '9876543211' },
    registrationDate: '2024-05-12',
    createdAt: '2024-05-12T10:00:00.000Z',
    patientStatus: 'OPD',
    isTracked: true,
    residenceType: 'Urban',
    nextAppointmentDate: '2024-08-24',
    clinicalProfile: {
      primaryDiagnosis: 'Diabetic Nephropathy',
      tags: ['Diabetes', 'CKD Stage 3', 'Hypertension', 'PD'],
      nutritionalStatus: 'Well-nourished',
      disability: 'None',
      subspecialityFollowUp: 'Endocrinology',
      smokingStatus: 'No',
      alcoholConsumption: 'No',
      vaccinations: getExampleVaccinations(),
      pomr: "Long-standing T2DM with progressive proteinuria. Now CKD G3bA3. On ARB and SGLT2i.",
      aabhaNumber: 'ABHA-111',
      bloodGroup: 'O+',
      drugAllergies: 'Sulfa drugs',
      whatsappNumber: '9876543210',
      hasDiabetes: true,
      onAntiHypertensiveMedication: true,
      onLipidLoweringMedication: true,
    },
    visits: [
        {
            id: 'visit-1-1',
            date: '2024-05-22',
            createdAt: '2024-05-22T10:00:00.000Z',
            visitType: 'Routine',
            visitRemark: 'Initial consultation after referral.',
            groupName: 'Diabetic Nephropathy',
            patientId: 'patient-1',
            diagnoses: [{id: 'diag-1', name: 'Diabetic Nephropathy', icdCode: 'E11.21' }],
            clinicalData: {
                history: 'Patient referred from primary care for persistent proteinuria.',
                height: '175', weight: '78', bmi: '25.47', idealBodyWeight: '68.27',
                pulse: '76', systolicBP: '145', diastolicBP: '88', respiratoryRate: '16',
                medications: [
                    { id: 'med-1', name: 'Telmisartan', dosage: '40mg', frequency: 'OD' },
                    { id: 'med-2', name: 'Metformin', dosage: '500mg', frequency: 'BD' }
                ]
            }
        },
        {
            id: 'visit-1-2',
            date: '2024-07-11',
            createdAt: '2024-07-11T10:00:00.000Z',
            visitType: 'Follow-up',
            visitRemark: 'Added SGLT2 inhibitor.',
            groupName: 'Diabetic Nephropathy',
            patientId: 'patient-1',
            diagnoses: [{id: 'diag-1', name: 'Diabetic Nephropathy', icdCode: 'E11.21' }],
            clinicalData: {
                history: 'Follow-up to assess response to ARB. Proteinuria persists.',
                systolicBP: '138', diastolicBP: '82',
                medications: [
                    { id: 'med-1', name: 'Telmisartan', dosage: '40mg', frequency: 'OD' },
                    { id: 'med-3', name: 'Dapagliflozin', dosage: '10mg', frequency: 'OD' },
                    { id: 'med-2', name: 'Metformin', dosage: '500mg', frequency: 'BD' }
                ]
            }
        }
    ],
    investigationRecords: [
      { id: 'inv-1-1', date: '2024-05-22', tests: [
          { id: 'test-1', group: 'Biochemistry', name: 'Serum Creatinine', result: '1.5', unit: 'mg/dL', normalRange: '0.6-1.2' },
          { id: 'test-2', group: 'Biochemistry', name: 'eGFR', result: '55', unit: 'mL/min/1.73m²', normalRange: '>60' },
          { id: 'test-3', group: 'Urine Analysis', name: 'Urine for AC Ratio (mg/gm)', result: '500', unit: 'mg/gm', normalRange: '<30' }
      ]},
      { id: 'inv-1-2', date: '2024-07-11', tests: [
          { id: 'test-4', group: 'Biochemistry', name: 'Serum Creatinine', result: '1.4', unit: 'mg/dL', normalRange: '0.6-1.2' },
          { id: 'test-5', group: 'Biochemistry', name: 'eGFR', result: '58', unit: 'mL/min/1.73m²', normalRange: '>60' },
          { id: 'test-6', group: 'Urine Analysis', name: 'Urine for AC Ratio (mg/gm)', result: '450', unit: 'mg/gm', normalRange: '<30' }
      ]}
    ]
  },
  {
    id: 'patient-2',
    nephroId: '1002/0824',
    firstName: 'Isha',
    lastName: 'Singh',
    dob: '1992-11-22',
    gender: 'Female',
    contact: '9988776655',
    email: 'isha.singh@example.com',
    address: { street: '45 Park Avenue', city: 'Delhi', state: 'Delhi', pincode: '110001' },
    guardian: { name: 'Rohan Singh', relation: 'Spouse', contact: '9988776654' },
    registrationDate: '2024-04-12',
    createdAt: '2024-04-12T10:00:00.000Z',
    patientStatus: 'OPD',
    isTracked: false,
    residenceType: 'Urban',
    nextAppointmentDate: '2024-08-15',
    clinicalProfile: {
      primaryDiagnosis: 'IgA Nephropathy (IgAN)',
      tags: ['Glomerulonephritis', 'IgAN', 'HD'],
      nutritionalStatus: 'Well-nourished',
      disability: 'None',
      subspecialityFollowUp: 'NIL',
      smokingStatus: 'No',
      alcoholConsumption: 'No',
      vaccinations: getDefaultVaccinations(),
      pomr: 'Recurrent hematuria. Biopsy-proven IgA Nephropathy. Now on maintenance hemodialysis.',
      aabhaNumber: 'ABHA-222',
      bloodGroup: 'B+',
      drugAllergies: 'None',
      whatsappNumber: '9988776655',
      hasDiabetes: false,
      onAntiHypertensiveMedication: true,
      onLipidLoweringMedication: false,
    },
    visits: [],
    investigationRecords: [],
    dialysisSessions: []
  },
  {
    id: 'patient-3',
    nephroId: '1003/0724',
    firstName: 'Vikram',
    lastName: 'Reddy',
    dob: '1985-03-10',
    gender: 'Male',
    contact: '9123456789',
    email: 'vikram.reddy@example.com',
    address: { street: '78 Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033' },
    guardian: { name: 'Vikram Reddy', relation: 'Self', contact: '9123456789' },
    registrationDate: '2024-06-26',
    createdAt: '2024-06-26T10:00:00.000Z',
    patientStatus: 'IPD',
    isTracked: true,
    residenceType: 'Urban',
    nextAppointmentDate: null,
    clinicalProfile: {
      primaryDiagnosis: 'Acute Kidney Injury (AKI)',
      tags: ['AKI', 'Sepsis', 'HD'],
      nutritionalStatus: 'Moderate malnutrition',
      disability: 'None',
      subspecialityFollowUp: 'Intensive Care',
      smokingStatus: 'No',
      alcoholConsumption: 'No',
      vaccinations: getDefaultVaccinations(),
      pomr: 'Admitted with sepsis leading to AKI. Requires RRT.',
      aabhaNumber: 'ABHA-333',
      bloodGroup: 'A-',
      drugAllergies: 'Penicillin',
      whatsappNumber: '9123456789',
      hasDiabetes: false,
      onAntiHypertensiveMedication: false,
      onLipidLoweringMedication: false,
    },
    visits: [
        {
            id: 'visit-3-1',
            date: '2024-08-05',
            createdAt: '2024-08-05T10:00:00.000Z',
            visitType: 'Admission',
            visitRemark: 'Admitted via ER with fever and hypotension.',
            groupName: 'Infection',
            patientId: 'patient-3'
        }
    ],
    investigationRecords: [],
    dialysisSessions: []
  },
  {
    id: 'patient-4',
    nephroId: '1004/0724',
    firstName: 'Anjali',
    lastName: 'Menon',
    dob: '2000-08-01',
    gender: 'Female',
    contact: '9898989898',
    email: 'anjali.menon@example.com',
    address: { street: '22 Marine Drive', city: 'Kochi', state: 'Kerala', pincode: '682011' },
    guardian: { name: 'Suresh Menon', relation: 'F/O', contact: '9898989897' },
    registrationDate: '2024-01-22',
    createdAt: '2024-01-22T10:00:00.000Z',
    patientStatus: 'OPD',
    isTracked: true,
    residenceType: 'Semi-Urban',
    nextAppointmentDate: '2024-08-10',
    clinicalProfile: {
      primaryDiagnosis: 'Lupus Nephritis (LN)',
      tags: ['Lupus', 'Glomerulonephritis'],
      nutritionalStatus: 'Well-nourished',
      disability: 'None',
      subspecialityFollowUp: 'Rheumatology',
      smokingStatus: 'No',
      alcoholConsumption: 'No',
      vaccinations: getDefaultVaccinations(),
      pomr: 'SLE diagnosed 2 years ago. Now with active nephritis.',
      aabhaNumber: 'ABHA-444',
      bloodGroup: 'AB+',
      drugAllergies: 'None',
      whatsappNumber: '9898989898',
      hasDiabetes: false,
      onAntiHypertensiveMedication: true,
      onLipidLoweringMedication: false,
    },
    visits: [],
    investigationRecords: []
  },
  {
    id: 'patient-5',
    nephroId: '1005/0824',
    firstName: 'Rohan',
    lastName: 'Gupta',
    dob: '1975-09-01',
    gender: 'Male',
    contact: '9000011111',
    email: 'rohan.gupta@example.com',
    address: { street: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034' },
    guardian: { name: 'Rohan Gupta', relation: 'Self', contact: '9000011111' },
    registrationDate: '2024-03-15',
    createdAt: '2024-03-15T10:00:00.000Z',
    patientStatus: 'OPD',
    isTracked: true,
    residenceType: 'Urban',
    nextAppointmentDate: '2024-08-18',
    clinicalProfile: {
      primaryDiagnosis: 'End-Stage Renal Disease (ESRD)',
      tags: ['ESRD', 'HD', 'Hypertension'],
      nutritionalStatus: 'Well-nourished',
      disability: 'None',
      subspecialityFollowUp: 'NIL',
      smokingStatus: 'Former',
      alcoholConsumption: 'No',
      vaccinations: getExampleVaccinations(),
      pomr: 'Long-standing hypertension leading to ESRD. On maintenance hemodialysis 3 times a week.',
      aabhaNumber: 'ABHA-555',
      bloodGroup: 'O+',
      drugAllergies: 'None',
      whatsappNumber: '9000011111',
      hasDiabetes: false,
      onAntiHypertensiveMedication: true,
      onLipidLoweringMedication: true,
    },
    visits: [],
    investigationRecords: [],
    dialysisSessions: [
        {
            id: 'ds-5-1',
            patientId: 'patient-5',
            dateOfSession: '2024-08-05',
            duration: { hours: 4, minutes: 0 },
            dialysisModality: 'HD',
            accessType: 'AV Fistula',
            ultrafiltration: 2500,
            bloodFlowRate: 350,
            bpBefore: { systolic: 150, diastolic: 90 },
            bpAfter: { systolic: 130, diastolic: 80 },
            complicationsFlag: false,
            indicationOfDialysis: ['CKD'],
            comorbidities: ['HTN'],
            anticoagulation: 'Heparin',
        }
    ]
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
    {
      id: 'appt-1',
      patientId: 'patient-1',
      patientName: 'Aarav Sharma',
      date: '2024-08-24',
      createdAt: '2024-08-05T10:00:00.000Z',
      time: '10:00',
      type: 'Follow-up',
      doctorName: 'Dr. Sachin',
      status: 'Scheduled',
    },
    {
      id: 'appt-2',
      patientId: 'patient-2',
      patientName: 'Isha Singh',
      date: '2024-08-15',
      createdAt: '2024-07-31T10:00:00.000Z',
      time: '11:30',
      type: 'Dialysis Session',
      doctorName: 'Dr. Atul',
      status: 'Scheduled',
    },
    {
      id: 'appt-3',
      patientId: 'patient-4',
      patientName: 'Anjali Menon',
      date: '2024-08-10',
      createdAt: '2024-08-08T10:00:00.000Z',
      time: '09:30',
      type: 'GN Monitoring Visit',
      doctorName: 'Dr. Parikshit',
      status: 'Scheduled',
    },
    {
      id: 'appt-4',
      patientId: 'patient-1',
      patientName: 'Aarav Sharma',
      date: '2024-07-11',
      createdAt: '2024-07-01T10:00:00.000Z',
      time: '10:00',
      type: 'Follow-up',
      doctorName: 'Dr. Sachin',
      status: 'Completed',
    },
    {
      id: 'appt-5',
      patientId: 'patient-4',
      patientName: 'Anjali Menon',
      date: '2024-08-10',
      createdAt: '2024-08-09T10:00:00.000Z',
      time: '14:00',
      type: 'Dialysis Session',
      doctorName: 'Dr. Sachin',
      status: 'Waiting',
    },
    {
      id: 'appt-6',
      patientId: 'patient-2',
      patientName: 'Isha Singh',
      date: '2024-08-10',
      createdAt: '2024-08-09T10:00:00.000Z',
      time: '14:30',
      type: 'Consultation',
      doctorName: 'Dr. Sachin',
      status: 'Waiting',
    },
];
