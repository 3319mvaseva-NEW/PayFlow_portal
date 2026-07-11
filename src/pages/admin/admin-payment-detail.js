import { supabase } from '../../services/supabase.js';
import { updatePaymentStatus } from './admin-service.js';
import { loadReviewQueue } from './admin.js';
import Swal from 'sweetalert2'; // Увери се, че си добавила импорта

// Дефинираме Toast-а тук
const Toast = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#1e293b',
    color: '#fff'
});

export async function renderAdminPaymentDetail(id) {
  // 1. Вземи детайлите от Supabase
  const { data: payment, error } = await supabase
    .from('payment_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return `<p class="text-danger p-4">Error in loading the request: ${error.message}</p>`;

  // 2. Генериране на сигурен линк към файла в Storage
  let documentLink = 'No attached document';
  if (payment.file_path) {
    const { data, error: storageError } = await supabase.storage
      .from('payment-documents') // Увери се, че това е точното име на твоя Bucket
      .createSignedUrl(payment.file_path, 60);

    if (storageError) {
      documentLink = '<span class="text-danger">Error accessing the file</span>';
    } else {
      documentLink = `<a href="${data.signedUrl}" target="_blank" class="btn btn-sm btn-info">Download Document</a>`;
    }
  }

  // 3. Рендирай с реални бутони
  return `
    <section class="card page-card shadow-sm border-0 bg-dark text-light">
      <div class="card-body p-4 p-md-5">
        <h1 class="page-title">Payment #${payment.invoice_number}</h1>
        <p><strong>Amount:</strong> ${payment.amount} ${payment.currency}</p>
        <p><strong>Description:</strong> ${payment.description}</p>
        <p><strong>File:</strong> ${documentLink}</p>
        
        <div class="review-toolbar mt-4">
          <button class="btn btn-success px-4" id="approveBtn">Approve</button>
          <button class="btn btn-danger px-4" id="rejectBtn">Reject</button>
          <button class="btn btn-secondary px-4" id="backBtn">Back</button>
        </div>
      </div>
    </section>
  `;
}

// 4. Инициализиране на логиката
export function initPaymentDetailLogic(id) {
  document.getElementById('approveBtn')?.addEventListener('click', () => handleAction(id, 'approved'));
  document.getElementById('rejectBtn')?.addEventListener('click', () => handleAction(id, 'rejected'));
  
  // Бутон за връщане обратно към опашката
  document.getElementById('backBtn')?.addEventListener('click', () => {
    loadReviewQueue(); // Връща потребителя в списъка
  });
}

async function handleAction(id, status) {
  try {
    await updatePaymentStatus(id, status);
    // Използваме Toast вместо alert
    Toast.fire({
      icon: 'success',
      title: 'Successfully updated to ' + status
    });
    loadReviewQueue(); 
  } catch (err) {
    Toast.fire({
      icon: 'error',
      title: 'Error: ' + err.message
    });
  }
}