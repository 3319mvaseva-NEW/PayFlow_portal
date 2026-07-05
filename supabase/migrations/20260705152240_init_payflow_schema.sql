create extension if not exists pgcrypto;

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  vendor_name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint vendors_vendor_name_unique unique (vendor_name)
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  contract_number text not null,
  signed_date date,
  validity_date date,
  total_amount numeric(12,2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  notes text,
  constraint contracts_vendor_contract_number_unique unique (vendor_id, contract_number),
  constraint contracts_validity_after_signed check (validity_date is null or signed_date is null or validity_date >= signed_date)
);

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete restrict,
  contract_id uuid not null references public.contracts (id) on delete cascade,
  invoice_number text not null,
  amount numeric(12,2) not null,
  currency char(3) not null,
  description text,
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint payment_requests_status_check check (status in ('pending', 'in_review', 'approved', 'paid', 'rejected')),
  constraint payment_requests_currency_check check (currency ~ '^[A-Z]{3}$'),
  constraint payment_requests_invoice_number_unique unique (contract_id, invoice_number)
);

create index if not exists contracts_vendor_id_idx on public.contracts (vendor_id);
create index if not exists payment_requests_user_id_idx on public.payment_requests (user_id);
create index if not exists payment_requests_contract_id_idx on public.payment_requests (contract_id);
create index if not exists payment_requests_status_idx on public.payment_requests (status);
create index if not exists payment_requests_created_at_idx on public.payment_requests (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists payment_requests_set_updated_at on public.payment_requests;
create trigger payment_requests_set_updated_at
before update on public.payment_requests
for each row
execute function public.set_updated_at();

alter table public.vendors enable row level security;
alter table public.contracts enable row level security;
alter table public.payment_requests enable row level security;

revoke all on public.vendors from anon, authenticated;
revoke all on public.contracts from anon, authenticated;
revoke all on public.payment_requests from anon, authenticated;

grant select on public.vendors to authenticated;
grant select on public.contracts to authenticated;
grant select, insert, update, delete on public.payment_requests to authenticated;

create policy vendors_read_authenticated on public.vendors
for select
to authenticated
using (true);

create policy contracts_read_authenticated on public.contracts
for select
to authenticated
using (true);

create policy payment_requests_select_own on public.payment_requests
for select
to authenticated
using (auth.uid() = user_id);

create policy payment_requests_insert_own on public.payment_requests
for insert
to authenticated
with check (auth.uid() = user_id);

create policy payment_requests_update_own on public.payment_requests
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy payment_requests_delete_own on public.payment_requests
for delete
to authenticated
using (auth.uid() = user_id);
