-- Client agreements: e-sign flow for service agreements (POV Pro, etc).
-- Each row is one agreement sent to one client, reachable at a public
-- URL /agreements/<slug>. The public page reads via the service-role client
-- and is gated on slug match only (the slug is the secret). Signing writes
-- the signature image + signer details and stamps subscriptions.client_agreement_url
-- so the signed copy shows up on the Crucible Pro billing page.

CREATE TABLE IF NOT EXISTS client_agreements (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug             TEXT UNIQUE NOT NULL,
  template         TEXT NOT NULL DEFAULT 'pov_pro'
                     CHECK (template IN ('pov_pro')),
  title            TEXT NOT NULL DEFAULT 'POV Pro Implementation Agreement',
  status           TEXT NOT NULL DEFAULT 'sent'
                     CHECK (status IN ('draft', 'sent', 'signed', 'void')),

  -- Pre-filled terms
  effective_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  company_name     TEXT NOT NULL,
  client_name      TEXT,            -- expected signer, e.g. "Shawn George, President"
  client_email     TEXT,
  client_phone     TEXT,
  monthly_fee      NUMERIC(10,2) NOT NULL,

  -- Crucible side (pre-signed)
  crucible_signer  TEXT NOT NULL DEFAULT 'Chandler Ricks',

  -- Filled in by the client at signing time
  signer_name      TEXT,
  signer_title     TEXT,
  signed_date      DATE,
  signature_data   TEXT,            -- data:image/png;base64,... of the drawn/typed signature
  signature_type   TEXT CHECK (signature_type IN ('drawn', 'typed')),
  signed_at        TIMESTAMPTZ,
  signer_ip        TEXT,
  signer_user_agent TEXT,

  created_by       UUID REFERENCES profiles(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS client_agreements_user_idx
  ON client_agreements (user_id, created_at DESC);

ALTER TABLE client_agreements ENABLE ROW LEVEL SECURITY;

-- Clients see their own agreements
CREATE POLICY "Users can view own agreements" ON client_agreements
  FOR SELECT USING (auth.uid() = user_id);

-- Admins see all agreements
CREATE POLICY "Admins can view all agreements" ON client_agreements
  FOR SELECT USING (public.is_admin());

-- Writes go through the service-role client (admin create + public sign route);
-- no INSERT/UPDATE policies are intentionally defined.
