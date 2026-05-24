-- Sections table for profile content blocks
-- Run after schema.sql

create table if not exists tap.sections (
  id         uuid primary key default gen_random_uuid(),
  page_id    uuid not null references tap.pages(id) on delete cascade,
  type       text not null,  -- links|about|platforms|latest_post|services|skills|credentials|
                              -- products|hours_location|whatsapp_order|book_appointment|
                              -- upi_payment|talks|contact
  position   integer not null default 0,
  content    jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists sections_page_id_idx on tap.sections(page_id);
create index if not exists sections_page_id_position_idx on tap.sections(page_id, position);

alter table tap.sections enable row level security;

create policy "owner_all" on tap.sections
  for all using (
    auth.uid() = (select user_id from tap.pages where id = page_id)
  )
  with check (
    auth.uid() = (select user_id from tap.pages where id = page_id)
  );

create policy "public_read_published" on tap.sections
  for select using (
    exists (
      select 1 from tap.pages
      where id = page_id and published = true
    )
  );
