-- Business Launch Package template (one-time project fee; monthly_fee = total, setup_fee = deposit).
ALTER TABLE client_agreements DROP CONSTRAINT IF EXISTS client_agreements_template_check;
ALTER TABLE client_agreements ADD CONSTRAINT client_agreements_template_check
  CHECK (template IN ('pov_pro', 'pov_pro_trial', 'growth_systems', 'restoration_growth', 'launch_package'));
