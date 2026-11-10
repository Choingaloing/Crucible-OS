-- Client dashboards in Crucible Pro: per-client marketing data sources + shared to-dos.

-- Which Windsor-connected accounts belong to each client. Admin edits it in the
-- Crucible Pro Marketing tab; the marketing API reads it to filter Windsor rows.
create table if not exists public.client_data_sources (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  google_ads_accounts text[] not null default '{}',
  gbp_locations text[] not null default '{}',
  gsc_property text,
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
