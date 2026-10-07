'use client'

import { useMemo, useRef, useState } from 'react'
import { CheckCircle2, Download, Lock, ShieldCheck } from 'lucide-react'
import type { PublicAgreement } from '@/lib/agreements/queries'
import type { AgreementTemplate } from '@/types/cruciblePro'
import { formatFee, formatLongDate, todayISO } from '@/lib/agreements/format'
import { SignaturePad, type SignaturePadHandle } from './SignaturePad'

type Props = {
  agreement: PublicAgreement
  /** CSS font-family for script signatures (from next/font). */
  scriptFont: string
  scriptClassName: string
}

export function AgreementView({ agreement: initial, scriptFont, scriptClassName }: Props) {
  const [agreement, setAgreement] = useState(initial)
  const signed = agreement.status === 'signed'

  return (
    <div className="min-h-screen bg-[#EFE6DA] print:bg-white">

      {/* Top bar */}
      <div className="print:hidden sticky top-0 z-20 bg-brand-dark text-white">
        <div className="max-w-[880px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-light.png" alt="Crucible" className="h-8 w-auto" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.12em] text-white/60 font-semibold">
                Agreement for signature
              </div>
              <div className="text-sm font-bold truncate">{agreement.company_name}</div>
            </div>
          </div>
          {signed ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-green-500/15 text-green-300 border border-green-400/30 rounded-full px-3 py-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Signed
            </span>
          ) : (
            <a
              href="#sign"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-brand-dark rounded-full px-4 py-1.5 shadow"
            >
              Review &amp; sign
            </a>
          )}
        </div>
      </div>

      <main className="max-w-[880px] mx-auto px-3 sm:px-6 py-6 sm:py-10 print:p-0 print:max-w-none">
        {signed && <SignedBanner agreement={agreement} />}

        <article className="agr bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06),0_20px_60px_rgba(43,26,14,0.10)] print:shadow-none print:rounded-none">
          <div className="px-6 sm:px-12 pt-8 sm:pt-10 pb-8 sm:pb-12">
            <DocHeader />
            <TitleBlock template={agreement.template} />
            <PartiesCard agreement={agreement} />
            {agreement.template === 'growth_systems' ? (
              <GrowthBody agreement={agreement} />
            ) : (
              <StandardBody agreement={agreement} />
            )}

            <SignaturePanel
              agreement={agreement}
              scriptFont={scriptFont}
              scriptClassName={scriptClassName}
              onSigned={setAgreement}
            />

            <DocFooter template={agreement.template} />
          </div>
        </article>

        <p className="print:hidden text-center text-[11px] text-gray-500 mt-6">
          Questions before signing? Email{' '}
          <a href="mailto:chandler@cruciblecoaching.org" className="text-brand-orange-dark font-semibold">
            chandler@cruciblecoaching.org
          </a>
        </p>
      </main>
    </div>
  )
}

