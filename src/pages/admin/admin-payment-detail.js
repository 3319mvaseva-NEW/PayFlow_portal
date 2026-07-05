import './admin-payment-detail.css';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderAdminPaymentDetail(id) {
  const safeId = escapeHtml(id);

  return `
    <section class="card page-card shadow-sm border-0">
      <div class="card-body p-4 p-md-5">
        <p class="page-eyebrow">Admin review</p>
        <h1 class="page-title">Payment #${safeId}</h1>
        <p class="page-copy">Admin-specific review tools for a payment request belong here.</p>
        <div class="review-toolbar">
          <button class="btn btn-success px-4" type="button">Approve</button>
          <button class="btn btn-warning px-4" type="button">Flag</button>
          <button class="btn btn-danger px-4" type="button">Reject</button>
        </div>
      </div>
    </section>
  `;
}
