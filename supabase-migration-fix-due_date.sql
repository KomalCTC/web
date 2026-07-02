-- ============================================================================
-- KCTC — Add ALL columns the frontend sends to admin_students
-- Run this ONCE in Supabase SQL Editor, then go to
-- Settings → API → scroll down → click "Refresh Schema Cache"
-- (or the line at the bottom does it automatically)
-- ============================================================================

-- Add every column the frontend object contains
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS roll_number TEXT;
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS due_date TEXT;
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS payments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}'::jsonb;
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS admin_remarks TEXT DEFAULT '';
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'password123';
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS qualification TEXT;
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS residence TEXT;
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS dob TEXT;
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS fees_amount INTEGER DEFAULT 4500;

-- Force PostgREST to reload its schema cache (so it sees the new columns immediately)
NOTIFY pgrst, 'reload schema';
