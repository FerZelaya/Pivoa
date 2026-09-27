-- Rename unused Stripe billing ids to PayPal subscription fields.

alter table public.users rename column stripe_customer_id to paypal_payer_id;
alter table public.users rename column stripe_subscription_id to paypal_subscription_id;

drop index if exists users_stripe_customer_id_key;
create unique index if not exists users_paypal_subscription_id_key
  on public.users (paypal_subscription_id)
  where paypal_subscription_id is not null;

create or replace function public.protect_user_billing_columns()
returns trigger
language plpgsql
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;
  if new.plan is distinct from old.plan
    or new.paypal_payer_id is distinct from old.paypal_payer_id
    or new.paypal_subscription_id is distinct from old.paypal_subscription_id
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
