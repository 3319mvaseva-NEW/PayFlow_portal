import './admin.css';

export function renderAdmin() {
  return `
    <section class="card page-card shadow-sm border-0">
      <div class="card-body p-4 p-md-5">
        <p class="page-eyebrow">Administration</p>
        <h1 class="page-title">Admin</h1>
        <p class="page-copy">Manage users, approvals, and payment workflow settings.</p>
        <div class="admin-actions">
          <button class="btn btn-dark px-4" type="button">Manage users</button>
          <button class="btn btn-outline-dark px-4" type="button">Review queue</button>
        </div>
      </div>
    </section>
  `;
}
