-- Order messages: admin ↔ user communication on orders and support
-- This table is referenced in code but had no migration file

create table if not exists tap.order_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  order_id    uuid,           -- nullable: null for support messages not tied to an order
  order_type  text not null,  -- 'nfc' | 'visiting_card' | 'support'
  message     text not null,
  from_admin  boolean not null default false,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists order_messages_user_id_idx on tap.order_messages(user_id);
create index if not exists order_messages_created_at_idx on tap.order_messages(created_at desc);

alter table tap.order_messages enable row level security;

create policy "owner_read" on tap.order_messages
  for select using (auth.uid() = user_id);

create policy "owner_insert" on tap.order_messages
  for insert with check (auth.uid() = user_id);

create policy "owner_update_read" on tap.order_messages
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "service_all" on tap.order_messages
  for all to service_role using (true) with check (true);
