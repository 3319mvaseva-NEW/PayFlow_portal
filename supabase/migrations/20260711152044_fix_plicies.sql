-- 1. Изтриваме политиките за user_profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;

-- 2. Изтриваме грешните публични политики за payment_requests
DROP POLICY IF EXISTS "Users can delete their own pending requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Users can update their own pending requests" ON public.payment_requests;

-- 3. Изтриваме излишните политики за договорите (ще ги предефинираме)
DROP POLICY IF EXISTS "contracts_read_authenticated" ON public.contracts;

-- 4. Създаваме чисти политики за user_profiles
-- Позволява на всеки потребител да вижда себе си И на админа да вижда всичко
CREATE POLICY "user_profiles_policy" ON public.user_profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id OR 
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Създаваме подобрени политики за payment_requests
-- Обединяваме всички операции под една логика за по-лесно управление
DROP POLICY IF EXISTS "payment_requests_select_own" ON public.payment_requests;
DROP POLICY IF EXISTS "payment_requests_insert_own" ON public.payment_requests;
DROP POLICY IF EXISTS "payment_requests_update_own" ON public.payment_requests;
DROP POLICY IF EXISTS "payment_requests_delete_own" ON public.payment_requests;

CREATE POLICY "payment_requests_access_policy" ON public.payment_requests
FOR ALL TO authenticated
USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6. Защита на договорите (Contracts)
CREATE POLICY "contracts_access_policy" ON public.contracts
FOR SELECT TO authenticated
USING (true);