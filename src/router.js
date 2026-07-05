import { renderLayout } from './components/layout/layout.js';
import { renderHome } from './pages/home/home.js';
import { renderLogin } from './pages/login/login.js';
import { renderDashboard } from './pages/dashboard/dashboard.js';
import { renderNewPayment } from './pages/payment/new-payment.js';
import { renderPaymentDetail } from './pages/payment/payment-detail.js';
import { renderAdmin } from './pages/admin/admin.js';
import { renderAdminPaymentDetail } from './pages/admin/admin-payment-detail.js';

const routes = [
  { path: '/', title: 'Home', render: () => renderHome() },
  { path: '/login', title: 'Login', render: () => renderLogin() },
  { path: '/dashboard', title: 'Dashboard', render: () => renderDashboard() },
  { path: '/payment/new', title: 'New Payment', render: () => renderNewPayment() },
  {
    path: '/payment/:id',
    title: 'Payment Details',
    render: ({ id }) => renderPaymentDetail(id),
  },
  { path: '/admin', title: 'Admin', render: () => renderAdmin() },
  {
    path: '/admin/payment/:id',
    title: 'Admin Payment Details',
    render: ({ id }) => renderAdminPaymentDetail(id),
  },
];

function normalizePath(pathname) {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.replace(/\/$/, '');
}

function matchRoute(pathname) {
  const normalizedPath = normalizePath(pathname);

  for (const route of routes) {
    const patternSegments = route.path.split('/').filter(Boolean);
    const pathSegments = normalizedPath.split('/').filter(Boolean);

    if (patternSegments.length !== pathSegments.length) {
      continue;
    }

    const params = {};
    let matches = true;

    for (let index = 0; index < patternSegments.length; index += 1) {
      const patternSegment = patternSegments[index];
      const pathSegment = pathSegments[index];

      if (patternSegment.startsWith(':')) {
        params[patternSegment.slice(1)] = decodeURIComponent(pathSegment);
        continue;
      }

      if (patternSegment !== pathSegment) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return { route, params };
    }
  }

  return null;
}

function renderNotFound(pathname) {
  return `
    <section class="card page-card shadow-sm border-0">
      <div class="card-body p-4 p-md-5 text-center">
        <p class="page-eyebrow">404</p>
        <h1 class="page-title">Page not found</h1>
        <p class="page-copy mb-0">No page is registered for ${pathname}.</p>
      </div>
    </section>
  `;
}

function renderApplication(appRoot) {
  const currentMatch = matchRoute(window.location.pathname);
  const routeTitle = currentMatch ? currentMatch.route.title : 'Page not found';

  document.title = `PayFlow Portal | ${routeTitle}`;

  appRoot.innerHTML = renderLayout({
    currentPath: normalizePath(window.location.pathname),
    content: currentMatch
      ? currentMatch.route.render(currentMatch.params)
      : renderNotFound(window.location.pathname),
  });
}

function navigate(pathname) {
  if (window.location.pathname === pathname) {
    return;
  }

  window.history.pushState({}, '', pathname);
  renderApplication(document.getElementById('app'));
}

function handleDocumentClick(event) {
  const link = event.target.closest('[data-app-link]');

  if (!link) {
    return;
  }

  const url = new URL(link.href, window.location.origin);

  if (url.origin !== window.location.origin) {
    return;
  }

  event.preventDefault();
  navigate(url.pathname);
}

export function startApp(appRoot) {
  renderApplication(appRoot);

  window.addEventListener('popstate', () => renderApplication(appRoot));
  document.addEventListener('click', handleDocumentClick);
}

export { navigate };
