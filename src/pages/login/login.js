import './login.css';

export function renderLogin({ authState } = {}) {
  const currentEmail = authState?.user?.email ?? '';

  return `
    <section class="login-shell">
      <div class="card page-card login-card">
        <div class="card-body p-4 p-md-5">
          <div class="d-flex flex-column align-items-center text-center mb-5">
            <div>
              <p class="page-eyebrow">Account access</p>
              <h1 class="page-title">Login or create your account</h1>
              <p class="page-copy mb-0">Sign in to review payment requests, contract milestones, and vendor activity.</p>
            </div>
            ${
              authState?.user
                ? `<span class="login-status-badge"><i class="bi bi-check2-circle"></i> Signed in as ${currentEmail}</span>`
                : ``
            }
          </div>

          <div class="row justify-content-center g-4">
          

           <div class="col-12 col-md-8 col-lg-5">
              <div class="auth-form-switcher nav nav-pills mb-3" role="tablist" aria-label="Authentication mode">
                <button class="nav-link active" data-bs-toggle="pill" data-bs-target="#loginPane" type="button" role="tab">Login</button>
                <button class="nav-link" data-bs-toggle="pill" data-bs-target="#registerPane" type="button" role="tab">Register</button>
              </div>

              <div id="authFeedback" class="auth-feedback d-none" role="status" aria-live="polite"></div>

              <div class="tab-content">
                <div class="tab-pane fade show active" id="loginPane" role="tabpanel" tabindex="0">
                  <form class="row g-3 auth-form" id="loginForm">
                    <div class="col-12">
                      <label class="form-label" for="loginEmail">Email</label>
                      <input class="form-control" id="loginEmail" type="email" value="${currentEmail}" placeholder="user@example.com" required />
                    </div>
                    <div class="col-12">
                      <label class="form-label" for="loginPassword">Password</label>
                      <input class="form-control" id="loginPassword" type="password" placeholder="Enter password" required />
                    </div>
                    <div class="col-12 d-grid d-sm-flex gap-2">
                      <button class="btn btn-primary px-4" type="submit">Sign in</button>
                      <button class="btn btn-outline-secondary px-4" type="reset">Reset</button>
                    </div>
                  </form>
                </div>

                <div class="tab-pane fade" id="registerPane" role="tabpanel" tabindex="0">
                  <form class="row g-3 auth-form" id="registerForm">
                    <div class="col-12">
                      <label class="form-label" for="registerEmail">Email</label>
                      <input class="form-control" id="registerEmail" type="email" placeholder="new.user@company.com" required />
                    </div>
                    <div class="col-12">
                      <label class="form-label" for="registerPassword">Password</label>
                      <input class="form-control" id="registerPassword" type="password" minlength="8" placeholder="Create a password" required />
                    </div>
                    <div class="col-12">
                      <label class="form-label" for="registerPasswordConfirm">Confirm password</label>
                      <input class="form-control" id="registerPasswordConfirm" type="password" minlength="8" placeholder="Repeat password" required />
                    </div>
                    <div class="col-12 d-grid d-sm-flex gap-2">
                      <button class="btn btn-primary px-4" type="submit">Create account</button>
                      <button class="btn btn-outline-secondary px-4" type="reset">Clear</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
