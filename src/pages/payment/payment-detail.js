import './payment-detail.css';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderPaymentDetail(id) {
  const safeId = escapeHtml(id);

  return `
    <section class="card page-card shadow-sm border-0">
      <div class="card-body p-4 p-md-5">
        <p class="page-eyebrow">Payment request</p>
        <h1 class="page-title">Request #${safeId}</h1>
        <p class="page-copy">This page is ready to render request-specific details for a payment ID.</p>
        <div class="detail-grid">
          <div>
            <span class="detail-label">Status</span>
            <strong class="detail-value">Under review</strong>
          </div>
          <div>
            <span class="detail-label">Amount</span>
            <strong class="detail-value">$1,200.00</strong>
          </div>
          <div>
            <span class="detail-label">Owner</span>
            <strong class="detail-value">Operations Team</strong>
          </div>
        </div>
        <div class="detail-summary">
          Payment routing, attachment validation, and contract reference details can be expanded here.
        </div>
      </div>
    </section>
  `;
}
