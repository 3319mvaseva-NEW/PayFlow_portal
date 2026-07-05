import './footer.css';

export function renderFooter() {
  return `
    <footer class="app-footer">
      <div class="container py-3 d-flex flex-column flex-md-row justify-content-between gap-2">
        <span>PayFlow Portal scaffold</span>
        <span>Vite + JavaScript + Bootstrap</span>
      </div>
    </footer>
  `;
}
