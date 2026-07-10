-- Премахваме съществуващата политика, ако съществува, за да я презапишем чисто
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;

-- Създаваме новата политика с прецизна проверка на пътя (user_id/filename)
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-documents' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Важно: Увери се, че имаш и политика за Select (за да могат потребителите да виждат собствените си файлове)
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-documents' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);