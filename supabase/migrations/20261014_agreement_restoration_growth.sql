-- Restoration Growth Engine template + optional month-one setup fee.
-- (Applied to production on 2026-10-14.)
ALTER TABLE client_agreements ADD COLUMN IF NOT EXISTS setup_fee NUMERIC(10,2);
ALTER TABLE client_agreements DROP CONSTRAINT IF EXISTS client_agreements_template_check;
ALTER TABLE client_agreements ADD CONSTRAINT client_agreements_template_check
  CHECK (template IN ('pov_pro', 'pov_pro_trial', 'growth_systems', 'restoration_growth'));
