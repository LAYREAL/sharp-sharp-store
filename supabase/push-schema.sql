-- ============================================================================
-- SHARP SHARP — push notifications schema. Run ONCE in the Supabase SQL editor.
-- ============================================================================

create table if not exists public.push_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  sub_key       text unique not null,          -- 'customer:<orderId>:<endpoint>' or 'admin:<userId>:<endpoint>'
  role          text not null check (role in ('admin','customer')),
  order_id      text,                          -- customer rows: the order to notify about
  user_id       uuid references auth.users(id) on delete cascade,  -- admin rows
  endpoint      text not null,
  subscription  jsonb not null,
  created_at    timestamptz not null default now()
);
create index if not exists push_subs_role_idx  on public.push_subscriptions (role);
create index if not exists push_subs_order_idx on public.push_subscriptions (order_id);

alter table public.push_subscriptions enable row level security;

-- Customers (anonymous visitors) may only ADD a customer subscription. They can't read anything back.
drop policy if exists "customer can subscribe" on public.push_subscriptions;
create policy "customer can subscribe" on public.push_subscriptions
  for insert to anon, authenticated
  with check (role = 'customer' and order_id is not null and user_id is null);

-- Admins may add / remove their own device.
-- >>> CHANGE public.admins / user_id below to match YOUR admins allow-list table <<<
drop policy if exists "admin can subscribe" on public.push_subscriptions;
create policy "admin can subscribe" on public.push_subscriptions
  for insert to authenticated
  with check (
    role = 'admin' and user_id = auth.uid()
    and exists (select 1 from public.admins a where a.user_id = auth.uid())
  );

drop policy if exists "admin can unsubscribe own device" on public.push_subscriptions;
create policy "admin can unsubscribe own device" on public.push_subscriptions
  for delete to authenticated
  using (role = 'admin' and user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- Lets a customer's device refresh the STATUS (only) of orders it already knows the IDs of,
-- without giving the storefront read access to the orders table.
-- ----------------------------------------------------------------------------
create or replace function public.get_order_statuses(order_ids text[])
returns table (id text, status text)
language sql
stable
security definer
set search_path = public
as $$
  select o.id::text, o.status::text
  from public.orders o
  where o.id::text = any(order_ids)
  limit 100;
$$;
revoke all on function public.get_order_statuses(text[]) from public;
grant execute on function public.get_order_statuses(text[]) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Registration goes through this function so row-level-security quirks can't block it.
-- ---------------------------------------------------------------------------
create or replace function public.register_push(
  p_role text, p_order_id text, p_endpoint text, p_subscription jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_endpoint is null or p_subscription is null then raise exception 'missing subscription'; end if;

  if p_role = 'admin' then
    if auth.uid() is null or not exists (select 1 from public.admins where user_id = auth.uid()) then
      raise exception 'not an admin';
    end if;
    insert into public.push_subscriptions (sub_key, role, user_id, endpoint, subscription)
    values ('admin:' || auth.uid() || ':' || p_endpoint, 'admin', auth.uid(), p_endpoint, p_subscription)
    on conflict (sub_key) do nothing;

  elsif p_role = 'customer' then
    if p_order_id is null or length(p_order_id) = 0 then raise exception 'missing order id'; end if;
    insert into public.push_subscriptions (sub_key, role, order_id, endpoint, subscription)
    values ('customer:' || p_order_id || ':' || p_endpoint, 'customer', p_order_id, p_endpoint, p_subscription)
    on conflict (sub_key) do nothing;

  else
    raise exception 'bad role';
  end if;
end;
$$;
revoke all on function public.register_push(text, text, text, jsonb) from public;
grant execute on function public.register_push(text, text, text, jsonb) to anon, authenticated;

-- Lets an admin see/remove only their own device rows (needed for the bell's "turn off").
drop policy if exists "admin can read own device" on public.push_subscriptions;
create policy "admin can read own device" on public.push_subscriptions
  for select to authenticated
  using (role = 'admin' and user_id = auth.uid());
