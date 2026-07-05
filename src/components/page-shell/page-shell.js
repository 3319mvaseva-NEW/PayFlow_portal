import './page-shell.css';

export function renderPageShell(content) {
  return `
    <main class="page-shell">
      <div class="container py-4 py-md-5">
        ${content}
      </div>
    </main>
  `;
}
