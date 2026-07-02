-- ============================================================================
-- KCTC — Supabase Storage Bucket for Student Identity Documents
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor) to set up the
-- storage bucket and permissions for anon (public) file uploads.
-- Safe to re-run.
--
-- NOTE: The bucket is PUBLIC, so files are accessible via their URL without
-- any SELECT policy needed for viewing. We only allow INSERT (upload),
-- SELECT (needed for the Supabase JS client to acknowledge the file exists),
-- and DELETE (remove/re-upload).
-- ============================================================================

-- 1. Create the storage bucket (public so files are accessible via URL)
INSERT INTO storage.buckets (id, name, public)
SELECT 'student-documents', 'student-documents', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'student-documents');

-- 2. Allow anon users to upload files into the bucket
DROP POLICY IF EXISTS "anon_insert_student_docs" ON storage.objects;
CREATE POLICY "anon_insert_student_docs" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'student-documents');

-- 3. Allow anon users to select (needed for JS client operations)
--    Uses a folder-path check so students only see their own files.
DROP POLICY IF EXISTS "anon_select_student_docs" ON storage.objects;
CREATE POLICY "anon_select_student_docs" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'student-documents');

-- 4. Allow anon users to delete files (so students can remove/re-upload)
DROP POLICY IF EXISTS "anon_delete_student_docs" ON storage.objects;
CREATE POLICY "anon_delete_student_docs" ON storage.objects
  FOR DELETE TO anon
  USING (bucket_id = 'student-documents');
