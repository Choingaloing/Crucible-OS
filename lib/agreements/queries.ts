import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ClientAgreement } from '@/types/cruciblePro'

export const AGREEMENT_COLUMNS =
  'id, user_id, slug, template, title, status, effective_date, effective_on_signing, company_name, client_name, client_email, client_phone, monthly_fee, crucible_signer, signer_name, signer_title, signed_date, signature_data, signature_type, signed_at, created_at, updated_at'

/** Public-safe shape: everything the signing page needs, nothing it doesn't. */
export type PublicAgreement = Omit<ClientAgreement, 'user_id'>

function normalize(row: Record<string, unknown>): ClientAgreement {
  return {
    ...(row as unknown as ClientAgreement),
    // Postgres numeric comes back as a string via supabase-js
    monthly_fee: Number(row.monthly_fee),
  }
}

export async function getAgreementBySlug(slug: string): Promise<ClientAgreement | null> {
  const { data } = await supabaseAdmin
    .from('client_agreements')
    .select(AGREEMENT_COLUMNS)
    .eq('slug', slug)
    .maybeSingle()
  if (!data) return null
  return normalize(data as unknown as Record<string, unknown>)
}

export function toPublicAgreement(a: ClientAgreement): PublicAgreement {
  const { user_id: _omit, ...rest } = a
  void _omit
  return rest
}

export { agreementPublicPath, agreementPublicUrl, slugify } from './format'
