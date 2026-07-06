import './dashboard.css';

export function renderDashboard() {
  return `
    <section class="dashboard-grid">
      <div class="card page-card mb-4">
        <div class="card-body p-4 p-md-5">
          <p class="page-eyebrow">Overview</p>
          <h1 class="page-title">Dashboard control center</h1>
          <p class="page-copy mb-0">Track requests, approvals, and operational status from one clean workspace.</p>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-12 col-md-4">
          <article class="metric-card card h-100">
            <div class="card-body">
              <i class="bi bi-inboxes metric-icon"></i>
              <span class="metric-label">Open requests</span>
              <strong class="metric-value">18</strong>
            </div>
          </article>
        </div>
        <div class="col-12 col-md-4">
          <article class="metric-card card h-100">
            <div class="card-body">
              <i class="bi bi-hourglass-split metric-icon"></i>
              <span class="metric-label">Pending review</span>
              <strong class="metric-value">7</strong>
            </div>
          </article>
        </div>
        <div class="col-12 col-md-4">
          <article class="metric-card card h-100">
            <div class="card-body">
              <i class="bi bi-check2-circle metric-icon"></i>
              <span class="metric-label">Approved today</span>
              <strong class="metric-value">12</strong>
            </div>
          </article>
        </div>
      </div>

      <div class="row g-4 mt-1">
        <div class="col-12 col-lg-8">
          <article class="card page-card h-100">
            <div class="card-body p-4 p-md-5">
              <div class="d-flex flex-wrap justify-content-between gap-3 align-items-start mb-4">
                <div>
                  <p class="page-eyebrow">Processing queue</p>
                  <h2 class="section-title">Recent activity</h2>
                </div>
                <span class="status-badge"><i class="bi bi-signal"></i> Live updates enabled</span>
              </div>

              <div class="activity-list">
                <div class="activity-item">
                  <span class="activity-dot"></span>
                  <div>
                    <strong>Contract renewed</strong>
                    <p>ACME Logistics pushed a new payment schedule for Q3.</p>
                  </div>
                  <span class="activity-meta">2m</span>
                </div>
                <div class="activity-item">
                  <span class="activity-dot"></span>
                  <div>
                    <strong>Vendor documents verified</strong>
                    <p>Supporting files were checked and routed to finance approval.</p>
                  </div>
                  <span class="activity-meta">14m</span>
                </div>
                <div class="activity-item">
                  <span class="activity-dot"></span>
                  <div>
                    <strong>Payment released</strong>
                    <p>Three approved requests moved into settlement.</p>
                  </div>
                  <span class="activity-meta">31m</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div class="col-12 col-lg-4">
          <article class="card page-card h-100">
            <div class="card-body p-4 p-md-5">
              <p class="page-eyebrow">Workflow health</p>
              <h2 class="section-title mb-4">Attention signals</h2>
              <div class="health-item">
                <span>Incomplete contracts</span>
                <strong>04</strong>
              </div>
              <div class="health-item">
                <span>Vendor follow-ups</span>
                <strong>09</strong>
              </div>
              <div class="health-item">
                <span>Days to close</span>
                <strong>1.8</strong>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  `;
}
