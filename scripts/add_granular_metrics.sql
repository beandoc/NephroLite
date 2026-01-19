
-- 1. Add granular metric columns to dialysis_sessions
ALTER TABLE dialysis_sessions 
ADD COLUMN IF NOT EXISTS systolic_bp INTEGER,
ADD COLUMN IF NOT EXISTS diastolic_bp INTEGER,
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS uf_volume_ml INTEGER;

-- 2. Add granular metric columns to visits
ALTER TABLE visits 
ADD COLUMN IF NOT EXISTS systolic_bp INTEGER,
ADD COLUMN IF NOT EXISTS diastolic_bp INTEGER,
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5,2);

-- 3. Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_dialysis_systolic ON dialysis_sessions(systolic_bp);
CREATE INDEX IF NOT EXISTS idx_dialysis_weight ON dialysis_sessions(weight_kg);
CREATE INDEX IF NOT EXISTS idx_visits_systolic ON visits(systolic_bp);
