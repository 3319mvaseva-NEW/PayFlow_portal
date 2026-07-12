-- 1. Добавяме колоната email в таблицата user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email text;

-- 2. Обновяваме функцията, за да записва имейла при регистрация
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, role, email)
  VALUES (new.id, 'user', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. (Опционално) Ако вече имаш данни, можем да ги синхронизираме 
-- За да не го правим ръчно за всички:
UPDATE public.user_profiles up
SET email = au.email
FROM auth.users au
WHERE up.id = au.id;