-- Credit system for Tap AI features
-- Run after the base schema.sql

-- Credit balance per user
create table if not exists tap.credits (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  balance   integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

-- Audit log of every credit change
create table if not exists tap.credit_transactions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  action              text not null,  -- 'signup_bonus' | 'generate_portfolio' | 'regenerate_portfolio' | 'bio_rewrite' | 'theme_rerender' | 'purchase'
  credits_change      integer not null,  -- negative for consumption, positive for top-up
  razorpay_payment_id text,
  created_at          timestamptz not null default now()
);

-- Indexes
create index if not exists credit_transactions_user_id_idx on tap.credit_transactions(user_id);
create index if not exists credit_transactions_created_at_idx on tap.credit_transactions(created_at desc);

-- RLS
alter table tap.credits enable row level security;
alter table tap.credit_transactions enable row level security;

create policy "owner_all" on tap.credits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owner_read" on tap.credit_transactions
  for select using (auth.uid() = user_id);

-- Service role can do everything (needed for server-side credit grants via webhook)
create policy "service_all_credits" on tap.credits
  for all to service_role using (true) with check (true);

create policy "service_all_transactions" on tap.credit_transactions
  for all to service_role using (true) with check (true);

-- Grant signup bonus: call this from the onboarding flow after user creation
-- Usage: select tap.grant_signup_bonus('<user_id>');
create or replace function tap.grant_signup_bonus(p_user_id uuid)
returns void language plpgsql security definer as $$
begin
  insert into tap.credits (user_id, balance)
  values (p_user_id, 20)
  on conflict (user_id) do update
    set balance = tap.credits.balance + 20, updated_at = now()
  where tap.credits.balance = 0;  -- only grant once

  insert into tap.credit_transactions (user_id, action, credits_change)
  values (p_user_id, 'signup_bonus', 20);
end;
$$;

-- Deduct credits atomically (returns false if insufficient balance)
-- Usage: select tap.deduct_credits('<user_id>', 10, 'generate_portfolio');
create or replace function tap.deduct_credits(p_user_id uuid, p_amount integer, p_action text)
returns boolean language plpgsql security definer as $$
declare
  v_balance integer;
begin
  select balance into v_balance from tap.credits where user_id = p_user_id for update;

  if v_balance is null or v_balance < p_amount then
    return false;
  end if;

  update tap.credits
  set balance = balance - p_amount, updated_at = now()
  where user_id = p_user_id;

  insert into tap.credit_transactions (user_id, action, credits_change)
  values (p_user_id, p_action, -p_amount);

  return true;
end;
$$;
