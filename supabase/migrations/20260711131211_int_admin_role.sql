-- 1. Добавяне на роля в user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

ALTER TABLE user_profiles ADD CONSTRAINT check_valid_role 
CHECK (role IN ('user', 'admin'));

-- 2. Създаване на помощна функция за админи
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Активиране на RLS (ако не е включено вече за тези таблици)
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

-- 4. Политики за администратори
-- Забележка: Тези се добавят към вече съществуващите политики
CREATE POLICY "Admins can view all payments" ON payment_requests
FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all payments" ON payment_requests
FOR UPDATE USING (is_admin());

-- Добави същите политики и за договорите, ако искаш админ да ги управлява
CREATE POLICY "Admins can view all contracts" ON contracts
FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all contracts" ON contracts
FOR ALL USING (is_admin());