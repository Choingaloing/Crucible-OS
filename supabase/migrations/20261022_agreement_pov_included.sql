-- restoration_growth agreements can exclude the POV Content System
alter table public.client_agreements
  add column if not exists pov_included boolean not null default true;
