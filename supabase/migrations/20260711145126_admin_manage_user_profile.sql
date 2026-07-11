-- Изтриваме евентуални конфликтни политики за user_profiles
DROP POLICY IF EXISTS "Admins manage profiles" ON user_profiles;

-- 1. Политика: Всеки логнат потребител може да чете собствения си профил (нужно за auth)
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- 2. Политика: Администраторите могат да четат всички профили (нужно за isAdmin)
CREATE POLICY "Admins can view all profiles" ON user_profiles
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));