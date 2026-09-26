-- Pivoa Multi-Currency & Custom Budget Cycle Migration
-- Adds a configurable budget reset day and base-currency equivalents for expenses

-- ============================================
-- USER SETTINGS: BUDGET CYCLE RESET DAY
-- ============================================
-- Day of the month the budget cycle restarts. Days 29-31 clamp to the last day
-- of shorter months (handled in the API's getCycleWindow helper).
alter table public.user_settings
  add column cycle_start_day smallint not null default 1
    check (cycle_start_day between 1 and 31);

-- ============================================
-- EXPENSES: BASE CURRENCY EQUIVALENT
-- ============================================
-- amount/currency keep the values exactly as entered by the user.
-- base_amount is the equivalent in the user's base currency (user_settings.currency),
-- converted with fx_rate at the time the expense was logged. All KPIs, budgets and
-- charts aggregate base_amount so mixed-currency expenses add up correctly.
alter table public.expenses
  add column base_amount numeric(12,2),
  add column fx_rate numeric(18,8) default 1 not null check (fx_rate > 0);

-- Existing rows were all recorded in the user's base currency
update public.expenses set base_amount = amount where base_amount is null;

create index idx_expenses_user_date_base on public.expenses(user_id, date);

comment on column public.expenses.base_amount is
  'Expense amount converted to the user base currency at fx_rate';
comment on column public.expenses.fx_rate is
  'Rate used to convert amount (currency) into base_amount (user base currency)';

-- ============================================
-- AUTO-CREATE USER SETTINGS ON SIGNUP
-- ============================================
-- Recreated so new accounts (including Google sign-ups) get the cycle default
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
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      null
    )
  );

  -- Create default user settings
  insert into public.user_settings (
    user_id,
    monthly_income_cap,
    currency,
    cycle_start_day,
    onboarding_completed
  )
  values (new.id, 0, 'USD', 1, false);

  return new;
end;
$$;
