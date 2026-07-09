import './payment-detail.css';
import { supabase } from '../../services/supabase.js';
import { getAuthState } from '../../services/auth.js';

export async function renderPaymentDetail(id) {
  const authState = getAuthState();
  const currentUserId = authState.user?.id;

  // 1. Извличаме детайлите за плащането от Supabase
  const { data: request, error } = await supabase
    .from('payment_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !request) {
    return `
      <section class="card page-card shadow-sm border-0">
        <div class="card-body p-4 p-md-5 text-center">
          <p class="page-eyebrow">Error</p>
          <h1 class="page-title">Request Not Found</h1>
          <p class="page-copy text-danger">${error?.message || 'The requested payment document could not be loaded.'}</p>
          <a href="/dashboard" data-app-link class="btn btn-outline-primary mt-3">Back to Dashboard</a>
        </div>
      </section>
    `;
  }

  // 2. Проверка за права: Само автора може да редактира/изтрива и САМО ако статусът е 'pending'
  const isOwner = request.user_id === currentUserId;
  const isPending = request.status === 'pending';
  const canModify = isOwner && isPending;

  // Хелпър за цвят на статуса (Bootstrap бадж)
  const statusColors = {
    pending: 'bg-warning text-dark',
    in_review: 'bg-info text-dark',
    approved: 'bg-success text-white',
    paid: 'bg-primary text-white',
    rejected: 'bg-danger text-white'
  };
  const statusBadge = statusColors[request.status] || 'bg-secondary';

  return `
    <section class="card page-card shadow-sm border-0">
      <div class="card-body p-4 p-md-5">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <p class="page-eyebrow">Payment request</p>
            <h1 class="page-title mb-0">Invoice #${request.invoice_number || 'N/A'}</h1>
          </div>
          <div>
            <span class="badge ${statusBadge} px-3 py-2 fs-6 rounded-pill">${request.status.toUpperCase()}</span>
          </div>
        </div>

        <div id="detailFeedback" class="alert d-none mb-3"></div>

        <div class="detail-grid">
          <div>
            <span class="detail-label">Amount</span>
            <strong class="detail-value fs-4">${request.currency || 'USD'} ${Number(request.amount).toFixed(2)}</strong>
          </div>
          <div>
            <span class="detail-label">Request ID</span>
            <strong class="detail-value text-muted" style="font-size: 0.85rem;">${request.id}</strong>
          </div>
          <div>
            <span class="detail-label">Created At</span>
            <strong class="detail-value">${new Date(request.created_at).toLocaleDateString()}</strong>
          </div>
        </div>

        <div class="detail-summary">
          <span class="detail-label d-block mb-1">Notes / Description:</span>
          <div>${request.description || '<em>No notes provided for this request.</em>'}</div>
        </div>

        <div class="mt-4 d-flex flex-wrap gap-2 justify-content-between w-100">
          <div>
            <a href="/dashboard" data-app-link class="btn btn-outline-secondary px-4">Back to Dashboard</a>
          </div>
          
          ${canModify ? `
            <div class="d-flex gap-2" id="action-buttons-container" data-id="${request.id}">
              <button class="btn btn-warning px-4 text-dark" id="btn-edit-request">Edit request</button>
              <button class="btn btn-danger px-4" id="btn-delete-request">Delete request</button>
            </div>
          ` : `
            ${isOwner ? `
              <div class="text-muted fst-italic align-self-center" style="font-size: 0.9rem;">
                <i class="bi bi-lock-fill"></i> Locked: Cannot modify request in <strong>${request.status}</strong> state.
              </div>
            ` : ''}
          `}
        </div>
      </div>
    </section>
  `;
}