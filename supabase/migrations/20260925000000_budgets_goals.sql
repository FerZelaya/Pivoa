-- Pivoa Budgets & Goals Migration
-- Creates user_settings, category_budgets, and savings_goals tables with RLS policies

-- ============================================
-- USER SETTINGS TABLE
-- ============================================
-- Stores user preferences including monthly income cap and onboarding status
create table public.user_settings (
  user_id uuid primary key references public.users(id) on delete cascade,
  monthly_income_cap numeric(12,2) default 0 check (monthly_income_cap >= 0),
  currency char(3) default 'USD' not null,
  onboarding_completed boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS on user_settings
alter table public.user_settings enable row level security;

-- Users can only view their own settings
create policy "Users can view own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

-- Users can create their own settings
create policy "Users can create own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

-- Users can update their own settings
create policy "Users can update own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

-- Trigger to update updated_at on user_settings
create trigger update_user_settings_updated_at
  before update on public.user_settings
  for each row execute procedure public.update_updated_at_column();

-- ============================================
-- CATEGORY BUDGETS TABLE
-- ============================================
-- Stores per-category monthly spending limits
create table public.category_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  monthly_limit numeric(12,2) not null check (monthly_limit > 0),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Each user can only have one budget per category
  constraint unique_user_category_budget unique (user_id, category_id)
);

-- Create indexes for faster lookups
create index idx_category_budgets_user_id on public.category_budgets(user_id);
create index idx_category_budgets_category_id on public.category_budgets(category_id);

-- Enable RLS on category_budgets
alter table public.category_budgets enable row level security;

-- Users can only view their own category budgets
create policy "Users can view own category budgets"
  on public.category_budgets for select
  using (auth.uid() = user_id);

-- Users can create their own category budgets
create policy "Users can create own category budgets"
  on public.category_budgets for insert
  with check (auth.uid() = user_id);

-- Users can update their own category budgets
create policy "Users can update own category budgets"
  on public.category_budgets for update
  using (auth.uid() = user_id);

-- Users can delete their own category budgets
create policy "Users can delete own category budgets"
  on public.category_budgets for delete
  using (auth.uid() = user_id);

-- Trigger to update updated_at on category_budgets
create trigger update_category_budgets_updated_at
  before update on public.category_budgets
  for each row execute procedure public.update_updated_at_column();

-- ============================================
-- SAVINGS GOALS TABLE
-- ============================================
-- Stores user savings goals with progress tracking
create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  target_amount numeric(12,2) not null check (target_amount > 0),
  current_amount numeric(12,2) default 0 not null check (current_amount >= 0),
  target_date date,
  icon text default 'piggy-bank' not null,
  color text default '#4F46E5' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create index for faster lookups
create index idx_savings_goals_user_id on public.savings_goals(user_id);

-- Enable RLS on savings_goals
alter table public.savings_goals enable row level security;

-- Users can only view their own savings goals
create policy "Users can view own savings goals"
  on public.savings_goals for select
  using (auth.uid() = user_id);

-- Users can create their own savings goals
create policy "Users can create own savings goals"
  on public.savings_goals for insert
  with check (auth.uid() = user_id);

-- Users can update their own savings goals
create policy "Users can update own savings goals"
  on public.savings_goals for update
  using (auth.uid() = user_id);

-- Users can delete their own savings goals
create policy "Users can delete own savings goals"
  on public.savings_goals for delete
  using (auth.uid() = user_id);

-- Trigger to update updated_at on savings_goals
create trigger update_savings_goals_updated_at
  before update on public.savings_goals
  for each row execute procedure public.update_updated_at_column();

-- ============================================
-- AUTO-CREATE USER SETTINGS ON SIGNUP
-- ============================================
-- Modify the handle_new_user function to also create user_settings
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Create user profile
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null)
  );
  
  -- Create default user settings
  insert into public.user_settings (user_id, monthly_income_cap, currency, onboarding_completed)
  values (
    new.id,
    0,
    'USD',
    false
  );
  
  return new;
end;
$$;
