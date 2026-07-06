import { renderHeader } from '../header/header.js';
import { renderPageShell } from '../page-shell/page-shell.js';
import { renderFooter } from '../footer/footer.js';
import './layout.css';

export function renderLayout({ currentPath, content, authState }) {
  return `
    <div class="app-shell">
      ${renderHeader(currentPath, authState)}
      ${renderPageShell(content)}
      ${renderFooter()}
    </div>
  `;
}
