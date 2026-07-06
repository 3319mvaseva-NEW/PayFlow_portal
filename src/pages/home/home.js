import './home.css';

export function renderHome() {
  return `
    <section class="page-home">
      <div class="home-ambient" aria-hidden="true">
        <div class="ambient-grid"></div>
        <div class="ambient-orb ambient-orb-one"></div>
        <div class="ambient-orb ambient-orb-two"></div>
        <div class="ambient-stream ambient-stream-one"></div>
        <div class="ambient-stream ambient-stream-two"></div>
        <div class="ambient-stream ambient-stream-three"></div>
      </div>

      <div class="row align-items-center g-4 g-xl-5 position-relative">
        <div class="col-12 col-lg-7">
          <div class="hero-copy panel-stack">
            <span class="hero-chip"><i class="bi bi-shield-check"></i> Secure document workflow</span>
            <p class="page-eyebrow text-start">PayFlow portal</p>
            <h1 class="hero-title">Streamline vendor invoices and payment approvals</h1>
            <p class="hero-lead">
              Submit invoice requests, attach supporting documents, and track payment statuses in real-time. Transparent financial workflow for vendors, clients, and admins.
            </p>

            <div class="hero-actions d-flex flex-column flex-sm-row gap-3">
              <a class="btn btn-primary btn-lg px-4" href="/login" data-app-link>Login to access dashboard</a>
              <a class="btn btn-outline-secondary btn-lg px-4" href="/dashboard" data-app-link>Explore the dashboard</a>
            </div>

            <div class="hero-metrics row g-3 mt-1">
              <div class="col-12 col-sm-4">
                <article class="mini-stat card border-0 h-100">
                  <div class="card-body">
                    <span>Requests routed</span>
                    <strong>128</strong>
                  </div>
                </article>
              </div>
              <div class="col-12 col-sm-4">
                <article class="mini-stat card border-0 h-100">
                  <div class="card-body">
                    <span>Vendor approvals</span>
                    <strong>92%</strong>
                  </div>
                </article>
              </div>
              <div class="col-12 col-sm-4">
                <article class="mini-stat card border-0 h-100">
                  <div class="card-body">
                    <span>Average cycle</span>
                    <strong>1.8d</strong>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-5">
          <div class="hero-visual card border-0">
            <div class="hero-visual-inner">
              <div class="visual-header">
                <span class="visual-pill"><i class="bi bi-graph-up-arrow"></i> Live payment pulse</span>
                <span class="visual-status"><i class="bi bi-dot"></i> synced</span>
              </div>

              <div class="chart-card">
                <div class="chart-grid"></div>
                <svg viewBox="0 0 520 240" class="chart-svg" aria-hidden="true">
                  <path d="M0 168 C 42 158, 64 126, 96 132 S 154 182, 194 168 S 266 98, 318 114 S 394 196, 520 92" />
                  <path class="chart-secondary" d="M0 194 C 66 172, 90 192, 132 170 S 190 104, 234 118 S 314 168, 362 150 S 446 96, 520 124" />
                </svg>
                <div class="chart-tags">
                  <span>Contract review</span>
                  <span>Vendor stream</span>
                  <span>Release queue</span>
                </div>
              </div>

              <div class="data-river">
                <span><i class="bi bi-arrow-up-right"></i> INV-2048</span>
                <span><i class="bi bi-circle-fill"></i> AUTH-11</span>
                <span><i class="bi bi-shuffle"></i> PO sync</span>
                <span><i class="bi bi-activity"></i> KYC review</span>
              </div>

              <div class="node-cloud">
                <span class="node node-a"></span>
                <span class="node node-b"></span>
                <span class="node node-c"></span>
                <span class="node node-d"></span>
                <span class="node node-e"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4 mt-1 mt-xl-4">
        <div class="col-12 col-lg-4">
          <article class="feature-card card h-100 border-0">
            <div class="card-body">
              <i class="bi bi-file-earmark-text feature-icon"></i>
              <h2 class="feature-title">Document intake</h2>
              <p class="feature-copy">Capture payment requests with supporting evidence and route them to the right reviewer.</p>
            </div>
          </article>
        </div>
        <div class="col-12 col-lg-4">
          <article class="feature-card card h-100 border-0">
            <div class="card-body">
              <i class="bi bi-diagram-3 feature-icon"></i>
              <h2 class="feature-title">Contract tracking</h2>
              <p class="feature-copy">Follow agreements through approval, renewal, and settlement without losing context.</p>
            </div>
          </article>
        </div>
        <div class="col-12 col-lg-4">
          <article class="feature-card card h-100 border-0">
            <div class="card-body">
              <i class="bi bi-bank feature-icon"></i>
              <h2 class="feature-title">Vendor payments</h2>
              <p class="feature-copy">Keep vendor status, payout timing, and audit signals visible in one control surface.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  `;
}
