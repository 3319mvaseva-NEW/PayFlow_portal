-- Само новите политики за vendors, които липсват
CREATE POLICY "Admins can view all vendors" ON vendors
FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all vendors" ON vendors
FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can insert new vendors" ON vendors
FOR INSERT WITH CHECK (is_admin());