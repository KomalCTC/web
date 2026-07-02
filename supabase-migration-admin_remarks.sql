-- Migration: Add missing columns to existing admin_students table
-- Run this in Supabase SQL Editor if you get "column not found" errors

ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}'::jsonb;
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS admin_remarks TEXT DEFAULT '';
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'password123';
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS roll_number TEXT;
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS payments JSONB DEFAULT '[]'::jsonb;
