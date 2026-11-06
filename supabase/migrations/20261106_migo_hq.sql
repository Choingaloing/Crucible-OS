-- Migo HQ: Chandler's master-agent command layer.
-- migo_debriefs  = one row per recorded call (Fathom), summarized by Migo/Moldy, waiting for Chandler's approval.
-- migo_dispatch  = every promise / deliverable / build task, routed to the Claude project (agent) that owns it.
-- Admin-only. Agents (Migo, Moldy, project sessions) read/write through the Supabase connector (service role).

create table if not exists public.migo_debriefs (
  id uuid primary key default gen_random_uuid(),
  fathom_recording_id text unique,
  fathom_url text,
  title text not null,
  call_date timestamptz,
  business text not null default 'crucible'
    check (business in ('crucible', 'mold_launch', 'personal')),
  client_id uuid references public.profiles(id) on delete set null,
  client_name text,
  attendees text[] not null default '{}',
  summary text,
  decisions text,
  open_questions text,
  follow_up_email_draft text,
  status text not null default 'awaiting_approval'
    check (status in ('awaiting_approval', 'approved', 'rejected', 'dispatched')),
  approved_at timestamptz,
  created_by_agent text not null default 'migo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.migo_dispatch (
  id uuid primary key default gen_random_uuid(),
  debrief_id uuid references public.migo_debriefs(id) on delete set null,
  business text not null default 'crucible'
    check (business in ('crucible', 'mold_launch', 'personal')),
  destination text not null default 'migo'
    check (destination in ('crucible_clients', 'bos_app', 'mold_launch', 'migo', 'personal')),
  owner_agent text not null default 'migo',
  client_id uuid references public.profiles(id) on delete set null,
  client_name text,
  title text not null,
  scope text,
  acceptance_criteria text,
  promised_to text,
  source_quote text,
  due_date date,
  priority text not null default 'p2' check (priority in ('p1', 'p2', 'p3')),
  status text not null default 'proposed'
    check (status in ('proposed', 'approved', 'in_progress', 'in_review', 'done', 'blocked', 'cancelled')),
  blocked_reason text,
  deliverable_url text,
  work_log jsonb not null default '[]'::jsonb,
  last_touched_by text,
  approved_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists migo_dispatch_status_due_idx on public.migo_dispatch (status, due_date);
create index if not exists migo_dispatch_destination_idx on public.migo_dispatch (destination, status);
create index if not exists migo_debriefs_status_idx on public.migo_debriefs (status, call_date desc);

create or replace function public.migo_touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists migo_debriefs_touch on public.migo_debriefs;
create trigger migo_debriefs_touch before update on public.migo_debriefs
  for each row execute function public.migo_touch_updated_at();

drop trigger if exists migo_dispatch_touch on public.migo_dispatch;
create trigger migo_dispatch_touch before update on public.migo_dispatch
  for each row execute function public.migo_touch_updated_at();

alter table public.migo_debriefs enable row level security;
alter table public.migo_dispatch enable row level security;

-- Only admins can see or change Migo data through the user-scoped client.
drop policy if exists migo_debriefs_admin_all on public.migo_debriefs;
create policy migo_debriefs_admin_all on public.migo_debriefs for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists migo_dispatch_admin_all on public.migo_dispatch;
create policy migo_dispatch_admin_all on public.migo_dispatch for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
