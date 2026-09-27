-- Admin support tickets and Stripe subscription fields

alter table public.users
  add column plan text not null default 'free' check (plan in ('free', 'plus', 'pro')),
  add column stripe_customer_id text,
  add column stripe_subscription_id text,
  add column subscription_status text not null default 'none'
    check (subscription_status in ('none', 'trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  add column current_period_end timestamptz,
  add column receipt_scans_used integer not null default 0 check (receipt_scans_used >= 0),
  add column receipt_scans_cycle_start date,
  add column complimentary boolean not null default false;

-- Billing columns are written only by the API (service role). Clients can still
-- update profile fields such as full_name.
create or replace function public.protect_user_billing_columns()
returns trigger
language plpgsql
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;
  if new.plan is distinct from old.plan
    or new.stripe_customer_id is distinct from old.stripe_customer_id
    or new.stripe_subscription_id is distinct from old.stripe_subscription_id
    or new.subscription_status is distinct from old.subscription_status
    or new.current_period_end is distinct from old.current_period_end
    or new.receipt_scans_used is distinct from old.receipt_scans_used
    or new.receipt_scans_cycle_start is distinct from old.receipt_scans_cycle_start
    or new.complimentary is distinct from old.complimentary
  then
    raise exception 'billing fields are managed by the server';
  end if;
  return new;
end;
$$;

create trigger protect_user_billing_columns
  before update on public.users
  for each row execute procedure public.protect_user_billing_columns();

create unique index if not exists users_stripe_customer_id_key
  on public.users (stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists users_plan_status_idx
  on public.users (plan, subscription_status);

-- ============================================
-- SUPPORT TICKETS
-- ============================================
create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  subject text not null,
  category text not null check (category in ('bug', 'account', 'billing', 'other')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  status text not null default 'open' check (status in ('open', 'pending', 'resolved', 'closed')),
  body text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_support_tickets_user_id on public.support_tickets(user_id);
create index idx_support_tickets_status on public.support_tickets(status, updated_at desc);

alter table public.support_tickets enable row level security;

create policy "Users can view own tickets"
  on public.support_tickets for select
  using (auth.uid() = user_id);

create policy "Users can create own tickets"
  on public.support_tickets for insert
  with check (auth.uid() = user_id);

create trigger update_support_tickets_updated_at
  before update on public.support_tickets
  for each row execute procedure public.update_updated_at_column();

create table public.support_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  author_role text not null check (author_role in ('user', 'admin')),
  body text not null,
  created_at timestamptz default now() not null
);

create index idx_support_ticket_messages_ticket_id on public.support_ticket_messages(ticket_id, created_at);

alter table public.support_ticket_messages enable row level security;

create policy "Users can view messages on own tickets"
  on public.support_ticket_messages for select
  using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.user_id = auth.uid()
    )
  );

create policy "Users can reply on own tickets"
  on public.support_ticket_messages for insert
  with check (
    author_id = auth.uid()
    and author_role = 'user'
    and exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.user_id = auth.uid()
    )
  );
