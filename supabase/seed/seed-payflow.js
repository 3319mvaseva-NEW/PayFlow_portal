import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to your environment before running the seed script.',
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const vendorsSeed = [
  { vendor_name: 'Northwind Industrial Supply Ltd' },
  { vendor_name: 'BluePeak Infrastructure Services GmbH' },
];

const contractsSeed = [
  {
    vendor_name: 'Northwind Industrial Supply Ltd',
    contract_number: 'NIS-2026-001',
    signed_date: '2026-01-15',
    validity_date: '2027-01-14',
    total_amount: 150000.0,
    notes: 'Annual supply contract for operations consumables and facility materials.',
  },
  {
    vendor_name: 'Northwind Industrial Supply Ltd',
    contract_number: 'NIS-2026-002',
    signed_date: '2026-03-01',
    validity_date: '2027-02-28',
    total_amount: 98000.0,
    notes: 'Spare parts and maintenance service support for production assets.',
  },
  {
    vendor_name: 'BluePeak Infrastructure Services GmbH',
    contract_number: 'BPI-2026-010',
    signed_date: '2026-02-10',
    validity_date: '2027-02-09',
    total_amount: 212500.0,
    notes: 'Data center infrastructure and power systems maintenance agreement.',
  },
  {
    vendor_name: 'BluePeak Infrastructure Services GmbH',
    contract_number: 'BPI-2026-011',
    signed_date: '2026-04-05',
    validity_date: '2027-04-04',
    total_amount: 64000.0,
    notes: 'Office network upgrade project and post-deployment support services.',
  },
];

const paymentRequestSeed = [
  { contract_number: 'NIS-2026-001', invoice_number: 'INV-NIS-0001', amount: 12450.75, currency: 'USD', description: 'Quarterly facility consumables shipment for HQ.', status: 'pending' },
  { contract_number: 'NIS-2026-001', invoice_number: 'INV-NIS-0002', amount: 9810.0, currency: 'USD', description: 'Emergency procurement of safety materials.', status: 'pending' },
  { contract_number: 'NIS-2026-002', invoice_number: 'INV-NIS-0003', amount: 15600.5, currency: 'EUR', description: 'Maintenance spare parts batch for line A.', status: 'pending' },
  { contract_number: 'BPI-2026-010', invoice_number: 'INV-BPI-0001', amount: 22340.0, currency: 'EUR', description: 'Infrastructure monitoring and support retainer.', status: 'pending' },

  { contract_number: 'BPI-2026-010', invoice_number: 'INV-BPI-0002', amount: 31200.0, currency: 'USD', description: 'Power distribution panel preventive maintenance.', status: 'in_review' },
  { contract_number: 'BPI-2026-011', invoice_number: 'INV-BPI-0003', amount: 8450.25, currency: 'GBP', description: 'Network cabinet installation and cable organization.', status: 'in_review' },
  { contract_number: 'NIS-2026-001', invoice_number: 'INV-NIS-0004', amount: 11780.9, currency: 'EUR', description: 'Warehouse tooling replacement package.', status: 'in_review' },
  { contract_number: 'NIS-2026-002', invoice_number: 'INV-NIS-0005', amount: 13990.0, currency: 'USD', description: 'Scheduled lubrication and filter service kit.', status: 'in_review' },

  { contract_number: 'NIS-2026-001', invoice_number: 'INV-NIS-0006', amount: 7560.0, currency: 'USD', description: 'Packaging materials and pallet replenishment.', status: 'approved' },
  { contract_number: 'BPI-2026-010', invoice_number: 'INV-BPI-0004', amount: 41500.0, currency: 'EUR', description: 'Cooling optimization phase one implementation.', status: 'approved' },
  { contract_number: 'BPI-2026-011', invoice_number: 'INV-BPI-0005', amount: 6030.4, currency: 'GBP', description: 'Wireless access point rollout for annex building.', status: 'approved' },
  { contract_number: 'NIS-2026-002', invoice_number: 'INV-NIS-0007', amount: 8920.0, currency: 'EUR', description: 'Critical machine belt and bearing replacement.', status: 'approved' },

  { contract_number: 'BPI-2026-010', invoice_number: 'INV-BPI-0006', amount: 26750.0, currency: 'USD', description: 'UPS battery health remediation and replacement.', status: 'paid' },
  { contract_number: 'NIS-2026-001', invoice_number: 'INV-NIS-0008', amount: 11110.3, currency: 'USD', description: 'Fire suppression equipment annual refill service.', status: 'paid' },
  { contract_number: 'BPI-2026-011', invoice_number: 'INV-BPI-0007', amount: 9740.0, currency: 'EUR', description: 'Structured cabling patch work and certification.', status: 'paid' },
  { contract_number: 'NIS-2026-002', invoice_number: 'INV-NIS-0009', amount: 12220.0, currency: 'USD', description: 'Vendor field engineer support for incident response.', status: 'paid' },

  { contract_number: 'NIS-2026-001', invoice_number: 'INV-NIS-0010', amount: 6350.0, currency: 'EUR', description: 'Returned shipment restocking and logistics fees.', status: 'rejected' },
  { contract_number: 'BPI-2026-010', invoice_number: 'INV-BPI-0008', amount: 19800.0, currency: 'USD', description: 'Out-of-scope infrastructure extension proposal.', status: 'rejected' },
  { contract_number: 'BPI-2026-011', invoice_number: 'INV-BPI-0009', amount: 4520.0, currency: 'GBP', description: 'Duplicate service charge under same milestone.', status: 'rejected' },
  { contract_number: 'NIS-2026-002', invoice_number: 'INV-NIS-0011', amount: 5400.0, currency: 'USD', description: 'Incorrect pricing tier for maintenance consumables.', status: 'rejected' },
];

