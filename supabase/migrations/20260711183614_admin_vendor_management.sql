-- Корекция за таблица 'vendors'
DROP POLICY IF EXISTS "Admins manage vendors" ON public.vendors;

CREATE POLICY "Admins manage vendors" ON public.vendors
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);