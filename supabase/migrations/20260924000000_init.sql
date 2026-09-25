-- Pivoa Initial Schema Migration
-- Creates users, categories, and expenses tables with RLS policies

-- ============================================
-- USERS TABLE
-- ============================================
-- This table mirrors auth.users but stores additional profile data
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz default now() not null
);

-- Enable RLS on users
alter table public.users enable row level security;

-- Users can only read/update their own profile
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Function to automatically create a user profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null)
  );
  return new;
end;
$$;

-- Trigger to call the function on new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- CATEGORIES TABLE
-- ============================================
-- user_id is nullable: null = system default category
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  name text not null,
  icon text not null,
  color text not null,
  created_at timestamptz default now() not null,
  
  -- Each user can only have one category with a given name
  -- System categories (user_id = null) also must have unique names
  constraint unique_category_name_per_user unique (user_id, name)
);

-- Create index for faster lookups
create index idx_categories_user_id on public.categories(user_id);

-- Enable RLS on categories
alter table public.categories enable row level security;

-- Users can view their own categories AND system default categories (user_id = null)
create policy "Users can view own and default categories"
  on public.categories for select
  using (user_id is null or auth.uid() = user_id);

-- Users can create their own categories
create policy "Users can create own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

-- Users can update their own categories (not system defaults)
create policy "Users can update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

-- Users can delete their own categories (not system defaults)
create policy "Users can delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- ============================================
-- EXPENSES TABLE
-- ============================================
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  currency char(3) not null default 'USD',
  category_id uuid not null references public.categories(id) on delete restrict,
  vendor text,
  date date not null,
  receipt_image_url text,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes for common queries
create index idx_expenses_user_date on public.expenses(user_id, date desc);
create index idx_expenses_user_category on public.expenses(user_id, category_id);

-- Enable RLS on expenses
alter table public.expenses enable row level security;

-- Users can only view their own expenses
create policy "Users can view own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

-- Users can create their own expenses
create policy "Users can create own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

-- Users can update their own expenses
create policy "Users can update own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

-- Users can delete their own expenses
create policy "Users can delete own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger to update updated_at on expenses
create trigger update_expenses_updated_at
  before update on public.expenses
  for each row execute procedure public.update_updated_at_column();

-- ============================================
-- SEED DEFAULT CATEGORIES
-- ============================================
-- These are system-wide default categories (user_id = null)
insert into public.categories (user_id, name, icon, color) values
  (null, 'Food', 'utensils', '#ef4444'),
  (null, 'Transport', 'car', '#f97316'),
  (null, 'Utilities', 'zap', '#eab308'),
  (null, 'Entertainment', 'tv', '#22c55e'),
  (null, 'Health', 'heart-pulse', '#06b6d4'),
  (null, 'Shopping', 'shopping-bag', '#8b5cf6'),
  (null, 'Housing', 'home', '#ec4899'),
  (null, 'Other', 'more-horizontal', '#6b7280');
