-- restoration_growth agreements: per-service toggles (POV already exists)
alter table public.client_agreements
  add column if not exists meta_ads_included boolean not null default true,
  add column if not exists reputation_included boolean not null default true;
