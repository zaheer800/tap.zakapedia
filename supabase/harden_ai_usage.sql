-- Per-user AI usage log + close the credit functions to the public key (2026-09-20).
-- Run in the shared Tap/CRM project (schema tap). Already applied to the live project.
--
-- Why: the ai-generate edge function was callable by anyone with the public anon key, and
-- tap.deduct_credits / tap.grant_signup_bonus were SECURITY DEFINER functions executable by
-- anon that trusted a caller-supplied user id (add/remove credits for any user, repeat the
-- signup bonus whenever a balance reached 0).

-- ── usage log (written and read only by the edge function via the service role) ──
create table if not exists tap.ai_usage (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  mode       text        not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_user_time_idx on tap.ai_usage (user_id, created_at desc);

alter table tap.ai_usage enable row level security;   -- deliberately no policies
revoke all on tap.ai_usage from anon, authenticated;
grant all on tap.ai_usage to service_role;

-- ── tap.deduct_credits: nothing in the app calls it (the client updates balances directly) ──
create or replace function tap.deduct_credits(p_user_id uuid, p_amount integer, p_action text)
returns boolean
language plpgsql
security definer
set search_path = tap, public
as $$
declare
  v_balance integer;
begin
  if coalesce(auth.role(), '') <> 'service_role' and auth.uid() is distinct from p_user_id then
    raise exception 'not allowed';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

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

revoke execute on function tap.deduct_credits(uuid, integer, text) from public, anon, authenticated;
grant  execute on function tap.deduct_credits(uuid, integer, text) to service_role;

-- ── tap.grant_signup_bonus: the onboarding flow calls it as the signed-in user ──
-- Now only for yourself (or the service role), and only once per user.
create or replace function tap.grant_signup_bonus(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = tap, public
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' and auth.uid() is distinct from p_user_id then
    raise exception 'not allowed';
  end if;

  if exists (
    select 1 from tap.credit_transactions
    where user_id = p_user_id and action = 'signup_bonus'
  ) then
    return;
  end if;

  insert into tap.credits (user_id, balance)
  values (p_user_id, 20)
  on conflict (user_id) do update
    set balance = tap.credits.balance + 20, updated_at = now()
  where tap.credits.balance = 0;

  insert into tap.credit_transactions (user_id, action, credits_change)
  values (p_user_id, 'signup_bonus', 20);
end;
$$;

revoke execute on function tap.grant_signup_bonus(uuid) from public, anon;
grant  execute on function tap.grant_signup_bonus(uuid) to authenticated, service_role;

-- ── ROLLBACK ──
-- drop table if exists tap.ai_usage;
-- (restore the previous function bodies from supabase/add_credits.sql and re-grant execute to anon/authenticated)
