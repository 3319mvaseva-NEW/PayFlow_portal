import './new-payment.css';

export function renderNewPayment() {
  return `
    <section class="card page-card shadow-sm border-0">
      <div class="card-body p-4 p-md-5">
        <p class="page-eyebrow">Payments</p>
        <h1 class="page-title">New payment request</h1>
        <p class="page-copy">Create a request and attach the supporting documentation.</p>
        <form class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label" for="paymentTitle">Request title</label>
            <input class="form-control" id="paymentTitle" type="text" placeholder="Office supplies" />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="paymentAmount">Amount</label>
            <input class="form-control" id="paymentAmount" type="number" placeholder="0.00" />
          </div>
          <div class="col-12">
            <label class="form-label" for="paymentNotes">Notes</label>
            <textarea class="form-control" id="paymentNotes" rows="4" placeholder="Add details for the review team"></textarea>
          </div>
          <div class="col-12 d-flex flex-wrap gap-2">
            <button class="btn btn-primary px-4" type="button">Save request</button>
            <button class="btn btn-outline-secondary px-4" type="button">Attach file</button>
          </div>
        </form>
      </div>
    </section>
  `;
}
