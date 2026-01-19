
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nephro_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dob DATE,
    gender TEXT,
    phone TEXT,
    email TEXT,
    address JSONB,
    guardian JSONB,
    clinical_profile JSONB,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    migrated_from_id TEXT, -- Original Firestore ID
    is_tracked BOOLEAN DEFAULT TRUE,
    patient_status TEXT
);

-- visits table
CREATE TABLE IF NOT EXISTS visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE,
    visit_type TEXT,
    visit_remark TEXT,
    group_name TEXT,
    clinical_data JSONB,
    diagnoses JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    migrated_from_id TEXT
);

-- dialysis_sessions table
CREATE TABLE IF NOT EXISTS dialysis_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    date_of_session TIMESTAMP WITH TIME ZONE,
    type_of_dialysis TEXT,
    duration JSONB,
    stats JSONB, -- BP, weight, etc.
    details JSONB, -- All other fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    migrated_from_id TEXT
);

-- investigation_records table
CREATE TABLE IF NOT EXISTS investigation_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE,
    tests JSONB, -- Array of test results
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    migrated_from_id TEXT
);

    migrated_from_id TEXT
);

-- interventions table
CREATE TABLE IF NOT EXISTS interventions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE,
    type TEXT,
    details JSONB,
    notes TEXT,
    complications TEXT,
    attachments JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    migrated_from_id TEXT
);

-- appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    date DATE,
    time TEXT,
    status TEXT,
    type TEXT,
    doctor_name TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    migrated_from_id TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_patients_nephro_id ON patients(nephro_id);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(date);
CREATE INDEX IF NOT EXISTS idx_dialysis_patient_id ON dialysis_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
