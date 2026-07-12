-- 1. Премахваме старата политика (добра практика)
DROP POLICY IF EXISTS "Admins can update user profiles" ON public.user_profiles;

-- 2. Създаваме новата политика с включен WITH CHECK
CREATE POLICY "Admins can update user profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);