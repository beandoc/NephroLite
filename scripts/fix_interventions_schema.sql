-- Create interventions table if it doesn't exist
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

-- Index for interventions
CREATE INDEX IF NOT EXISTS idx_interventions_patient_id ON interventions(patient_id);
CREATE INDEX IF NOT EXISTS idx_interventions_date ON interventions(date);
