-- Credit cards: charges stay on the card; payments post a cash expense.

insert into public.categories (user_id, name, icon, color)
select null, 'Credit card payment', 'credit-card', '#0f766e'
where not exists (
  select 1 from public.categories where user_id is null and name = 'Credit card payment'
);

create table public.credit_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  statement_close_day int not null check (statement_close_day between 1 and 31),
  payment_due_day int not null check (payment_due_day between 1 and 31),
  currency char(3) not null default 'USD',
  rewards_type text not null default 'none' check (rewards_type in ('none', 'cashback', 'miles', 'points')),
  rewards_rate numeric(6, 2) not null default 0 check (rewards_rate >= 0),
  rewards_label text,
  icon text not null default 'credit_card',
  color text not null default '#0f766e',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_credit_cards_user_id on public.credit_cards(user_id);

alter table public.credit_cards enable row level security;

create policy "Users can view own credit cards"
  on public.credit_cards for select using (auth.uid() = user_id);
create policy "Users can create own credit cards"
  on public.credit_cards for insert with check (auth.uid() = user_id);
create policy "Users can update own credit cards"
  on public.credit_cards for update using (auth.uid() = user_id);
create policy "Users can delete own credit cards"
  on public.credit_cards for delete using (auth.uid() = user_id);

create trigger update_credit_cards_updated_at
  before update on public.credit_cards
  for each row execute procedure public.update_updated_at_column();

create table public.credit_card_charges (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.credit_cards(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  currency char(3) not null,
  base_amount numeric(12, 2) not null check (base_amount >= 0),
  fx_rate numeric(12, 6) not null default 1,
  category_id uuid references public.categories(id) on delete set null,
  vendor text,
  date date not null,
  notes text,
  statement_period_start date not null,
  statement_period_end date not null,
  created_at timestamptz default now() not null
);

create index idx_credit_card_charges_card_id on public.credit_card_charges(card_id, date desc);

alter table public.credit_card_charges enable row level security;

create policy "Users can view own card charges"
  on public.credit_card_charges for select
  using (exists (
    select 1 from public.credit_cards c where c.id = card_id and c.user_id = auth.uid()
  ));
create policy "Users can create own card charges"
  on public.credit_card_charges for insert
  with check (exists (
    select 1 from public.credit_cards c where c.id = card_id and c.user_id = auth.uid()
  ));
create policy "Users can delete own card charges"
  on public.credit_card_charges for delete
  using (exists (
    select 1 from public.credit_cards c where c.id = card_id and c.user_id = auth.uid()
  ));

create table public.credit_card_payments (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.credit_cards(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  currency char(3) not null,
  base_amount numeric(12, 2) not null check (base_amount >= 0),
  paid_at date not null,
  expense_id uuid references public.expenses(id) on delete set null,
  notes text,
  created_at timestamptz default now() not null
);

create index idx_credit_card_payments_card_id on public.credit_card_payments(card_id, paid_at desc);

alter table public.credit_card_payments enable row level security;

create policy "Users can view own card payments"
  on public.credit_card_payments for select
  using (exists (
    select 1 from public.credit_cards c where c.id = card_id and c.user_id = auth.uid()
  ));
create policy "Users can create own card payments"
  on public.credit_card_payments for insert
  with check (exists (
    select 1 from public.credit_cards c where c.id = card_id and c.user_id = auth.uid()
  ));
