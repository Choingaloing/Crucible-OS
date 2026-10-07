import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  AGREEMENT_COLUMNS,
  agreementPublicUrl,
  getAgreementBySlug,
  toPublicAgreement,
} from '@/lib/agreements/queries'
import type { ClientAgreement } from '@/types/cruciblePro'

// Public route (no auth): the unguessable slug is the credential.
// Signing is one-shot; a second attempt on a signed agreement is rejected.

const MAX_SIGNATURE_BYTES = 400_000 // ~400 KB PNG data URL

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const agreement = await getAgreementBySlug(slug)
  if (!agreement || agreement.status === 'void' || agreement.status === 'draft') {
    return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
  }
  if (agreement.status === 'signed') {
    return NextResponse.json({ error: 'This agreement has already been signed.' }, { status: 409 })
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const signerName = typeof body.signer_name === 'string' ? body.signer_name.trim() : ''
  const signerTitle = typeof body.signer_title === 'string' ? body.signer_title.trim() : ''
  const signedDate = typeof body.signed_date === 'string' ? body.signed_date.slice(0, 10) : ''
  const signatureData = typeof body.signature_data === 'string' ? body.signature_data : ''
  const signatureType = body.signature_type === 'typed' ? 'typed' : 'drawn'

  if (signerName.length < 2) return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(signedDate)) {
    return NextResponse.json({ error: 'Please enter a valid date.' }, { status: 400 })
  }
  if (!signatureData.startsWith('data:image/png;base64,')) {
    return NextResponse.json({ error: 'Please add your signature.' }, { status: 400 })
  }
  if (signatureData.length > MAX_SIGNATURE_BYTES) {
    return NextResponse.json({ error: 'Signature image is too large.' }, { status: 413 })
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    null
  const userAgent = req.headers.get('user-agent')?.slice(0, 500) ?? null
  const now = new Date().toISOString()

  const { data: updated, error } = await supabaseAdmin
    .from('client_agreements')
    .update({
      status: 'signed',
      ...(agreement.effective_on_signing ? { effective_date: signedDate } : {}),
      signer_name: signerName,
      signer_title: signerTitle || null,
      signed_date: signedDate,
      signature_data: signatureData,
      signature_type: signatureType,
      signed_at: now,
      signer_ip: ip,
      signer_user_agent: userAgent,
      updated_at: now,
    })
    .eq('id', agreement.id)
    .eq('status', 'sent') // guard against a race with a second submit
    .select(AGREEMENT_COLUMNS)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!updated) {
    return NextResponse.json({ error: 'This agreement has already been signed.' }, { status: 409 })
  }

  // Surface the signed copy on the client's Crucible Pro billing page.
  await supabaseAdmin
    .from('subscriptions')
    .update({ client_agreement_url: agreementPublicUrl(slug), updated_at: now })
    .eq('user_id', agreement.user_id)

  const result = { ...(updated as unknown as ClientAgreement), monthly_fee: Number(updated.monthly_fee) }
  return NextResponse.json({ agreement: toPublicAgreement(result) })
}
