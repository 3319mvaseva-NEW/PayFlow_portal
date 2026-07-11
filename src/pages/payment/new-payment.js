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

    // Извикваме слушателите веднага след като HTML е рендиран
    setTimeout(() => setupNewPaymentListeners(userId), 0);

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
          <div class="col-12">
            <label class="form-label" for="fileInput">Attach Document (max 100KB)</label>
            <input class="form-control bg-dark text-white border-secondary" id="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png" />
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
    const fileInput = document.getElementById('fileInput');
    const feedback = document.getElementById('formFeedback');
    const container = document.getElementById('pendingRequestsContainer');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const formTitle = document.getElementById('formTitle');
    const contractSelect = document.getElementById('paymentContract');
    let editingId = null;

    async function loadPendingRequests() {
    console.log("Зареждане за User ID:", userId); // 1. Виж в конзолата дали ID-то е правилно

    const { data: pendingRequests, error } = await supabase
        .from('payment_requests')
        .select('*, contracts(contract_number)')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Грешка при зареждане:", error);
        container.innerHTML = '<p class="text-danger">Грешка при зареждане на данните.</p>';
        return;
    }

    console.log("Данни от Supabase:", pendingRequests); // 2. Тук ще видиш дали contracts идва като null

    if (!pendingRequests || pendingRequests.length === 0) {
        container.innerHTML = '<p class="text-secondary">No pending requests.</p>';
        return;
    }

    container.innerHTML = pendingRequests.map(req => {
        // 3. Дебъгване на визуализацията
        const contractInfo = req.contracts ? `Contract: ${req.contracts.contract_number}` : `ID: ${req.contract_id} (Ненамерен договор)`;
        
        return `
          <div class="card mb-2 bg-dark text-white border-secondary">
            <div class="card-body d-flex justify-content-between align-items-center p-3">
              <div>
                <h6 class="mb-0">#${req.invoice_number} - ${req.amount} ${req.currency}</h6>
                <small class="text-secondary">${contractInfo}</small>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-warning edit-btn" data-id="${req.id}">Edit</button>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${req.id}">Delete</button>
              </div>
            </div>
          </div>
        `;
    }).join('');
        

        // Delete Logic
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                await supabase.from('payment_requests').delete().eq('id', btn.dataset.id).eq('user_id', userId);
                loadPendingRequests();
            });
        });

        // Edit Logic
        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const req = pendingRequests.find(r => r.id === btn.dataset.id);
                if (!req) return;
                
                editingId = req.id;
                contractSelect.value = req.contract_id; // Вече ще работи, защото е в DOM
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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = fileInput.files[0];
        let filePath = null;

        if (file) {
            if (file.size > 100 * 1024) return showFeedback('File too large (max 100KB)', 'danger');
            const fileName = `${userId}/${crypto.randomUUID()}.${file.name.split('.').pop()}`;
            const { error: uploadErr } = await supabase.storage.from('payment-documents').upload(fileName, file);
            if (uploadErr) return showFeedback(uploadErr.message, 'danger');
            filePath = fileName;
        }

        const payload = {
            user_id: userId,
            contract_id: contractSelect.value,
            invoice_number: document.getElementById('invoiceNumber').value,
            amount: parseFloat(document.getElementById('paymentAmount').value),
            currency: document.getElementById('paymentCurrency').value.toUpperCase(),
            description: document.getElementById('paymentDescription').value,
            status: 'pending',
            ...(filePath && { file_path: filePath })
        };

        const { error } = editingId 
            ? await supabase.from('payment_requests').update(payload).eq('id', editingId)
            : await supabase.from('payment_requests').insert([payload]);

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
        feedback.textContent = message;
        feedback.className = `alert alert-${type} mb-3`;
        feedback.classList.remove('d-none');
        setTimeout(() => feedback.classList.add('d-none'), 3000);
    }

    loadPendingRequests();
}