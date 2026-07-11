-- 1. Премахваме старата политика, която предизвиква рекурсията
DROP POLICY IF EXISTS "user_profiles_policy" ON public.user_profiles;

-- 2. Създаваме SECURITY DEFINER функция, която заобикаля RLS рекурсията
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Създаваме новата, стабилна RLS политика
CREATE POLICY "user_profiles_policy" ON public.user_profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id OR public.is_admin()
);