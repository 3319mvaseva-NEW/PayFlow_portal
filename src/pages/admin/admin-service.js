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
  const { data, error } = await supabase
    .from('payment_requests')
    .select('*, user_profiles(role)')
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