-- Growth Partner template: the client picks a pricing option at signing.
--   Option A (retainer):      monthly_fee per month, 30 days notice.
--   Option B (revenue_share): setup_fee upfront + revenue_share_pct of attributed revenue, 6-month close-out.
-- Already applied to production by hand on 2026-11-15; this file records it and is safe to re-run.
ALTER TABLE client_agreements ADD COLUMN IF NOT EXISTS revenue_share_pct numeric;
ALTER TABLE client_agreements ADD COLUMN IF NOT EXISTS pricing_option text;

ALTER TABLE client_agreements DROP CONSTRAINT IF EXISTS client_agreements_pricing_option_check;
ALTER TABLE client_agreements ADD CONSTRAINT client_agreements_pricing_option_check
  CHECK (pricing_option IS NULL OR pricing_option IN ('retainer', 'revenue_share'));

ALTER TABLE client_agreements DROP CONSTRAINT IF EXISTS client_agreements_template_check;
ALTER TABLE client_agreements ADD CONSTRAINT client_agreements_template_check
  CHECK (template IN ('pov_pro', 'pov_pro_trial', 'growth_systems', 'restoration_growth', 'launch_package', 'growth_partner'));
