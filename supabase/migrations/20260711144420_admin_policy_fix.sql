-- 1. Списък с всички таблици, които изискват административен достъп
-- Изпълняваме за: vendors, contracts, payment_requests, user_profiles

-- Премахваме грешните политики за public
DROP POLICY IF EXISTS "Admins can insert new vendors" ON vendors;
DROP POLICY IF EXISTS "Admins can update all vendors" ON vendors;
DROP POLICY IF EXISTS "Admins can view all vendors" ON vendors;
DROP POLICY IF EXISTS "Admins can update all contracts" ON contracts;
DROP POLICY IF EXISTS "Admins can view all contracts" ON contracts;
DROP POLICY IF EXISTS "Admins can update all payments" ON payment_requests;
DROP POLICY IF EXISTS "Admins can view all payments" ON payment_requests;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- 2. Създаваме коректни политики за authenticated, проверяващи за 'admin' роля
-- Използваме универсален подход за всяка таблица:

CREATE POLICY "Admins manage vendors" ON vendors FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins manage contracts" ON contracts FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins manage payments" ON payment_requests FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins manage profiles" ON user_profiles FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));