import { renderHeader } from '../header/header.js';
import { renderPageShell } from '../page-shell/page-shell.js';
import { renderFooter } from '../footer/footer.js';
import './layout.css';

export function renderLayout({ currentPath, content }) {
  return `
    <div class="app-shell">
      ${renderHeader(currentPath)}
      ${renderPageShell(content)}
      ${renderFooter()}
    </div>
  `;
}
