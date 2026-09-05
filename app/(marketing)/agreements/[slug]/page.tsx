import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Caveat } from 'next/font/google'
import { getAgreementBySlug, toPublicAgreement } from '@/lib/agreements/queries'
import { AgreementView } from '@/components/agreements/AgreementView'

// Public, unguessable-slug signing page. Always fresh so a signed state shows immediately.
export const dynamic = 'force-dynamic'

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['500', '600'],
  display: 'swap',
  variable: '--font-script',
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const agreement = await getAgreementBySlug(slug)
  return {
    title: agreement
      ? `${agreement.title} — ${agreement.company_name} | Crucible`
      : 'Agreement | Crucible',
    robots: { index: false, follow: false },
  }
}

export default async function AgreementSigningPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const agreement = await getAgreementBySlug(slug)
  if (!agreement || agreement.status === 'void' || agreement.status === 'draft') notFound()

  return (
    <div className={caveat.variable}>
      <AgreementView
        agreement={toPublicAgreement(agreement)}
        scriptFont="var(--font-script), 'Caveat', cursive"
        scriptClassName={caveat.className}
      />
    </div>
  )
}
