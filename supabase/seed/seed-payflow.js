import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Данни за зареждане
const vendorsSeed = [
  { vendor_name: 'Northwind Industrial Supply Ltd' },
  { vendor_name: 'BluePeak Infrastructure Services GmbH' },
];

const contractsSeed = [
  { vendor_name: 'Northwind Industrial Supply Ltd', contract_number: 'NIS-2026-001', signed_date: '2026-01-15', validity_date: '2027-01-14', total_amount: 150000.0, notes: 'Annual supply contract.' },
  { vendor_name: 'Northwind Industrial Supply Ltd', contract_number: 'NIS-2026-002', signed_date: '2026-03-01', validity_date: '2027-02-28', total_amount: 98000.0, notes: 'Spare parts.' },
  { vendor_name: 'BluePeak Infrastructure Services GmbH', contract_number: 'BPI-2026-010', signed_date: '2026-02-10', validity_date: '2027-02-09', total_amount: 212500.0, notes: 'Infrastructure maintenance.' },
  { vendor_name: 'BluePeak Infrastructure Services GmbH', contract_number: 'BPI-2026-011', signed_date: '2026-04-05', validity_date: '2027-04-04', total_amount: 64000.0, notes: 'Network upgrade.' },
];

const paymentRequestSeed = [
  { contract_number: 'NIS-2026-001', invoice_number: 'INV-NIS-0001', amount: 12450.75, currency: 'USD', description: 'Consumables', status: 'pending' },
  { contract_number: 'NIS-2026-001', invoice_number: 'INV-NIS-0002', amount: 9810.0, currency: 'USD', description: 'Safety materials', status: 'pending' },
  { contract_number: 'NIS-2026-002', invoice_number: 'INV-NIS-0003', amount: 15600.5, currency: 'EUR', description: 'Spare parts', status: 'pending' },
  { contract_number: 'BPI-2026-010', invoice_number: 'INV-BPI-0001', amount: 22340.0, currency: 'EUR', description: 'Monitoring', status: 'pending' },
  { contract_number: 'BPI-2026-010', invoice_number: 'INV-BPI-0002', amount: 31200.0, currency: 'USD', description: 'Preventive maintenance', status: 'in_review' },
  { contract_number: 'BPI-2026-011', invoice_number: 'INV-BPI-0003', amount: 8450.25, currency: 'GBP', description: 'Network install', status: 'in_review' },
  { contract_number: 'NIS-2026-001', invoice_number: 'INV-NIS-0004', amount: 11780.9, currency: 'EUR', description: 'Warehouse tooling', status: 'in_review' },
  { contract_number: 'NIS-2026-002', invoice_number: 'INV-NIS-0005', amount: 13990.0, currency: 'USD', description: 'Lubrication', status: 'in_review' },
  { contract_number: 'NIS-2026-001', invoice_number: 'INV-NIS-0006', amount: 7560.0, currency: 'USD', description: 'Packaging', status: 'approved' },
  { contract_number: 'BPI-2026-010', invoice_number: 'INV-BPI-0004', amount: 41500.0, currency: 'EUR', description: 'Cooling opt.', status: 'approved' },
  { contract_number: 'BPI-2026-011', invoice_number: 'INV-BPI-0005', amount: 6030.4, currency: 'GBP', description: 'WiFi rollout', status: 'approved' },
  { contract_number: 'NIS-2026-002', invoice_number: 'INV-NIS-0007', amount: 8920.0, currency: 'EUR', description: 'Bearing replacement', status: 'approved' },
  { contract_number: 'BPI-2026-010', invoice_number: 'INV-BPI-0006', amount: 26750.0, currency: 'USD', description: 'UPS batteries', status: 'paid' },
  { contract_number: 'NIS-2026-001', invoice_number: 'INV-NIS-0008', amount: 11110.3, currency: 'USD', description: 'Fire suppression', status: 'paid' },
  { contract_number: 'BPI-2026-011', invoice_number: 'INV-BPI-0007', amount: 9740.0, currency: 'EUR', description: 'Cabling', status: 'paid' },
  { contract_number: 'NIS-2026-002', invoice_number: 'INV-NIS-0009', amount: 12220.0, currency: 'USD', description: 'Field engineer', status: 'paid' },
  { contract_number: 'NIS-2026-001', invoice_number: 'INV-NIS-0010', amount: 6350.0, currency: 'EUR', description: 'Restocking', status: 'rejected' },
  { contract_number: 'BPI-2026-010', invoice_number: 'INV-BPI-0008', amount: 19800.0, currency: 'USD', description: 'Infrastructure ext.', status: 'rejected' },
  { contract_number: 'BPI-2026-011', invoice_number: 'INV-BPI-0009', amount: 4520.0, currency: 'GBP', description: 'Duplicate charge', status: 'rejected' },
  { contract_number: 'NIS-2026-002', status: 'rejected', invoice_number: 'INV-NIS-0011', amount: 5400.0, currency: 'USD', description: 'Pricing tier error' },
];

async function run() {
  console.log('Starting seed process...');

  // 1. Vendors - Слагаме upsert по vendor_name, за да не гърми, ако вече съществуват
  const { data: vendors, error: vErr } = await supabase
    .from('vendors')
    .upsert(vendorsSeed, { onConflict: 'vendor_name' })
    .select();
    
  if (vErr) throw vErr;
  
  const vendorMap = new Map(vendors.map(v => [v.vendor_name, v]));
  const vendorIds = vendors.map(v => v.id);

  // 2. Contracts - изчистваме излишната колона и правим чист insert
  const contractRows = contractsSeed.map(c => {
    const { vendor_name, ...cleanContract } = c;
    return { 
      ...cleanContract, 
      vendor_id: vendorMap.get(vendor_name).id 
    };
  });
  
  const { data: contracts, error: cErr } = await supabase.from('contracts').insert(contractRows).select();
  if (cErr) throw cErr;
  
  const contractMap = new Map(contracts.map(c => [c.contract_number, c]));

  // 3. Изтегляне на съществуващите Auth потребители
  const { data: users, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('Error fetching users:', authError);
    process.exit(1);
  }

  const userIds = (users && users.users) ? users.users.map(u => u.id) : [];

  if (userIds.length === 0) {
    console.error('No users found in Auth. Please add users in Supabase Dashboard first.');
    process.exit(1);
  }

  // Наливане в user_profiles
  for (let i = 0; i < userIds.length; i++) {
    const { error: pErr } = await supabase.from('user_profiles').upsert({ 
      id: userIds[i], 
      vendor_id: vendorIds[i % vendorIds.length] 
    });
    if (pErr) throw pErr;
  }

  // 4. Payment Requests
  const { data: profiles, error: profErr } = await supabase.from('user_profiles').select('id, vendor_id');
  if (profErr) throw profErr;
  
  const userVendorMap = new Map(profiles.map(p => [p.id, p.vendor_id]));

  const paymentRows = paymentRequestSeed.map((req) => {
    const contract = contractMap.get(req.contract_number);
    const validUserId = Array.from(userVendorMap.entries())
      .find(([uid, vid]) => vid === contract.vendor_id)?.[0] || userIds[0];

    return {
      user_id: validUserId,
      contract_id: contract.id,
      invoice_number: req.invoice_number,
      amount: req.amount,
      currency: req.currency,
      description: req.description,
      status: req.status
    };
  });

  // Чист insert за плащанията
  const { error: payErr } = await supabase.from('payment_requests').insert(paymentRows);
  if (payErr) throw payErr;
  
  console.log('Seed completed successfully!');
}

run().catch(console.error);