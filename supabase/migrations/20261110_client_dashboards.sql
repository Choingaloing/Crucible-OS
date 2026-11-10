-- Client dashboards in Crucible Pro: marketing data sources, shared to-dos,
-- website leads, marketing assets (with file uploads) and the work log.
-- Additive and safe to re-run.

-- ---------------------------------------------------------------------------
-- Which outside accounts belong to each client (Windsor ids, HubSpot forms) and
-- the client's private lead webhook token. Admin edits it in Crucible Pro.
create table if not exists public.client_data_sources (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  google_ads_accounts text[] not null default '{}',
  gbp_locations text[] not null default '{}',
  gsc_property text,
  hubspot_form_ids text[] not null default '{}',
  lead_webhook_token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  leads_synced_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.client_data_sources enable row level security;

drop policy if exists client_data_sources_admin_all on public.client_data_sources;
create policy client_data_sources_admin_all on public.client_data_sources for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists client_data_sources_own_select on public.client_data_sources;
create policy client_data_sources_own_select on public.client_data_sources for select
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Migo to-dos shared with the client: who owns the item, and whether the client sees it.
alter table public.migo_dispatch
  add column if not exists assignee text not null default 'crucible';
alter table public.migo_dispatch
  add column if not exists client_visible boolean not null default true;

do $$ begin
  alter table public.migo_dispatch
    add constraint migo_dispatch_assignee_check check (assignee in ('crucible', 'client'));
exception when duplicate_object then null; end $$;

create index if not exists migo_dispatch_client_idx on public.migo_dispatch (client_id, status);

-- ---------------------------------------------------------------------------
-- Leads from client websites (webhook) and HubSpot forms (pulled).
create table if not exists public.client_leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null default 'website',
  external_id text,
  name text,
  email text,
  phone text,
  message text,
  page_url text,
  form_name text,
  utm jsonb not null default '{}'::jsonb,
  fields jsonb not null default '{}'::jsonb,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'won', 'lost', 'spam')),
  notes text,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, source, external_id)
);

create index if not exists client_leads_user_idx on public.client_leads (user_id, submitted_at desc);

-- ---------------------------------------------------------------------------
-- Marketing assets: links or uploaded files, shared with the client or internal only.
create table if not exists public.client_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category text,
  kind text not null default 'link' check (kind in ('link', 'file')),
  url text,
  storage_path text,
  file_name text,
  mime_type text,
  size_bytes bigint,
  visibility text not null default 'client' check (visibility in ('client', 'internal')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_assets_user_idx on public.client_assets (user_id, sort_order, created_at desc);

-- ---------------------------------------------------------------------------
-- Work log: what Crucible did for the client.
create table if not exists public.client_work_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  work_date date not null default current_date,
  title text not null,
  details text,
  category text,
  link_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_work_log_user_idx on public.client_work_log (user_id, work_date desc);

-- Leads, assets and work log: admin full access, clients read their own rows.
-- Writes from clients (lead status / notes) go through API routes that check
-- ownership and then use the service role.
alter table public.client_leads enable row level security;
alter table public.client_assets enable row level security;
alter table public.client_work_log enable row level security;

drop policy if exists client_leads_admin_all on public.client_leads;
create policy client_leads_admin_all on public.client_leads for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists client_leads_own_select on public.client_leads;
create policy client_leads_own_select on public.client_leads for select using (user_id = auth.uid());

drop policy if exists client_assets_admin_all on public.client_assets;
create policy client_assets_admin_all on public.client_assets for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists client_assets_own_select on public.client_assets;
create policy client_assets_own_select on public.client_assets for select
  using (user_id = auth.uid() and visibility = 'client');

drop policy if exists client_work_log_admin_all on public.client_work_log;
create policy client_work_log_admin_all on public.client_work_log for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists client_work_log_own_select on public.client_work_log;
create policy client_work_log_own_select on public.client_work_log for select using (user_id = auth.uid());

-- Private bucket for uploaded assets. Files are only reached through short-lived
-- signed URLs handed out by the assets API.
insert into storage.buckets (id, name, public, file_size_limit)
values ('client-assets', 'client-assets', false, 52428800)
on conflict (id) do nothing;
