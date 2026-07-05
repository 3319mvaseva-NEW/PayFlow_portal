create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop policy if exists payment_requests_select_own on public.payment_requests;
drop policy if exists payment_requests_insert_own on public.payment_requests;
drop policy if exists payment_requests_update_own on public.payment_requests;
drop policy if exists payment_requests_delete_own on public.payment_requests;

create policy payment_requests_select_own on public.payment_requests
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy payment_requests_insert_own on public.payment_requests
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy payment_requests_update_own on public.payment_requests
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy payment_requests_delete_own on public.payment_requests
for delete
to authenticated
using ((select auth.uid()) = user_id);
