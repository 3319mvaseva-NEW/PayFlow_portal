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

function renderAuthControl(authState) {
  if (authState?.user) {
    const email = authState.user.email ?? 'Signed in';

    return `
      <div class="auth-control d-none d-lg-flex align-items-center gap-2 ms-lg-3">
        <span class="auth-chip"><i class="bi bi-person-circle"></i> ${email}</span>
        <button class="btn btn-outline-secondary btn-sm px-3" type="button" data-auth-logout>Logout</button>
      </div>
      <div class="d-lg-none mt-3">
        <button class="btn btn-outline-secondary w-100" type="button" data-auth-logout>Logout</button>
      </div>
    `;
  }

  return `
    <div class="auth-control d-none d-lg-flex align-items-center gap-2 ms-lg-3">
      <span class="auth-chip auth-chip-muted"><i class="bi bi-shield-lock"></i> Guest</span>
    </div>
  `;
}

export function renderHeader(currentPath, authState) {
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
            ${renderAuthControl(authState)}
          </nav>
        </div>
      </div>
    </header>
  `;
}
