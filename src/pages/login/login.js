import './login.css';

export function renderLogin() {
  return `
    <section class="card page-card shadow-sm border-0">
      <div class="card-body p-4 p-md-5">
        <p class="page-eyebrow">Account access</p>
        <h1 class="page-title">Login to access dashboard</h1>
        <p class="page-copy">Sign in to review payment requests, contract milestones, and vendor activity.</p>
        <form class="row g-3">
          <div class="col-12">
            <label class="form-label" for="loginEmail">Email</label>
            <input class="form-control" id="loginEmail" type="email" placeholder="user@example.com" />
          </div>
          <div class="col-12">
            <label class="form-label" for="loginPassword">Password</label>
            <input class="form-control" id="loginPassword" type="password" placeholder="Enter password" />
          </div>
          <div class="col-12 d-grid d-sm-flex gap-2">
            <button class="btn btn-primary px-4" type="button">Sign in</button>
            <button class="btn btn-outline-secondary px-4" type="button">Reset</button>
          </div>
        </form>
      </div>
    </section>
  `;
}
