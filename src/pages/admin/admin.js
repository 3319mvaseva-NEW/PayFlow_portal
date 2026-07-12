import './admin.css';
import { supabase } from '../../services/supabase.js';
import { 
    isAdmin, 
    getPendingPayments, 
    createVendor, 
    updatePaymentStatus, 
    createContract, 
    getVendors,
    updateVendor,
    assignUserToVendor,
    getUnassignedUsers 
} from './admin-service';
import Swal from 'sweetalert2';
import { renderAdminPaymentDetail, initPaymentDetailLogic } from './admin-payment-detail.js';

const Toast = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true,
    background: '#1e293b',
    color: '#fff',
    customClass: { popup: 'colored-toast' },
    didOpen: (toast) => {
        toast.style.marginTop = '20px';
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

export async function renderAdmin() {
    const isAuthorized = await isAdmin();
    if (!isAuthorized) {
        return `
            <section class="card page-card shadow-sm border-0">
                <div class="card-body p-4 text-center">
                    <h1 class="page-title">Access Denied</h1>
                    <p class="page-copy">No access rights for this module.</p>
                </div>
            </section>
        `;
    }

    return `
        <section class="card page-card shadow-sm border-0">
            <div class="card-body p-4 p-md-5">
                <p class="page-eyebrow">Administration</p>
                <h1 class="page-title">Admin command center</h1>
                <div class="admin-actions">
                    <button class="btn btn-primary px-4" id="manageVendorsBtn">Manage Vendors</button>
                    <button class="btn btn-secondary px-4" id="addContractBtn">Add New Contract</button>
                    <button class="btn btn-outline-dark px-4" id="reviewQueueBtn">Review queue</button>
                    <button class="btn btn-info px-4" id="manageUsersBtn">Manage Users</button>
                </div>
                <div id="admin-content" class="mt-4"></div>
            </div>
        </section>
    `;
}

export function initAdminLogic() {
    document.getElementById('manageVendorsBtn')?.addEventListener('click', () => renderVendorManager());
    
    document.getElementById('addContractBtn')?.addEventListener('click', async () => {
        const adminContent = document.getElementById('admin-content');
        const vendors = await getVendors();
        const vendorOptions = vendors.map(v => `<option value="${v.id}">${v.vendor_name}</option>`).join('');

        adminContent.innerHTML = `
        <div class="card p-3 bg-light border-0 shadow-sm">
            <h5>Add New Contract</h5>
            <select id="vendor-select" class="form-control mb-2">
                <option value="">Select a vendor...</option>
                ${vendorOptions}
            </select>
            <input type="text" id="contract-number" class="form-control mb-2" placeholder="Contract Number">
            <input type="number" id="total-amount" class="form-control mb-2" placeholder="Total Amount">
            <button id="saveContractBtn" class="btn btn-success">Save Contract ( in USD )</button>
        </div>`;

        document.getElementById('saveContractBtn').addEventListener('click', async () => {
            const contractData = {
                contract_number: document.getElementById('contract-number').value,
                vendor_id: document.getElementById('vendor-select').value,
                total_amount: parseFloat(document.getElementById('total-amount').value),
            };
            try {
                await createContract(contractData);
                Toast.fire({ icon: 'success', title: 'Contract saved!' });
            } catch (err) { Toast.fire({ icon: 'error', title: err.message }); }
        });
    });

    document.getElementById('reviewQueueBtn')?.addEventListener('click', () => loadReviewQueue());
    document.getElementById('manageUsersBtn')?.addEventListener('click', () => renderUserManager());
}

export async function renderVendorManager() {
    const adminContent = document.getElementById('admin-content');
    adminContent.innerHTML = `<p class="mt-3 text-light">Loading vendors...</p>`;
    
    try {
        const vendors = await getVendors();
        adminContent.innerHTML = `
            <div class="card p-3 shadow-sm border-0 bg-dark text-light">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>Manage Vendors</h5>
                    <button id="addVendorBtn" class="btn btn-sm btn-primary">+ Add New Vendor</button>
                </div>
                <table class="table table-dark table-hover">
                    <thead><tr><th>Vendor Name</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${vendors.map(v => `
                            <tr>
                                <td>${v.vendor_name}</td>
                                <td><button class="btn btn-sm btn-outline-info edit-vendor" data-id="${v.id}" data-name="${v.vendor_name}">Edit</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById('addVendorBtn').addEventListener('click', () => showVendorModal());
        document.querySelectorAll('.edit-vendor').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const { id, name } = e.target.dataset;
                showVendorModal(id, name);
            });
        });
    } catch (err) {
        adminContent.innerHTML = `<p class="mt-3 text-danger">Error: ${err.message}</p>`;
    }
}

