import { supabase } from '../../services/supabase.js'

/**
 * Проверява дали текущият автентикиран потребител има роля 'admin'
 */
export async function isAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !data) {
    console.error('Грешка при проверката на администраторските права:', error);
    return false;
  }

  return data.role === 'admin';
}

/**
 * Взима чакащите заявки за плащане (статус 'pending' или 'in review')
 */
export async function getPendingPayments() {
  // Първо вземаме всички заявки
  const { data, error } = await supabase
    .from('payment_requests')
    .select('*')
    .in('status', ['pending', 'in review'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return data; 
}

/**
 * Променя статуса на конкретна заявка
 */
export async function updatePaymentStatus(paymentId, newStatus) {
  const { data, error } = await supabase
    .from('payment_requests')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', paymentId);

  if (error) throw error;
  return data;
}
/**
 * Създава нов вендор
 */
export async function createVendor(vendorName) {
  if (!(await isAdmin())) throw new Error("Неоторизиран достъп");

  const { data, error } = await supabase
    .from('vendors')
    .insert([{ vendor_name: vendorName }]);

  if (error) throw error;
  return data;
}

/**
 * Създава нов договор към специфичен вендор
 */
export async function createContract(contractData) {
  if (!(await isAdmin())) throw new Error("Неоторизиран достъп");

  const { data, error } = await supabase
    .from('contracts')
    .insert([contractData]); // contractData трябва да съдържа vendor_id, contract_number и т.н.

  if (error) throw error;
  return data;
}

/**
 * Обвързва потребител с вендор чрез актуализация на user_profiles
 */
export async function assignUserToVendor(userId, vendorId) {
  if (!(await isAdmin())) throw new Error("Неоторизиран достъп");

  const { data, error } = await supabase
    .from('user_profiles')
    .update({ vendor_id: vendorId })
    .eq('id', userId);

  if (error) throw error;
  return data;
}

export async function getUsersWithProfiles() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, role, vendor_id, auth_users(email)'); // Предполагаме връзка към auth.users
  if (error) throw error;
  return data;
}
/**
 * Взима всички вендори
 */
export async function getVendors() {
    const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('vendor_name', { ascending: true });
    
    if (error) throw error;
    return data;
}

/**
 * Редактира съществуващ вендор
 */
export async function updateVendor(vendorId, newName) {
    if (!(await isAdmin())) throw new Error("Unauthorized access");

    const { data, error } = await supabase
        .from('vendors')
        .update({ vendor_name: newName })
        .eq('id', vendorId);

    if (error) throw error;
    return data;
}