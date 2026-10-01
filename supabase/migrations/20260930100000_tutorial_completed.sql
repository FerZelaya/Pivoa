-- Optional product tour. Existing accounts are marked done so only new signups auto-start.
alter table public.user_settings
  add column if not exists tutorial_completed boolean not null default false;

update public.user_settings
  set tutorial_completed = true
  where tutorial_completed = false;
