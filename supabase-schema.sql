-- ============================================================================
-- KCTC (Komal Creations Training Center) — Supabase Schema
-- Run this entire script in your Supabase SQL Editor (Dashboard → SQL Editor).
-- It creates all tables with the exact field names used by the frontend.
-- ============================================================================

-- Enable UUID generation (already on by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. admin_students  — Student enrollment registry
--    The frontend checks for this table first before falling back to
--    'students' or 'profiles'.
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    father_name TEXT,
    dob DATE,
    gender TEXT,
    qualification TEXT,
    residence TEXT,
    phone TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT DEFAULT 'password123',
    enrolled_course TEXT,
    fees_paid BOOLEAN DEFAULT FALSE,
    fees_amount INTEGER DEFAULT 4500,
    email_verified BOOLEAN DEFAULT FALSE,
    enrollment_status TEXT DEFAULT 'pending',
    documents JSONB DEFAULT '{}'::jsonb,
    admin_remarks TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 2. inquiries  — Lead capture from the inquiry/estimator form
-- ============================================================================
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    age INTEGER,
    course_interested TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 3. certificates  — Issued diploma certificates for public verification
-- ============================================================================
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    father_name TEXT,
    roll_number TEXT UNIQUE NOT NULL,
    course_name TEXT,
    passing_year INTEGER,
    grade TEXT,
    verification_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast certificate lookup by code or roll number
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_certificates_roll_number ON certificates(roll_number);

-- ============================================================================
-- 4. courses  — Academy course catalog managed via admin panel
-- ============================================================================
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    duration TEXT NOT NULL,
    level TEXT NOT NULL,
    icon TEXT DEFAULT '📐',
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add new columns to existing table (safe to re-run)
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}'::jsonb;
ALTER TABLE admin_students ADD COLUMN IF NOT EXISTS admin_remarks TEXT DEFAULT '';

-- Drop old sample data if it exists from previous scripts
DELETE FROM admin_students WHERE email IN ('priya@gmail.com', 'komal@gmail.com');
DELETE FROM certificates WHERE roll_number = 'CERT-101' OR verification_code = 'KCTC-94A2D';
DELETE FROM certificates WHERE roll_number IN ('CERT-101', 'KCTC-2025-089', 'KCTC-2026-012');

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- The frontend uses the Supabase anon key directly (no server-side auth), so
-- we grant full CRUD access to the anon role for all tables.
-- Policies are dropped first so the script is safe to run multiple times.
-- ============================================================================
ALTER TABLE admin_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- admin_students: anon full access
DROP POLICY IF EXISTS "anon_select_admin_students" ON admin_students;
DROP POLICY IF EXISTS "anon_insert_admin_students" ON admin_students;
DROP POLICY IF EXISTS "anon_update_admin_students" ON admin_students;
DROP POLICY IF EXISTS "anon_delete_admin_students" ON admin_students;
CREATE POLICY "anon_select_admin_students" ON admin_students FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_admin_students" ON admin_students FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_admin_students" ON admin_students FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_admin_students" ON admin_students FOR DELETE TO anon USING (true);

-- inquiries: anon full access
DROP POLICY IF EXISTS "anon_select_inquiries" ON inquiries;
DROP POLICY IF EXISTS "anon_insert_inquiries" ON inquiries;
DROP POLICY IF EXISTS "anon_update_inquiries" ON inquiries;
DROP POLICY IF EXISTS "anon_delete_inquiries" ON inquiries;
CREATE POLICY "anon_select_inquiries" ON inquiries FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_inquiries" ON inquiries FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_inquiries" ON inquiries FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_inquiries" ON inquiries FOR DELETE TO anon USING (true);

-- certificates: anon full access
DROP POLICY IF EXISTS "anon_select_certificates" ON certificates;
DROP POLICY IF EXISTS "anon_insert_certificates" ON certificates;
DROP POLICY IF EXISTS "anon_update_certificates" ON certificates;
DROP POLICY IF EXISTS "anon_delete_certificates" ON certificates;
CREATE POLICY "anon_select_certificates" ON certificates FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_certificates" ON certificates FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_certificates" ON certificates FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_certificates" ON certificates FOR DELETE TO anon USING (true);

-- courses: anon full access
DROP POLICY IF EXISTS "anon_select_courses" ON courses;
DROP POLICY IF EXISTS "anon_insert_courses" ON courses;
DROP POLICY IF EXISTS "anon_update_courses" ON courses;
DROP POLICY IF EXISTS "anon_delete_courses" ON courses;
CREATE POLICY "anon_select_courses" ON courses FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_courses" ON courses FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_courses" ON courses FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_courses" ON courses FOR DELETE TO anon USING (true);

-- ============================================================================
-- Done. No seed data — the app starts with empty tables.
-- After running this, go to Admin Panel → Supabase Config on the website,
-- enter your Supabase URL + anon key, and click Save & Active.
-- ============================================================================
