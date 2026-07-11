import './admin.css';
import { isAdmin, getPendingPayments } from './admin-service';

export async function renderAdmin() {
  // 1. Проверка на достъпа веднага при зареждане
  const isAuthorized = await isAdmin();
  
 if (!isAuthorized) {
    return `
      <section class="card page-card shadow-sm border-0">
        <div class="card-body p-4 text-center">
          <h1 class="page-title">Access Denied</h1>
          <p class="page-copy">Нямате администраторски права за достъп до този панел.</p>
          <a href="/dashboard" data-app-link class="btn btn-primary">Назад към таблото</a>
        </div>
      </section>
    `;
  }

  // 2. Рендиране на администраторския интерфейс
  return `
    <section class="card page-card shadow-sm border-0">
      <div class="card-body p-4 p-md-5">
        <p class="page-eyebrow">Administration</p>
        <h1 class="page-title">Admin command center</h1>
        <p class="page-copy">Управление на потребители, одобрения и работни процеси.</p>
        
        <div class="admin-actions">
          <button class="btn btn-primary px-4" id="manageUsersBtn">Manage users</button>
          <button class="btn btn-outline-dark px-4" id="reviewQueueBtn">Review queue</button>
        </div>

        <div class="admin-grid" id="adminStats">
          <div class="admin-panel">
            <span>System health</span>
            <strong>All critical workflows online</strong>
          </div>
          <div class="admin-panel">
            <span>Access review</span>
            <strong id="pendingCount">Loading...</strong>
          </div>
        </div>
      </div>
    </section>
  `;
}

// 3. Логика след като елементите са в DOM (извиква се след рендиране)
export function initAdminLogic() {
  const pendingCountEl = document.getElementById('pendingCount');
  
  if (pendingCountEl) {
    getPendingPayments().then(payments => {
      pendingCountEl.textContent = `${payments.length} заявки чакат преглед`;
    }).catch(err => {
      console.error(err);
      pendingCountEl.textContent = "Error";
    });
  }

  // Тук можеш да добавиш event listeners за бутоните
  document.getElementById('reviewQueueBtn')?.addEventListener('click', () => {
    alert("Тук ще отворим списъка с чакащи заявки!");
    // window.location.hash = '#/admin/queue';
  });
}