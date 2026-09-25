-- Full bootstrap for a fresh Supabase project.
--
-- Needed because the original project (bhpbnwesbwcepxkbxbgz) no longer exists —
-- free-tier projects pause on inactivity and are eventually deleted. Run this
-- once in the SQL editor of the NEW project, then update the env vars.
--
-- Everything here is idempotent, so re-running it is safe.

-- ---------------------------------------------------------------- meditations
create table if not exists meditations (
  id            uuid primary key default gen_random_uuid(),
  title         text        not null,
  quote         text,
  tags          text[]      not null default '{}',
  storage_path  text        not null,
  public_url    text        not null,
  mime_type     text        not null,
  transcription text,
  published     boolean     not null default true,
  featured_on   date,
  created_at    timestamptz not null default now()
);

-- Only one meditation can be pinned to a given day.
create unique index if not exists meditations_featured_on_key
  on meditations (featured_on)
  where featured_on is not null;

-- The public page reads published meditations ordered by creation.
create index if not exists meditations_published_created_idx
  on meditations (published, created_at);

-- ------------------------------------------------------------ admin allowlist
create table if not exists admin_allowlist (
  email text primary key
);

-- Add yourself and your mom here, or via the table editor:
-- insert into admin_allowlist (email) values ('you@example.com') on conflict do nothing;

-- ------------------------------------------------------------------------ RLS
-- All app access goes through the service-role key server-side, which bypasses
-- RLS. Enabling it with no public policies means a leaked anon key still can't
-- read or write anything.
alter table meditations     enable row level security;
alter table admin_allowlist enable row level security;

-- The middleware checks the allowlist using the signed-in user's own session,
-- so that one read needs an explicit policy.
drop policy if exists "signed-in users can check their own allowlist row" on admin_allowlist;
create policy "signed-in users can check their own allowlist row"
  on admin_allowlist for select
  to authenticated
  using (email = auth.jwt() ->> 'email');

-- -------------------------------------------------------------------- storage
-- Private bucket: audio is served through short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('meditations', 'meditations', false)
on conflict (id) do nothing;
