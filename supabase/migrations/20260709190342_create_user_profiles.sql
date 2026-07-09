-- Създаване на профилна таблица, свързваща потребителите с вендорите
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL,
  updated_at timestamptz DEFAULT now()
);

-- Активиране на RLS за сигурност
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Политика: Всеки потребител може да чете своя собствен профил
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = id);

-- Политика: Администраторите могат да управляват всички профили
CREATE POLICY "Admins can manage all profiles" 
ON public.user_profiles FOR ALL 
USING (true); -- Впоследствие тук ще добавим проверка за администраторска роля