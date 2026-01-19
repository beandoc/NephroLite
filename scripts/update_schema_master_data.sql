-- Create investigation_master_list table
CREATE TABLE IF NOT EXISTS investigation_master_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    group_name TEXT NOT NULL,
    unit TEXT,
    normal_range TEXT,
    result_type TEXT DEFAULT 'numeric',
    options JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investigation_panels table
CREATE TABLE IF NOT EXISTS investigation_panels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    group_name TEXT NOT NULL,
    test_ids JSONB, -- Array of test UUIDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_investigation_master_name ON investigation_master_list(name);
CREATE INDEX IF NOT EXISTS idx_investigation_panels_name ON investigation_panels(name);
