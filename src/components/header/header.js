import './header.css';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/login', label: 'Login' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/payment/new', label: 'New Payment' },
  { href: '/admin', label: 'Admin' },
];

function isActiveLink(currentPath, href) {
  if (href === '/') {
    return currentPath === '/';
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function renderHeader(currentPath) {
  return `
    <header class="navbar navbar-expand-lg navbar-dark app-header">
      <div class="container">
        <a class="navbar-brand fw-semibold" href="/" data-app-link>PayFlow</a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavigation"
          aria-controls="mainNavigation"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNavigation">
          <nav class="navbar-nav ms-auto gap-lg-1">
            ${navItems
              .map(
                (item) => `
                  <a
                    class="nav-link ${isActiveLink(currentPath, item.href) ? 'active' : ''}"
                    href="${item.href}"
                    data-app-link
                    ${isActiveLink(currentPath, item.href) ? 'aria-current="page"' : ''}
                  >
                    ${item.label}
                  </a>
                `,
              )
              .join('')}
          </nav>
        </div>
      </div>
    </header>
  `;
}
