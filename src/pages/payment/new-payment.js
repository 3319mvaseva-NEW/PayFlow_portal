import './new-payment.css';
import { supabase } from '../../services/supabase.js';
import { getAuthState } from '../../services/auth.js';

export async function renderNewPayment() {
  const authState = getAuthState();
  const userId = authState.user?.id;
  
  let contractOptions = '<option value="">No active contracts found</option>';

  if (userId) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('vendor_id')
      .eq('id', userId)
      .single();

    if (profile?.vendor_id) {
      const { data: contracts } = await supabase
        .from('contracts')
        .select('id, contract_number')
        .eq('vendor_id', profile.vendor_id);

      if (contracts && contracts.length > 0) {
        contractOptions = contracts
          .map(c => `<option value="${c.id}">Contract #${c.contract_number}</option>`)
          .join('');
      }
    }
  }

  setTimeout(() => {
    setupNewPaymentListeners(userId);
  }, 0);

  return `
    <section class="card page-card payment-form-card">
      <div class="card-body p-4 p-md-5">
        <p class="page-eyebrow">Payments</p>
        <h1 class="page-title mb-4" id="formTitle">New payment request</h1>
        
        <div id="formFeedback" class="alert d-none mb-3"></div>

        <form class="row g-3" id="paymentRequestForm">
          <div class="col-12 col-md-6">
            <label class="form-label" for="paymentContract">Select Contract</label>
            <select class="form-select text-white bg-dark border-secondary" id="paymentContract" required>
              <option value="" selected disabled>Choose a contract...</option>
              ${contractOptions}
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="invoiceNumber">Invoice Number</label>
            <input class="form-control" id="invoiceNumber" type="text" placeholder="e.g. INV-2026-001" required />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="paymentAmount">Amount</label>
            <input class="form-control" id="paymentAmount" type="number" step="0.01" placeholder="0.00" required />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="paymentCurrency">Currency</label>
            <input class="form-control" id="paymentCurrency" type="text" value="USD" maxlength="3" required />
          </div>
          <div class="col-12">
            <label class="form-label" for="paymentDescription">Description / Notes</label>
            <textarea class="form-control" id="paymentDescription" rows="4" placeholder="Add details or context for the review team..."></textarea>
          </div>
          <div class="col-12 d-flex flex-wrap gap-2 mt-4">
            <button class="btn btn-primary px-4" type="submit" id="submitBtn">Save request</button>
            <button class="btn btn-outline-warning px-4 d-none" type="button" id="cancelBtn">Cancel Edit</button>
          </div>
        </form>
      </div>
    </section>

    <section class="mt-4">
      <h3 class="text-white mb-3">My Pending Requests</h3>
      <div id="pendingRequestsContainer"><div class="text-secondary">Loading...</div></div>
    </section>
  `;
}

function setupNewPaymentListeners(userId) {
  const form = document.getElementById('paymentRequestForm');
  const feedback = document.getElementById('formFeedback');
  const container = document.getElementById('pendingRequestsContainer');
  const submitBtn = document.getElementById('submitBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const formTitle = document.getElementById('formTitle');
  
  let editingId = null;

  async function loadPendingRequests() {
    const { data: pendingRequests } = await supabase
      .from('payment_requests')
      .select('*, contracts(contract_number)')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (!pendingRequests || pendingRequests.length === 0) {
      container.innerHTML = '<p class="text-secondary">No pending requests.</p>';
      return;
    }

    container.innerHTML = pendingRequests.map(req => `
      <div class="card mb-2 bg-dark text-white border-secondary">
        <div class="card-body d-flex justify-content-between align-items-center p-3">
          <div>
            <h6 class="mb-0">#${req.invoice_number} - ${req.amount} ${req.currency}</h6>
            <small class="text-secondary">Contract: ${req.contracts?.contract_number || 'N/A'}</small>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-warning edit-btn" data-id="${req.id}">Edit</button>
            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${req.id}">Delete</button>
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await supabase.from('payment_requests').delete().eq('id', btn.dataset.id);
        loadPendingRequests();
      });
    });

    container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const req = pendingRequests.find(r => r.id === btn.dataset.id);
        editingId = req.id;
        document.getElementById('paymentContract').value = req.contract_id;
        document.getElementById('invoiceNumber').value = req.invoice_number;
        document.getElementById('paymentAmount').value = req.amount;
        document.getElementById('paymentCurrency').value = req.currency;
        document.getElementById('paymentDescription').value = req.description;
        
        formTitle.textContent = 'Edit payment request';
        submitBtn.textContent = 'Update request';
        cancelBtn.classList.remove('d-none');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  cancelBtn.addEventListener('click', () => {
    editingId = null;
    form.reset();
    formTitle.textContent = 'New payment request';
    submitBtn.textContent = 'Save request';
    cancelBtn.classList.add('d-none');
  });

  loadPendingRequests();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      user_id: userId,
      contract_id: document.getElementById('paymentContract').value,
      invoice_number: document.getElementById('invoiceNumber').value,
      amount: parseFloat(document.getElementById('paymentAmount').value),
      currency: document.getElementById('paymentCurrency').value.toUpperCase(),
      description: document.getElementById('paymentDescription').value,
      status: 'pending'
    };

    let error;
    if (editingId) {
      const { error: updErr } = await supabase.from('payment_requests').update(payload).eq('id', editingId);
      error = updErr;
    } else {
      const { error: insErr } = await supabase.from('payment_requests').insert([payload]);
      error = insErr;
    }

    if (error) {
      showFeedback(`Error: ${error.message}`, 'danger');
    } else {
      showFeedback(editingId ? 'Updated successfully!' : 'Submitted successfully!', 'success');
      form.reset();
      cancelBtn.click();
      loadPendingRequests();
    }
  });

  function showFeedback(message, type) {
    if (!feedback) return;
    
    feedback.textContent = message;
    feedback.className = `alert alert-${type} mb-3`;
    feedback.classList.remove('d-none');
    
    // Автоматично скриване след 3 секунди (3000 милисекунди)
    setTimeout(() => {
      feedback.classList.add('d-none');
    }, 3000);
  }
}