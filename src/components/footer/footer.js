import './footer.css';

export function renderFooter() {
  return `
    <footer class="app-footer">
      <div class="container py-3 py-md-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
        <span class="footer-brand">PayFlow portal</span>
        <span>Fintech workflow design system.</span>
      </div>
    </footer>
  `;
}
