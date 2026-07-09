import './new-payment.css';
import { supabase } from '../../services/supabase.js';
import { getAuthState } from '../../services/auth.js';

export async function renderNewPayment() {
  const authState = getAuthState();
  const userId = authState.user?.id;
  
  let contractOptions = '<option value="">No active contracts found</option>';

  if (userId) {
    // Временно използваме BluePeak ID за тест, докато направим профилната таблица в следващата стъпка
    const userVendorId = authState.user?.user_metadata?.vendor_id 
                         || 'a758468f-3111-48f8-a416-531876bdd9';

    const { data: contracts, error } = await supabase
      .from('contracts')
      .select('id, contract_number')
      .eq('vendor_id', userVendorId);

    if (!error && contracts && contracts.length > 0) {
      contractOptions = contracts
        .map(c => `<option value="${c.id}">Contract #${c.contract_number}</option>`)
        .join('');
    }
  }

  return `
    <section class="card page-card payment-form-card">
      <div class="card-body p-4 p-md-5">
        <p class="page-eyebrow">Payments</p>
        <h1 class="page-title mb-4">New payment request</h1>
        
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
            <button class="btn btn-primary px-4" type="submit">Save request</button>
            <button class="btn btn-outline-secondary px-4" type="button" disabled>Attach file (Coming soon)</button>
          </div>
        </form>
      </div>
    </section>
  `;
}