function StandardBody({ agreement }: { agreement: PublicAgreement }) {
  return (
    <>
      <Section n={1} title="The Engagement" />
      <p className="agr-p">
        Crucible implements its POV content system inside{' '}
        <span className="tk">{agreement.company_name}</span> by training your team to capture real
        job-site footage, producing daily organic video and ad creative from it, and running paid campaigns
        against that creative to drive qualified lead volume.{' '}
        <strong>Your team captures; we handle everything after that.</strong>
      </p>

      <Section n={2} title="What Crucible Delivers" />
      <div className="flex flex-col gap-3">
        <DeliverableCard title="Strategy & Training">
          <li>
            Implement Crucible&apos;s proven POV content strategy, shot list, and posting schedule into your
            operation
          </li>
          <li>Train the company&apos;s team, designated POV Pro(s), and leadership on capture, upload, and daily execution</li>
          <li>Ongoing coaching and footage review to keep the system producing</li>
        </DeliverableCard>
        <DeliverableCard title="Content Production">
          <li>
            <strong>1 POV video per day</strong> (30 per month standard), edited and delivered
          </li>
          <li>
            <strong>5+ ad creatives</strong> per month built from your footage
          </li>
          <li>
            <strong>5+ job highlight features</strong>, formatted for your website to support local SEO, trust,
            and improve website conversion rate
          </li>
        </DeliverableCard>
        <DeliverableCard title="Paid Media">
          <li>Launch and manage high-intent lead campaigns on Facebook, Instagram, TikTok, and YouTube</li>
          <li>
            Manage the ad budget toward your targets for cost per lead, cost per booked appointment, and cost to
            acquire a customer
          </li>
          <li>
            <strong>Bimonthly</strong> performance reporting against those targets
          </li>
        </DeliverableCard>
      </div>

      <div className="print-break" />

      <Section n={3} title="What the Client Provides" />
      <ul className="agr-list">
        <li>
          <strong>Footage.</strong> Client will need to supply POV content filmed at or around jobs each week,
          submitted at least once a week via Frame.io. Daily video delivery is contingent on this.
        </li>
        <li>
          <strong>Recording equipment.</strong> Client purchases &amp; owns camera equipment for each POV Pro,
          approximately <strong>$325 per POV Pro</strong>.
        </li>
        <li>
          <strong>Ad budget.</strong> Client is responsible for all advertising spend, billed directly by the ad
          platforms and separate from Crucible&apos;s fee.
        </li>
        <li>
          <strong>Access.</strong> Admin access to ad accounts, business manager, social profiles, and website.
        </li>
        <li>
          <strong>Point of contact.</strong> One person chosen to approve creative and hold the team accountable
          to daily capture.
        </li>
      </ul>

      <Section n={4} title="Investment & Terms" />
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-4 bg-brand-cream border border-[#EADFD1] rounded-2xl px-5 py-4 mb-3">
        <div className="flex-none flex flex-col justify-center sm:pr-5 sm:border-r border-[#EADFD1]">
          <div className="text-brand-dark font-black text-[28px] leading-none tracking-tight">
            <span className="tk text-[22px]">{formatFee(agreement.monthly_fee)}</span>
          </div>
          <div className="text-brand-orange-dark font-semibold text-[11px] uppercase tracking-[0.06em] mt-2">
            Per month
          </div>
        </div>
        <p className="agr-p !mb-0 self-center">
          Billed monthly and covering all services in Section 2.{' '}
          <strong>Advertising spend and recording equipment are separate</strong> and paid by the Client.
          Cancellable by either party with <strong>5 days written notice via email</strong> prior to the next
          billing period.
        </p>
      </div>
      <ul className="agr-list">
        <li>
          <strong>Missed payment.</strong> Crucible pauses video editing and ad management. Client has 15 days to
          process payment.
        </li>
        <li>
          <strong>Ownership.</strong> Client owns raw footage and finished videos. Crucible retains the right to
          use anonymized work in its own marketing and case studies.
        </li>
        <li>
          <strong>Ad accounts.</strong> Ad accounts and pixels are owned by the Client and remain with the Client
          at the end of the engagement.
        </li>
        <li>
          <strong>Ramp up period.</strong> Month one includes onboarding and training; delivery target for month
          one is <strong>10–15 videos</strong> while capture habits are established.
        </li>
      </ul>
    </>
  )
}

function GrowthBody({ agreement }: { agreement: PublicAgreement }) {
  const co = agreement.company_name
  return (
    <>
      <Section n={1} title="The Engagement" />
      <p className="agr-p">
        Crucible builds and manages <span className="tk">{co}</span>&apos;s digital acquisition systems: the
        company website, organic search (SEO), cold email outreach, Google Ads, and Google Local Services Ads.{' '}
        <strong>The goal of the engagement is two new custom home build projects per month</strong> generated
        through these systems.
      </p>

      <Section n={2} title="What Crucible Delivers" />
      <div className="flex flex-col gap-3">
        <DeliverableCard title="Website">
          <li>Develop and manage the company website, including adding and maintaining pages</li>
        </DeliverableCard>
        <DeliverableCard title="SEO">
          <li>
            Restore organic search ranking to its original performance or better{' '}
            <strong>within 90 days of the Effective Date</strong>, then maintain it
          </li>
        </DeliverableCard>
        <DeliverableCard title="Cold Outreach">
          <li>Launch and manage cold email campaigns at scale</li>
        </DeliverableCard>
        <DeliverableCard title="Paid Leads">
          <li>
            Develop and manage Google Ads campaigns and Local Services Ads (LSA) profiles for improved lead
            volume
          </li>
        </DeliverableCard>
        <DeliverableCard title="Reporting">
          <li>A monthly summary of leads and projects against the two-projects-a-month goal</li>
        </DeliverableCard>
      </div>

      <div className="print-break" />

      <Section n={3} title="What the Client Provides" />
      <ul className="agr-list">
        <li>
          <strong>Access.</strong> Admin access to Google Search Console, Google Ads, Google Business Profile and
          Local Services Ads, the website and its hosting, the domain, and the email domain used for outreach.
        </li>
        <li>
          <strong>Ad budget.</strong> All advertising spend, billed directly by Google and separate from
          Crucible&apos;s fee.
        </li>
        <li>
          <strong>Point of contact.</strong> One person to approve pages, copy, and campaigns, and to respond to
          approval requests promptly so the 90-day SEO target can be met.
        </li>
        <li>
          <strong>Sales follow-up.</strong> Timely follow-up on the leads the systems generate.
        </li>
      </ul>

      <Section n={4} title="Investment & Terms" />
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-4 bg-brand-cream border border-[#EADFD1] rounded-2xl px-5 py-4 mb-3">
        <div className="flex-none flex flex-col justify-center sm:pr-5 sm:border-r border-[#EADFD1]">
          <div className="text-brand-dark font-black text-[28px] leading-none tracking-tight">
            <span className="tk text-[22px]">{formatFee(agreement.monthly_fee)}</span>
          </div>
          <div className="text-brand-orange-dark font-semibold text-[11px] uppercase tracking-[0.06em] mt-2">
            Per month
          </div>
        </div>
        <p className="agr-p !mb-0 self-center">
          Billed monthly and covering all services in Section 2.{' '}
          <strong>Advertising spend is separate</strong> and paid by the Client.{' '}
          <strong>Cancellable by either party at any time with 30 days written notice via email.</strong>
        </p>
      </div>
      <ul className="agr-list">
        <li>
          <strong>Missed payment.</strong> Crucible pauses work until payment is received. Client has 15 days to
          process payment.
        </li>
        <li>
          <strong>Ownership.</strong> Client owns the website, its content, the domain, ad accounts, LSA profile,
          and all leads. Crucible retains the right to use anonymized work in its own marketing and case studies.
        </li>
        <li>
          <strong>Goal, not guarantee.</strong> Two projects per month is the objective the systems are built
          toward. Results depend on market conditions, ad budget, and the Client&apos;s sales follow-up, and are
          not guaranteed.
        </li>
      </ul>
    </>
  )
}

const TEMPLATE_COPY: Record<AgreementTemplate, { footer: string; title: string; subtitle: string }> = {
  pov_pro: {
    footer: 'POV Pro Implementation Agreement',
    title: 'POV Pro Implementation',
    subtitle: 'Content System, Production & Paid Media',
  },
  growth_systems: {
    footer: 'Growth Systems Agreement',
    title: 'Growth Systems',
    subtitle: 'Website, SEO, Outreach & Paid Lead Generation',
  },
}

/** Effective-date label: when the agreement takes effect on signature, say so until it is signed. */
function effectiveDateLabel(agreement: PublicAgreement): string {
  if (agreement.effective_on_signing && agreement.status !== 'signed') return 'the date of the Client\'s signature below'
  return formatLongDate(agreement.effective_date)
}

/* ------------------------------------------------------------------------ */
/* Document chrome                                                          */
/* ------------------------------------------------------------------------ */

function DocHeader() {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-[#EADFD1]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-dark.png" alt="Crucible" className="h-[52px] sm:h-[66px] w-auto" />
      <div className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-page-muted">
        <span className="hidden sm:inline">Crucible Consulting, LLC</span>
        <span className="hidden sm:inline w-1 h-1 rounded-full bg-brand-orange" />
        <span className="text-brand-orange-dark">Confidential</span>
      </div>
    </div>
  )
}

function DocFooter({ template }: { template: AgreementTemplate }) {
  return (
    <div className="mt-8 pt-3 border-t border-[#EADFD1] flex items-center justify-between text-[10px] font-medium text-gray-400">
      <span>cruciblecoaching.org</span>
      <span>{TEMPLATE_COPY[template].footer}</span>
    </div>
  )
}

function TitleBlock({ template }: { template: AgreementTemplate }) {
  const copy = TEMPLATE_COPY[template]
  return (
    <div className="mt-4 mb-6">
      <h1 className="text-brand-dark font-black text-[30px] sm:text-[34px] leading-[1.08] tracking-[-0.03em] mb-1.5">
        {copy.title}
      </h1>
      <p className="text-brand-orange-dark font-semibold text-[15px]">{copy.subtitle}</p>
    </div>
  )
}

function PartiesCard({ agreement }: { agreement: PublicAgreement }) {
  return (
    <div className="bg-brand-cream border border-[#EADFD1] rounded-[20px] px-5 sm:px-6 py-5 mb-6">
      <p className="agr-p mb-4">
        This Agreement is made as of <span className="tk">{effectiveDateLabel(agreement)}</span> (the{' '}
        <strong>&ldquo;Effective Date&rdquo;</strong>) between <strong>Crucible Consulting, LLC</strong>{' '}
        (&ldquo;Crucible&rdquo;), operated by Chandler Ricks, 1461 W Ridge Road, Apache Junction, AZ 85203,
        Chandler@cruciblecoaching.org, and <span className="tk">{agreement.company_name}</span>{' '}
        (&ldquo;Client&rdquo;).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-7 gap-y-3.5">
        <Field label="Client Name" value={agreement.client_name} />
        <Field label="Company" value={agreement.company_name} />
        <Field label="Email" value={agreement.client_email} />
        <Field label="Phone" value={agreement.client_phone} />
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="lbl">{label}</div>
      <div className="border-b-[1.5px] border-[#C9B8A6] pb-0.5 font-semibold text-[13.5px] leading-tight text-brand-dark min-h-[1.3em]">
        {value ?? ''}
      </div>
    </div>
  )
}

function Section({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mt-6 mb-3">
      <span className="flex-none w-[30px] h-[30px] rounded-[9px] bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white font-extrabold text-sm inline-flex items-center justify-center shadow-[0_4px_12px_rgba(255,136,0,0.35)]">
        {n}
      </span>
      <h3 className="text-brand-dark font-extrabold text-[19px] leading-[1.15] tracking-[-0.02em]">{title}</h3>
    </div>
  )
}

function DeliverableCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#EADFD1] border-l-[3px] border-l-brand-orange rounded-[14px] px-4 sm:px-5 py-3.5 grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-2 sm:gap-4 items-start">
      <div className="text-brand-orange-dark font-extrabold text-[17px] sm:text-[20px] leading-[1.15] tracking-tight pt-0.5">
        {title}
      </div>
      <ul className="agr-list !gap-1.5 !mb-0">{children}</ul>
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/* Signature panel                                                          */
/* ------------------------------------------------------------------------ */

function SignaturePanel({
  agreement,
  scriptFont,
  scriptClassName,
  onSigned,
}: {
  agreement: PublicAgreement
  scriptFont: string
  scriptClassName: string
  onSigned: (a: PublicAgreement) => void
}) {
  const signed = agreement.status === 'signed'

  return (
    <div
      id="sign"
      className="bg-brand-cream border border-[#EADFD1] rounded-[20px] px-5 sm:px-7 pt-5 pb-6 mt-6 text-brand-dark scroll-mt-20"
    >
      <p className="text-brand-dark font-semibold text-[12.5px] leading-relaxed mb-5">
        By signing, each party confirms they have read, understood, and agree to be bound by this Agreement.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 select-none">
        {/* Crucible side: pre-signed */}
        <div>
          <div className="party-label">Crucible Coaching</div>
          <div className="sig-line flex items-end">
            <span className={`${scriptClassName} text-[30px] leading-none pb-1 text-[#1a1a1a]`}>
              {agreement.crucible_signer}
            </span>
          </div>
          <div className="sig-lbl">Signature</div>
          <div className="sig-line flex items-end">
            <span className="font-semibold text-[15px] leading-none pb-1">{agreement.crucible_signer}, Founder</span>
          </div>
          <div className="sig-lbl">Name / Title</div>
          <div className="sig-line flex items-end">
            <span className="font-semibold text-[15px] leading-none pb-1">
              {agreement.effective_on_signing && agreement.status !== 'signed'
                ? 'Upon signature'
                : formatLongDate(agreement.effective_date)}
            </span>
          </div>
          <div className="sig-lbl !mb-0">Date</div>
        </div>

        {/* Client side */}
        <div>
          <div className="party-label">{agreement.company_name}</div>
          {signed ? (
            <ClientSigned agreement={agreement} />
          ) : (
            <ClientSignForm
              agreement={agreement}
              scriptFont={scriptFont}
              onSigned={onSigned}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function ClientSigned({ agreement }: { agreement: PublicAgreement }) {
  return (
    <>
      <div className="sig-line flex items-end">
        {agreement.signature_data ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={agreement.signature_data} alt="Client signature" className="h-[44px] w-auto max-w-full -mb-0.5" />
        ) : null}
      </div>
      <div className="sig-lbl">Signature</div>
      <div className="sig-line flex items-end">
        <span className="font-semibold text-[15px] leading-none pb-1">
          {[agreement.signer_name, agreement.signer_title].filter(Boolean).join(', ')}
        </span>
      </div>
      <div className="sig-lbl">Name / Title</div>
      <div className="sig-line flex items-end">
        <span className="font-semibold text-[15px] leading-none pb-1">{formatLongDate(agreement.signed_date)}</span>
      </div>
      <div className="sig-lbl !mb-0">Date</div>
    </>
  )
}

function splitName(clientName: string | null): { name: string; title: string } {
  if (!clientName) return { name: '', title: '' }
  const [name, ...rest] = clientName.split(',')
  return { name: name.trim(), title: rest.join(',').trim() }
}

function ClientSignForm({
  agreement,
  scriptFont,
  onSigned,
}: {
  agreement: PublicAgreement
  scriptFont: string
  onSigned: (a: PublicAgreement) => void
}) {
  const defaults = useMemo(() => splitName(agreement.client_name), [agreement.client_name])
  const [name, setName] = useState(defaults.name)
  const [title, setTitle] = useState(defaults.title)
  const [date, setDate] = useState(todayISO)
  const [agree, setAgree] = useState(false)
  const [hasSig, setHasSig] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const padRef = useRef<SignaturePadHandle>(null)

  const canSubmit = name.trim().length > 1 && date && agree && hasSig && !submitting

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const sig = padRef.current?.getSignature()
    if (!sig) {
      setError('Please add your signature.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/agreements/${agreement.slug}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signer_name: name.trim(),
          signer_title: title.trim() || null,
          signed_date: date,
          signature_data: sig.dataUrl,
          signature_type: sig.type,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error ?? 'Something went wrong. Please try again.')
      onSigned(json.agreement as PublicAgreement)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 print:hidden">
      <div>
        <div className="sig-lbl !mb-1.5 flex items-center gap-1">
          Signature <span className="text-brand-orange">*</span>
        </div>
        <SignaturePad
          ref={padRef}
          defaultTypedName={name}
          scriptFont={scriptFont}
          onChange={setHasSig}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
        <label className="block">
          <div className="sig-lbl !mb-1.5">
            Full name <span className="text-brand-orange">*</span>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            placeholder="Your full legal name"
            className="w-full text-sm px-3 py-2 rounded-lg border border-[#C9B8A6] bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
          />
        </label>
        <label className="block">
          <div className="sig-lbl !mb-1.5">Title</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="President"
            className="w-full text-sm px-3 py-2 rounded-lg border border-[#C9B8A6] bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
          />
        </label>
      </div>

      <label className="block">
        <div className="sig-lbl !mb-1.5">
          Date <span className="text-brand-orange">*</span>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full sm:w-auto text-sm px-3 py-2 rounded-lg border border-[#C9B8A6] bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
        />
      </label>

      <label className="flex items-start gap-2.5 text-[12px] leading-snug text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-[#C9B8A6] accent-[#E86530]"
        />
        <span>
          I am authorized to sign on behalf of <strong>{agreement.company_name}</strong>, I have read this Agreement,
          and I agree that my electronic signature is the legal equivalent of my handwritten signature.
        </span>
      </label>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-brand-dark font-black text-sm px-5 py-3 shadow-[0_6px_18px_rgba(255,136,0,0.35)] disabled:opacity-50 disabled:shadow-none transition"
      >
        <Lock className="w-4 h-4" />
        {submitting ? 'Signing…' : 'Sign & complete agreement'}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-[10.5px] text-gray-500">
        <ShieldCheck className="w-3.5 h-3.5" /> Your signature, date, and IP address are recorded for verification.
      </p>
    </form>
  )
}

function SignedBanner({ agreement }: { agreement: PublicAgreement }) {
  const when = formatLongDate(agreement.signed_date ?? agreement.signed_at)
  return (
    <div className="print:hidden mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white border border-green-200 px-5 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex-none w-9 h-9 rounded-full bg-green-100 text-green-700 inline-flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5" />
        </span>
        <div>
          <div className="font-bold text-gray-900 text-sm">Agreement signed</div>
          <div className="text-xs text-gray-500">
            Signed by {agreement.signer_name}
            {agreement.signer_title ? `, ${agreement.signer_title}` : ''} on {when}. A copy is saved to your Crucible
            Pro billing page.
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gray-900 text-white text-xs font-bold px-4 py-2"
      >
        <Download className="w-3.5 h-3.5" /> Download PDF
      </button>
    </div>
  )
}
