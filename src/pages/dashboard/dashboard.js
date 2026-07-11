import './dashboard.css';
import { supabase } from '../../services/supabase.js';

export async function renderDashboard() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return `
      <div class="card page-card m-5 p-5 text-center">
        <h2 class="section-title text-danger">Authentication Required</h2>
        <p class="page-copy">Please log in to view your vendor dashboard workspace.</p>
      </div>
    `;
  }

  const { data: profile } = await supabase.from('user_profiles').select('vendor_id, role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin';

  let query = supabase.from('payment_requests').select(`*, contracts!inner (contract_number, total_amount, vendor_id)`).order('created_at', { ascending: false });
  if (!isAdmin && profile?.vendor_id) {
    query = query.eq('contracts.vendor_id', profile.vendor_id);
  }

  const { data } = await query;
  const requests = data || [];

  const exchangeRates = { USD: 1.0, EUR: 1.08, GBP: 1.27 };
  const formatCardMoney = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  
  // Изчисления на метриките
  const totalRequests = requests.length;
  const inProgressCount = requests.filter(r => ['pending', 'in_review'].includes(r.status)).length;
  const settledCount = requests.filter(r => ['approved', 'paid', 'rejected'].includes(r.status)).length;
  const totalAmountUSD = requests.reduce((sum, r) => sum + (r.amount * (exchangeRates[r.currency] || 1.0)), 0);
  const inProgressAmountUSD = requests.filter(r => ['pending', 'in_review'].includes(r.status)).reduce((sum, r) => sum + (r.amount * (exchangeRates[r.currency] || 1.0)), 0);
  const settledAmountUSD = requests.filter(r => ['approved', 'paid'].includes(r.status)).reduce((sum, r) => sum + (r.amount * (exchangeRates[r.currency] || 1.0)), 0);
  
  // Добавени липсващи променливи за "Attention signals" и "Portfolio"
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;
  const pendingReviewCount = requests.filter(r => r.status === 'pending').length;
  const totalVolumeUSD = data.reduce((sum, r) => sum + (r.amount * (exchangeRates[r.currency] || 1.0)), 0);
  const contractUsage = {};
  requests.forEach(r => {
    if (!r.contracts) return;
    const num = r.contracts.contract_number;
    const rate = exchangeRates[r.currency] || 1.0;
    if (!contractUsage[num]) contractUsage[num] = { spent: 0, total: r.contracts.total_amount };
    if (r.status !== 'rejected') contractUsage[num].spent += (r.amount * rate);
  });

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'paid': case 'approved': return 'bg-success';
      case 'in_review': return 'bg-warning';
      case 'rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

    const contractProgressHtml = Object.keys(contractUsage).map(num => {
    const { spent, total } = contractUsage[num];
    const percentage = Math.min((spent / total) * 100, 100).toFixed(0);
    
    // Форматираме само общата сума по договора
    const totalStr = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(total);

    return `
      <div class="mb-3">
        <div class="d-flex justify-content-between text-white-50" style="font-size: 0.75rem;">
          <span class="text-white">${num}</span> 
          <!-- Оставяме само процента и общата сума -->
          <span class="fw-bold">${percentage}% <span style="opacity: 0.6; font-weight: normal;">(Limit: ${totalStr})</span></span>
        </div>
        <div class="progress mt-1" style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px;">
          <div class="progress-bar" style="width: ${percentage}%; background: #7dd3fc; border-radius: 3px;"></div>
        </div>
      </div>
    `;
  }).join('');

  const activityHtml = requests.length > 0 ? requests.slice(0, 5).map(r => {
    const amountStr = new Intl.NumberFormat('en-US', { style: 'currency', currency: r.currency }).format(r.amount);
    return `
      <div class="activity-item" style="display:flex; justify-content:space-between; align-items:center; padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.05);">
        <!-- Добавихме малко отместване чрез padding в горния div, 
            но за да е още по-прегледно, го правим чрез margin-left на текста -->
        <div style="margin-left: 10px;">
          <strong class="d-block text-white">Invoice ${r.invoice_number}</strong>
          <small class="text-white-50">Contract: ${r.contracts?.contract_number || 'N/A'}</small>
        </div>
        
        <div class="text-end" style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px; margin-right: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="text-white-50 small">Amount:</span>
            <strong class="text-white">${amountStr}</strong>
          </div>
          <span class="badge ${getStatusBadgeClass(r.status)}" style="width: fit-content;">${r.status}</span>
        </div>
      </div>
    `;
  }).join('') : '<p class="text-white-50" style="margin-left: 30px;">No activity.</p>';

  return `
    <section class="dashboard-grid container-fluid px-4">
      <div class="card page-card mb-4 p-4">
        <h1 class="section-title">Dashboard control center</h1>
        <p class="text-white-50">Track requests and operational status.</p>
      </div>

      <div class="row g-4 mb-4">
       <div class="row g-4 mb-4">
          <!-- Карта 1 -->
          <div class="col-md-4">
            <article class="metric-card p-4 d-flex align-items-center justify-content-between" style="border-left: 4px solid #0ea5e9;">
              <i class="bi bi-inbox fs-1 text-info opacity-25"></i>
              <div class="text-end">
                <h4 class="text-white-50 m-0 mb-1">Total Requests</h4>
                <span class="d-block text-info" style="font-size: 2.2rem; font-weight: 800; line-height: 1.1;">${totalRequests}</span>
                <span class="text-white-50 small">Volume: </span><span class="text-info fw-bold">${formatCardMoney(totalAmountUSD)}</span>
              </div>
            </article>
          </div>

          <!-- Карта 2 -->
          <div class="col-md-4">
            <article class="metric-card p-4 d-flex align-items-center justify-content-between" style="border-left: 4px solid #eab308;">
              <i class="bi bi-hourglass-split fs-1 text-warning opacity-25"></i>
              <div class="text-end">
                <h4 class="text-white-50 m-0 mb-1">In Progress</h4>
                <span class="d-block text-warning" style="font-size: 2.2rem; font-weight: 800; line-height: 1.1;">${inProgressCount}</span>
                <span class="text-white-50 small">Volume: </span><span class="text-warning fw-bold">${formatCardMoney(inProgressAmountUSD)}</span>
              </div>
            </article>
          </div>

          <!-- Карта 3 -->
          <div class="col-md-4">
            <article class="metric-card p-4 d-flex align-items-center justify-content-between" style="border-left: 4px solid #22c55e;">
              <i class="bi bi-check2-circle fs-1 text-success opacity-25"></i>
              <div class="text-end">
                <h4 class="text-white-50 m-0 mb-1">Settled</h4>
                <span class="d-block text-success" style="font-size: 2.2rem; font-weight: 800; line-height: 1.1;">${settledCount}</span>
                <span class="text-white-50 small">Volume: </span><span class="text-success fw-bold">${formatCardMoney(settledAmountUSD)}</span>
              </div>
            </article>
          </div>
        </div>

      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card page-card p-4">
            <h4 class="mb-4">Recent activity</h4>
            ${activityHtml}
          </div>
        </div>
        
        <div class="col-lg-4">
          <div class="card page-card p-4">
            <h4 class="mb-4">Attention signals</h4>
            <div class="d-flex justify-content-between mb-2"><span>Rejected</span><strong>${rejectedCount}</strong></div>
            <div class="d-flex justify-content-between mb-4"><span>Pending</span><strong>${pendingReviewCount}</strong></div>
            
            <hr class="border-secondary my-4">
            
            <h4 class="mb-3">Gross Portfolio Value</h4>
            <h2 class="text-success mb-4">${formatCardMoney(totalVolumeUSD)}</h2>
            
            <h4 class="mb-3 mt-2">Contract Utilization</h4>
            ${contractProgressHtml || '<p class="text-white-50">No contracts found.</p>'}
          </div>
        </div>
      </div>
    </section>
  `;
}