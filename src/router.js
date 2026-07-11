import { renderLayout } from './components/layout/layout.js';
import { renderHome } from './pages/home/home.js';
import { renderLogin } from './pages/login/login.js';
import { renderDashboard } from './pages/dashboard/dashboard.js';
import { renderNewPayment } from './pages/payment/new-payment.js';
import { renderPaymentDetail } from './pages/payment/payment-detail.js';
import { renderAdmin } from './pages/admin/admin.js';
import { initAdminLogic } from './pages/admin/admin.js';
import { renderAdminPaymentDetail } from './pages/admin/admin-payment-detail.js';
import {
  getAuthState,
  initializeAuthState,
  signInWithEmailAndPassword,
  signOutUser,
  signUpWithEmailAndPassword,
  subscribeToAuthState,
} from './services/auth.js';

const routes = [
  { path: '/', title: 'Home', render: () => renderHome() },
  { path: '/login', title: 'Login', render: (context) => renderLogin(context) },
  { path: '/dashboard', title: 'Dashboard', render: () => renderDashboard() },
  { path: '/payment/new', title: 'New Payment', render: () => renderNewPayment() },  { path: '/payment/new', title: 'New Payment', render: async () => await renderNewPayment() },
  {
    path: '/payment/:id',
    title: 'Payment Details',
    render: async ({ id }) => await renderPaymentDetail(id),
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

function showAuthFeedback(message, type = 'success') {
  const feedback = document.getElementById('authFeedback');

  if (!feedback) {
    return;
  }

  feedback.textContent = message;
  feedback.classList.remove('d-none', 'is-error', 'is-success');
  feedback.classList.add(type === 'error' ? 'is-error' : 'is-success');
}

function clearAuthFeedback() {
  const feedback = document.getElementById('authFeedback');

  if (!feedback) {
    return;
  }

  feedback.textContent = '';
  feedback.classList.add('d-none');
  feedback.classList.remove('is-error', 'is-success');
}

function bindLoginPage(appRoot) {
  const loginForm = appRoot.querySelector('#loginForm');
  const registerForm = appRoot.querySelector('#registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearAuthFeedback();

      const email = loginForm.querySelector('#loginEmail').value.trim();
      const password = loginForm.querySelector('#loginPassword').value;

      try {
        const { error } = await signInWithEmailAndPassword(email, password);

        if (error) {
          throw error;
        }

        navigate('/dashboard');
      } catch (error) {
        showAuthFeedback(error.message || 'Unable to sign in.', 'error');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearAuthFeedback();

      const email = registerForm.querySelector('#registerEmail').value.trim();
      const password = registerForm.querySelector('#registerPassword').value;
      const passwordConfirm = registerForm.querySelector('#registerPasswordConfirm').value;

      if (password !== passwordConfirm) {
        showAuthFeedback('Passwords do not match.', 'error');
        return;
      }

      try {
        const { data, error } = await signUpWithEmailAndPassword(email, password);

        if (error) {
          throw error;
        }

        const hasSession = Boolean(data?.session);

        if (hasSession) {
          navigate('/dashboard');
          return;
        }

        showAuthFeedback('Registration completed. If confirmations are disabled, you can sign in immediately.', 'success');
      } catch (error) {
        showAuthFeedback(error.message || 'Unable to register.', 'error');
      }
    });
  }
}

function bindLogout(appRoot) {
  const logoutButtons = appRoot.querySelectorAll('[data-auth-logout]');

  logoutButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const { error } = await signOutUser();

        if (error) {
          throw error;
        }

        navigate('/');
      } catch (error) {
        showAuthFeedback(error.message || 'Unable to log out.', 'error');
      }
    });
  });
}

// Turned into an async function to correctly resolve views that make network requests
async function renderApplication(appRoot) {
  const currentMatch = matchRoute(window.location.pathname);
  const routeTitle = currentMatch ? currentMatch.route.title : 'Page not found';
  const authState = getAuthState();

  document.title = `PayFlow Portal | ${routeTitle}`;

  // Evaluate the content template string dynamically whether it returns a Promise or an ordinary String
  let contentHtml = '';
  if (currentMatch) {
    const renderResult = currentMatch.route.render({ ...currentMatch.params, authState });
    contentHtml = renderResult instanceof Promise ? await renderResult : renderResult;
  } else {
    contentHtml = renderNotFound(window.location.pathname);
  }

  appRoot.innerHTML = renderLayout({
    currentPath: normalizePath(window.location.pathname),
    authState,
    content: contentHtml,
  });
if (currentMatch?.route.path === '/admin') {
    initAdminLogic();
  }
  bindLoginPage(appRoot);
  bindLogout(appRoot);
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
  initializeAuthState().finally(() => renderApplication(appRoot));

  window.addEventListener('popstate', () => renderApplication(appRoot));
  document.addEventListener('click', handleDocumentClick);

  subscribeToAuthState(() => renderApplication(appRoot));
}

export { navigate };

import { supabase } from './services/supabase.js'; // Увери се, че пътят е верен

function bindPaymentActions(appRoot) {
  const form = appRoot.querySelector('#paymentRequestForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const feedback = appRoot.querySelector('#formFeedback');
    const authState = getAuthState();
    
    if (!authState.user) {
      feedback.textContent = "You must be logged in to submit a request.";
      feedback.className = "alert alert-danger";
      return;
    }

    const payload = {
      user_id: authState.user.id,
      contract_id: form.querySelector('#paymentContract').value,
      invoice_number: form.querySelector('#invoiceNumber').value.trim(),
      amount: parseFloat(form.querySelector('#paymentAmount').value),
      currency: form.querySelector('#paymentCurrency').value.toUpperCase(),
      description: form.querySelector('#paymentDescription').value.trim(),
      status: 'pending' // Винаги тръгва като pending по условие
    };

    try {
      const { error } = await supabase
        .from('payment_requests')
        .insert([payload]);

      if (error) throw error;

      // Успех! Навигираме към таблото
      navigate('/dashboard');
    } catch (err) {
      feedback.textContent = err.message || "Error saving request.";
      feedback.className = "alert alert-danger";
    }
  });
}