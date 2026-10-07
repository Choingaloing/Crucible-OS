-- Agreement templates + effective-on-signing option.
-- (Already applied to production on 2026-10-07; kept here for the record.)

ALTER TABLE client_agreements
  ADD COLUMN IF NOT EXISTS effective_on_signing BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE client_agreements DROP CONSTRAINT IF EXISTS client_agreements_template_check;
ALTER TABLE client_agreements
  ADD CONSTRAINT client_agreements_template_check
  CHECK (template IN ('pov_pro', 'pov_pro_trial', 'growth_systems'));
