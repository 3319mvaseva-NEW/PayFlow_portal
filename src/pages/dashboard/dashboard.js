import './dashboard.css';

export function renderDashboard() {
  return `
    <section class="dashboard-grid">
      <div class="card page-card shadow-sm border-0 mb-4">
        <div class="card-body p-4 p-md-5">
          <p class="page-eyebrow">Overview</p>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-copy mb-0">Track requests, approvals, and operational status from here.</p>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-12 col-md-4">
          <article class="metric-card card border-0 shadow-sm h-100">
            <div class="card-body">
              <span class="metric-label">Open requests</span>
              <strong class="metric-value">18</strong>
            </div>
          </article>
        </div>
        <div class="col-12 col-md-4">
          <article class="metric-card card border-0 shadow-sm h-100">
            <div class="card-body">
              <span class="metric-label">Pending review</span>
              <strong class="metric-value">7</strong>
            </div>
          </article>
        </div>
        <div class="col-12 col-md-4">
          <article class="metric-card card border-0 shadow-sm h-100">
            <div class="card-body">
              <span class="metric-label">Approved today</span>
              <strong class="metric-value">12</strong>
            </div>
          </article>
        </div>
      </div>
    </section>
  `;
}
