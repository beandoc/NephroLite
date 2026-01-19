-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Logical link to auth.users or profiles.id
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Index for templates
CREATE INDEX IF NOT EXISTS idx_templates_user_name ON templates(user_id, name);

-- Create master_diagnoses table
CREATE TABLE IF NOT EXISTS master_diagnoses (
    id TEXT PRIMARY KEY, -- Using the text ID from application logic (e.g. 'chronic_kidney_disease')
    user_id UUID NOT NULL,
    clinical_diagnosis TEXT NOT NULL,
    icd_mappings JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for master_diagnoses
CREATE INDEX IF NOT EXISTS idx_master_diagnoses_user ON master_diagnoses(user_id);