async function showVendorModal(id = null, currentName = '') {
    const { value: newName } = await Swal.fire({
        title: id ? 'Edit Vendor' : 'Add New Vendor',
        input: 'text',
        inputLabel: 'Vendor Name',
        inputValue: currentName,
        showCancelButton: true,
        confirmButtonText: id ? 'Update' : 'Add',
        background: '#1e293b',
        color: '#fff'
    });

    if (newName) {
        try {
            if (id) {
                await updateVendor(id, newName);
            } else {
                await createVendor(newName);
            }
            Toast.fire({ icon: 'success', title: 'Vendor saved successfully!' });
            renderVendorManager();
        } catch (err) {
            Toast.fire({ icon: 'error', title: 'Error: ' + err.message });
        }
    }
}

export async function loadReviewQueue() {
    const adminContent = document.getElementById('admin-content');
    adminContent.innerHTML = `<p class="mt-3 text-light">Loading...</p>`;
    
    try {
        const payments = await getPendingPayments();
        if (payments.length === 0) {
            adminContent.innerHTML = `<p class="mt-3 text-light">No pending requests.</p>`;
            return;
        }

        adminContent.innerHTML = `
            <div class="card bg-dark border-0 shadow-sm" style="margin-top: 20px;">
                <div class="card-body">
                    <table class="table table-dark table-hover mb-0">
                        <tbody>
                            ${payments.map(p => `
                                <tr>
                                    <td>${p.invoice_number}</td>
                                    <td><span class="badge bg-warning">${p.status}</span></td>
                                    <td>
                                        <button class="btn btn-sm btn-info view-btn" data-id="${p.id}">View</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                adminContent.innerHTML = await renderAdminPaymentDetail(id);
                initPaymentDetailLogic(id);
            });
        });
    } catch (err) { Toast.fire({ icon: 'error', title: err.message }); }
}

export async function renderUserManager() {
    const adminContent = document.getElementById('admin-content');
    adminContent.innerHTML = `<p class="mt-3 text-light">Loading users...</p>`;
    
    try {
        const [users, vendors] = await Promise.all([getUnassignedUsers(), getVendors()]);
        
        adminContent.innerHTML = `
            <div class="card p-3 shadow-sm border-0 bg-dark text-light">
                <h5>Assign Users to Vendors</h5>
                <table class="table table-dark table-hover mt-3">
                    <thead><tr><th>Email</th><th>Vendor</th><th>Action</th></tr></thead>
                    <tbody>
                        ${users.map(u => `
                            <tr>
                                <td>${u.email || 'N/A'}</td>
                                <td>
                                    <select class="form-control form-control-sm" id="select-${u.id}">
                                        ${vendors.map(v => `<option value="${v.id}">${v.vendor_name}</option>`).join('')}
                                    </select>
                                </td>
                                <td><button class="btn btn-sm btn-success assign-btn" data-id="${u.id}">Assign</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        document.querySelectorAll('.assign-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const userId = e.target.dataset.id;
                const vendorId = document.getElementById(`select-${userId}`).value;
                await assignUserToVendor(userId, vendorId);
                Toast.fire({ icon: 'success', title: 'User assigned successfully!' });
                renderUserManager();
            });
        });
    } catch (err) {
        adminContent.innerHTML = `<p class="text-danger">Error: ${err.message}</p>`;
    }
}