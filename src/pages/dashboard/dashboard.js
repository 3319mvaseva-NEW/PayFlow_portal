import './dashboard.css';
import { supabase } from '../../services/supabase.js';

export async function renderDashboard() {
  // 1. Извличане на текущия потребител от сесията
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return `
      <div class="card page-card m-5 p-5 text-center">
        <h2 class="section-title text-danger">Authentication Required</h2>
        <p class="page-copy">Please log in to view your vendor dashboard workspace.</p>
      </div>
    `;
  }

  // 2. Вземаме профила на потребителя, за да разберем неговия vendor_id
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('vendor_id')
    .eq('id', user.id)
    .single();

  let requests = [];
  if (!profileError && profile?.vendor_id) {
    // 3. Извличаме заявките за плащане, филтрирани по организация и СОРТИРАНИ по дата (най-новите първи)
    const { data: fetchedRequests, error: dbError } = await supabase
      .from('payment_requests')
      .select(`
        *,
        contracts!inner (
          contract_number,
          total_amount,
          vendor_id
        )
      `)
      .eq('contracts.vendor_id', profile.vendor_id)
      .order('created_at', { ascending: false }); // <-- ВАЖНО: Хронологично сортиране

    if (dbError) {
      console.error('Error fetching dashboard data:', dbError);
    } else {
      requests = fetchedRequests;
    }
  }

  const data = requests || [];

  // Валутни курсове спрямо основна валута (USD)
  const exchangeRates = { USD: 1.0, EUR: 1.08, GBP: 1.27 };

  const totalAmountUSD = data.reduce((sum, r) => sum + (r.amount * (exchangeRates[r.currency] || 1.0)), 0);

  const inProgressAmountUSD = data
    .filter(r => r.status === 'pending' || r.status === 'in_review')
    .reduce((sum, r) => sum + (r.amount * (exchangeRates[r.currency] || 1.0)), 0);

  const settledAmountUSD = data
    .filter(r => r.status === 'approved' || r.status === 'paid')
    .reduce((sum, r) => sum + (r.amount * (exchangeRates[r.currency] || 1.0)), 0);

  const uniqueContractsCount = new Set(data.map(r => r.contracts?.contract_number).filter(Boolean)).size;

  const formatCardMoney = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  // Изчисляване на динамични броячи за метриките
  const totalRequests = data.length;
  
  const inProgressCount = data.filter(r => 
    r.status === 'pending' || r.status === 'in_review'
  ).length;

  const settledCount = data.filter(r => 
    r.status === 'approved' || r.status === 'paid' || r.status === 'rejected'
  ).length;

  const rejectedCount = data.filter(r => r.status === 'rejected').length;
  const pendingReviewCount = data.filter(r => r.status === 'pending').length;

  const totalVolumeUSD = data.reduce((sum, r) => {
    const rate = exchangeRates[r.currency] || 1.0;
    return sum + (r.amount * rate);
  }, 0);

  // Изчисляване на изразходвания ресурс по договори
  const contractUsage = {};
  data.forEach(r => {
    if (!r.contracts) return;
    const num = r.contracts.contract_number;
    const rate = exchangeRates[r.currency] || 1.0;
    if (!contractUsage[num]) {
      contractUsage[num] = { spent: 0, total: r.contracts.total_amount };
    }
    if (r.status !== 'rejected') {
      contractUsage[num].spent += (r.amount * rate);
    }
  });

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'paid':
      case 'approved': return 'bg-success text-white border-success fs-6 fw-semibold';
      case 'in_review': return 'bg-warning text-dark border-warning fs-6 fw-semibold';
      case 'rejected': return 'bg-danger text-white border-danger fs-6 fw-semibold';
      default: return 'bg-secondary text-white border-secondary fs-6';
    }
  };

  // Activity Списък – рендерира се с responsive флекс подредба за мобилни устройства
  const activityHtml = data.length > 0 
    ? data.slice(0, 5).map(request => {
        const dateStr = request.created_at 
          ? new Date(request.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Recent';
          
        const amountStr = new Intl.NumberFormat('en-US', { style: 'currency', currency: request.currency }).format(request.amount);

        return `
          <div class="activity-item d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 p-3 border-bottom border-secondary border-opacity-10" data-status-filter="${request.status}">
            <div class="d-flex align-items-start gap-2">
              <span class="activity-dot mt-2" style="background: ${request.status === 'rejected' ? '#ef4444' : request.status === 'paid' ? '#22c55e' : '#60a5fa'}"></span>
              <div>
                <strong class="fs-5 text-white">Invoice ${request.invoice_number || 'Details'}</strong>
                <p class="text-light-50 my-1" style="font-size: 0.95rem;">
                  <span>Contract: ${request.contracts?.contract_number || 'N/A'}</span> 
                  <span class="text-white fs-6 fw-bold d-block d-sm-inline ms-0 ms-sm-2">Amount: ${amountStr}</span>
                </p>
                <small class="d-block mt-1" style="color: rgba(248, 251, 255, 0.75); font-size: 0.9rem;">${request.description || ''}</small>
              </div>
            </div>
            <div class="activity-meta d-flex flex-row flex-sm-column align-items-center align-items-sm-end justify-content-between w-100 w-sm-auto gap-2">
              <span class="badge border text-capitalize px-3 py-1 ${getStatusBadgeClass(request.status)}">
                ${request.status.replace('_', ' ')}
              </span>
              <span class="text-light-50 fw-medium small" style="color: rgba(248, 251, 255, 0.6);">${dateStr}</span>
            </div>
          </div>
        `;
      }).join('')
    : `
      <div class="text-center p-4 border border-secondary border-dashed rounded-3">
        <p class="text-muted mb-0">No recent payment requests recorded for your account.</p>
      </div>
    `;

  const contractProgressHtml = Object.keys(contractUsage).map(num => {
    const { spent, total } = contractUsage[num];
    const percentage = Math.min((spent / total) * 100, 100).toFixed(1);
    const formattedSpent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(spent);
    const formattedTotal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(total);
    
    return `
      <div class="mb-3">
        <div class="d-flex justify-content-between text-secondary mb-1" style="font-size: 0.85rem;">
          <span class="text-white-50 fw-medium">${num}</span>
          <span style="color: rgba(248, 251, 255, 0.7);">${percentage}% Used</span>
        </div>
        <div class="progress" style="height: 6px; background-color: rgba(255,255,255,0.08);">
          <div class="progress-bar" role="progressbar" style="width: ${percentage}%; background-color: #7dd3fc;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <div class="mt-1" style="font-size: 0.8rem; color: rgba(248, 251, 255, 0.65);">${formattedSpent} drawn of ${formattedTotal}</div>
      </div>
    `;
  }).join('');

  return `
    <section class="dashboard-grid container-fluid px-3 px-md-4">
      <div class="card page-card mb-4">
        <div class="card-body p-4">
          <p class="page-eyebrow">Overview</p>
          <h1 class="page-title fs-2">Dashboard control center</h1>
          <p class="page-copy mb-0">Track requests, approvals, and operational status from one clean workspace.</p>
        </div>
      </div>

      <div class="row g-3 g-md-4">
        <div class="col-12 col-md-4">
          <article class="metric-card card h-100">
            <div class="card-body p-4">
              <span class="metric-label mb-2 d-block">Total Requests</span>
              <div class="d-flex justify-content-between align-items-center">
                <i class="bi bi-inboxes metric-icon fs-2"></i>
                <strong class="metric-value mb-0 fs-3">${totalRequests}</strong>
              </div>
              <div class="mt-3 pt-3 border-top border-secondary border-opacity-10">
                <span class="text-info fs-5 fw-bold">${formatCardMoney(totalAmountUSD)}</span>
                <span class="d-block text-secondary small mt-1" style="color: rgba(147, 163, 184, 0.65) !important;">Across ${uniqueContractsCount} Framework Agreements</span>
              </div>
            </div>
          </article>
        </div>
        
        <div class="col-12 col-md-4">
          <article class="metric-card card h-100">
            <div class="card-body p-4">
              <span class="metric-label mb-2 d-block">In Progress</span>
              <div class="d-flex justify-content-between align-items-center">
                <i class="bi bi-hourglass-split metric-icon fs-2 text-warning"></i>
                <strong class="metric-value mb-0 fs-3">${inProgressCount}</strong>
              </div>
              <div class="mt-3 pt-3 border-top border-secondary border-opacity-10">
                <span class="text-warning fs-5 fw-bold">${formatCardMoney(inProgressAmountUSD)}</span>
                <span class="d-block text-secondary small mt-1" style="color: rgba(147, 163, 184, 0.65) !important;">Pipeline Liquidity Pending</span>
              </div>
            </div>
          </article>
        </div>
        
        <div class="col-12 col-md-4">
          <article class="metric-card card h-100">
            <div class="card-body p-4">
              <span class="metric-label mb-2 d-block">Settled</span>
              <div class="d-flex justify-content-between align-items-center">
                <i class="bi bi-check2-circle metric-icon fs-2 text-success"></i>
                <strong class="metric-value mb-0 fs-3">${settledCount}</strong>
              </div>
              <div class="mt-3 pt-3 border-top border-secondary border-opacity-10">
                <span class="text-success fs-5 fw-bold">${formatCardMoney(settledAmountUSD)}</span>
                <span class="d-block text-secondary small mt-1" style="color: rgba(147, 163, 184, 0.65) !important;">Successfully Cleared Funds</span>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div class="row g-3 g-md-4 mt-1">
        <div class="col-12 col-lg-8">
          <article class="card page-card h-100">
            <div class="card-body p-4">
              <div class="d-flex flex-wrap justify-content-between gap-3 align-items-start mb-4">
                <div>
                  <p class="page-eyebrow">Processing queue</p>
                  <h2 class="section-title fs-4">Recent activity</h2>
                </div>
                <span class="status-badge small"><i class="bi bi-signal"></i> Live updates</span>
              </div>

              <div class="activity-list d-flex flex-column" id="activityList" style="gap: 1rem;">
                ${activityHtml}
              </div>
            </div>
          </article>
        </div>

        <div class="col-12 col-lg-4 d-flex flex-column gap-3 gap-md-4">
          <article class="card page-card">
            <div class="card-body p-4">
              <p class="page-eyebrow">Workflow health</p>
              <h2 class="section-title mb-4 fs-4">Attention signals</h2>
              
              <div class="health-item filter-trigger d-flex justify-content-between p-2 mb-2" style="cursor: pointer;" onclick="document.querySelectorAll('#activityList .activity-item').forEach(el => el.style.setProperty('display', el.dataset.statusFilter === 'rejected' ? 'flex' : 'none', 'important'))">
                <span>Rejected Requests <i class="bi bi-filter text-primary ms-1"></i></span>
                <strong class="text-danger">${String(rejectedCount).padStart(2, '0')}</strong>
              </div>
              
              <div class="health-item filter-trigger d-flex justify-content-between p-2 mb-2" style="cursor: pointer;" onclick="document.querySelectorAll('#activityList .activity-item').forEach(el => el.style.setProperty('display', el.dataset.statusFilter === 'pending' ? 'flex' : 'none', 'important'))">
                <span>Pending Review <i class="bi bi-filter text-primary ms-1"></i></span>
                <strong class="text-warning">${String(pendingReviewCount).padStart(2, '0')}</strong>
              </div>
              
              <div class="health-item d-flex justify-content-between p-2" style="cursor: pointer;" onclick="document.querySelectorAll('#activityList .activity-item').forEach(el => el.style.setProperty('display', 'flex', 'important'))">
                <span class="text-primary">Reset Pipeline Filters</span>
                <strong><i class="bi bi-arrow-counterclockwise"></i></strong>
              </div>
            </div>
          </article>

          <article class="card page-card flex-grow-1">
            <div class="card-body p-4">
              <p class="page-eyebrow">Financial Analytics</p>
              <h2 class="section-title mb-2 fs-4">Gross Portfolio Value</h2>
              <div class="mb-4">
                <span style="font-size:0.85rem; color: rgba(248, 251, 255, 0.75);">Total Ledger Volume (USD Equivalent)</span>
                <h3 class="mt-1 fs-3" style="color:#86efac; font-weight:700;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalVolumeUSD)}</h3>
              </div>
              
              <p class="page-eyebrow mt-2">Contract Utilization</p>
              ${contractProgressHtml || '<p style="color: rgba(248, 251, 255, 0.5); font-size: 0.85rem;">No related contracts found.</p>'}
            </div>
          </article>
        </div>
      </div>
    </section>
  `;
}