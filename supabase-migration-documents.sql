-- ============================================================================
-- KCTC — Migration: Add document upload & admin remarks columns
-- Run this in Supabase SQL Editor to add the new columns for the
-- identity documents feature (Aadhar, marksheets, photos, etc.).
-- Safe to re-run — uses IF NOT EXISTS.
-- ============================================================================

ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}'::jsonb;
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS admin_remarks TEXT DEFAULT '';
