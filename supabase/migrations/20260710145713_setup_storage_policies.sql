-- 1. Регистрираме кофата (bucket), ако липсва
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-documents', 'payment-documents', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Политика за КАЧВАНЕ (INSERT)
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Политика за ЧЕТЕНЕ (SELECT)
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'payment-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 4. Политика за ИЗТРИВАНЕ (DELETE)
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'payment-documents' AND (storage.foldername(name))[1] = auth.uid()::text);supabase db push