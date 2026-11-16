import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { getAgreementBySlug, toPublicAgreement } from '@/lib/agreements/queries'
import { AgreementView } from '@/components/agreements/AgreementView'

// Public, unguessable-slug signing page. Always fresh so a signed state shows immediately.
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// Self-hosted for the same reason as Inter in app/layout.tsx.
const caveat = localFont({
  src: '../../../fonts/caveat-latin.woff2',
  weight: '400 700',
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
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ lang?: string }>
}) {
  const { slug } = await params
  const lang = (await searchParams)?.lang === 'es' ? 'es' : 'en'
  const agreement = await getAgreementBySlug(slug)
  if (!agreement || agreement.status === 'void' || agreement.status === 'draft') notFound()

  return (
    <div className={caveat.variable}>
      <AgreementView
        agreement={toPublicAgreement(agreement)}
        scriptFont="var(--font-script), 'Caveat', cursive"
        scriptClassName={caveat.className}
        initialLang={lang}
      />
    </div>
  )
}