function mapBy(items, key) {
  return new Map(items.map((item) => [item[key], item]));
}

async function getExistingAuthUsers() {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw new Error(`Could not load auth users: ${error.message}`);
  }

  const users = (data?.users ?? []).slice().sort((a, b) => a.id.localeCompare(b.id));

  if (users.length === 0) {
    throw new Error('No existing Supabase Auth users found. Seed requires at least one existing user.');
  }

  return users;
}

async function upsertVendors() {
  console.log('Seeding vendors...');

  const { data, error } = await supabase
    .from('vendors')
    .upsert(vendorsSeed, { onConflict: 'vendor_name' })
    .select('id,vendor_name');

  if (error) {
    throw new Error(`Failed to seed vendors: ${error.message}`);
  }

  console.log(`Vendors seeded: ${data.length}`);
  return data;
}

async function upsertContracts(vendorMap) {
  console.log('Seeding contracts...');

  const rows = contractsSeed.map((contract) => {
    const vendor = vendorMap.get(contract.vendor_name);

    if (!vendor) {
      throw new Error(`Missing vendor for contract ${contract.contract_number}`);
    }

    return {
      vendor_id: vendor.id,
      contract_number: contract.contract_number,
      signed_date: contract.signed_date,
      validity_date: contract.validity_date,
      total_amount: contract.total_amount,
      notes: contract.notes,
    };
  });

  const { data, error } = await supabase
    .from('contracts')
    .upsert(rows, { onConflict: 'vendor_id,contract_number' })
    .select('id,vendor_id,contract_number');

  if (error) {
    throw new Error(`Failed to seed contracts: ${error.message}`);
  }

  console.log(`Contracts seeded: ${data.length}`);
  return data;
}

async function updateProfiles(vendorIds, userIds) {
  console.log('Updating profiles vendor links...');

  const { data: profiles, error: fetchError } = await supabase.from('profiles').select('*').limit(1000);

  if (fetchError) {
    if (fetchError.message.toLowerCase().includes('relation') || fetchError.code === 'PGRST205') {
      console.warn('Profiles table was not found. Skipping profile updates without changing schema.');
      return;
    }

    throw new Error(`Failed to read profiles: ${fetchError.message}`);
  }

  if (!profiles || profiles.length === 0) {
    console.warn('No existing profile records found. Skipping profile updates.');
    return;
  }

  const hasVendorId = Object.prototype.hasOwnProperty.call(profiles[0], 'vendor_id');
  if (!hasVendorId) {
    console.warn('Profiles table does not expose vendor_id. Skipping profile updates.');
    return;
  }

  const userKey = Object.prototype.hasOwnProperty.call(profiles[0], 'user_id') ? 'user_id' : 'id';

  let updated = 0;
  const sortedProfiles = profiles
    .filter((row) => row[userKey] && userIds.includes(row[userKey]))
    .sort((a, b) => String(a[userKey]).localeCompare(String(b[userKey])));

  for (let index = 0; index < sortedProfiles.length; index += 1) {
    const profile = sortedProfiles[index];
    const assignedVendorId = vendorIds[index % vendorIds.length];

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ vendor_id: assignedVendorId })
      .eq(userKey, profile[userKey]);

    if (updateError) {
      throw new Error(`Failed to update profile ${profile[userKey]}: ${updateError.message}`);
    }

    updated += 1;
  }

  if (updated === 0) {
    console.warn('No profile rows matched existing auth users. Skipping profile updates.');
    return;
  }

  console.log(`Profiles updated with vendor_id: ${updated}`);
}

async function upsertPaymentRequests(contractMap, userIds) {
  console.log('Seeding payment requests...');

  const rows = paymentRequestSeed.map((request, index) => {
    const contract = contractMap.get(request.contract_number);

    if (!contract) {
      throw new Error(`Missing contract for invoice ${request.invoice_number}`);
    }

    const month = String((index % 12) + 1).padStart(2, '0');
    const day = String((index % 28) + 1).padStart(2, '0');
    const timestamp = `2026-${month}-${day}T10:00:00.000Z`;

    return {
      user_id: userIds[index % userIds.length],
      contract_id: contract.id,
      invoice_number: request.invoice_number,
      amount: request.amount,
      currency: request.currency,
      description: request.description,
      status: request.status,
      created_at: timestamp,
      updated_at: timestamp,
    };
  });

  const { data, error } = await supabase
    .from('payment_requests')
    .upsert(rows, { onConflict: 'contract_id,invoice_number' })
    .select('id,invoice_number,status');

  if (error) {
    throw new Error(`Failed to seed payment requests: ${error.message}`);
  }

  console.log(`Payment requests seeded: ${data.length}`);
}

async function run() {
  console.log('Starting PayFlow seed...');

  const users = await getExistingAuthUsers();
  const userIds = users.map((user) => user.id);
  console.log(`Existing auth users found: ${userIds.length}`);

  const vendors = await upsertVendors();
  const vendorMap = mapBy(vendors, 'vendor_name');
  const vendorIds = vendors.map((vendor) => vendor.id).sort();

  const contracts = await upsertContracts(vendorMap);
  const contractMap = mapBy(contracts, 'contract_number');

  await updateProfiles(vendorIds, userIds);
  await upsertPaymentRequests(contractMap, userIds);

  console.log('PayFlow seed completed successfully.');
}

run().catch((error) => {
  console.error('PayFlow seed failed.');
  console.error(error.message);
  process.exitCode = 1;
});
