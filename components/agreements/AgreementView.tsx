'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, Download, Globe, Lock, ShieldCheck } from 'lucide-react'
import type { PublicAgreement } from '@/lib/agreements/queries'
import type { AgreementPricingOption, AgreementTemplate } from '@/types/cruciblePro'
import { formatFee, formatLongDate, todayISO } from '@/lib/agreements/format'
import { SignaturePad, type SignaturePadHandle } from './SignaturePad'
import {
  DATE_LOCALE,
  UI,
  supportsSpanish,
  translateServerError,
  type AgreementLang,
} from './i18n'

type Props = {
  agreement: PublicAgreement
  /** CSS font-family for script signatures (from next/font). */
  scriptFont: string
  scriptClassName: string
  /** Starting language (from ?lang=es). Only templates with a translation honor 'es'. */
  initialLang?: AgreementLang
}

export function AgreementView({ agreement: initial, scriptFont, scriptClassName, initialLang = 'en' }: Props) {
  const [agreement, setAgreement] = useState(initial)
  const signed = agreement.status === 'signed'
  const canTranslate = supportsSpanish(agreement.template)
  const [langState, setLangState] = useState<AgreementLang>(initialLang)
  const lang: AgreementLang = canTranslate ? langState : 'en'
  const t = UI[lang]

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  function changeLang(next: AgreementLang) {
    setLangState(next)
    // Keep the URL shareable: ?lang=es opens straight into Spanish.
    const url = new URL(window.location.href)
    if (next === 'es') url.searchParams.set('lang', 'es')
    else url.searchParams.delete('lang')
    window.history.replaceState(null, '', url.toString())
  }

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
                {t.forSignature}
              </div>
              <div className="text-sm font-bold truncate">{agreement.company_name}</div>
            </div>
          </div>
          <div className="flex flex-none items-center gap-2">
            {canTranslate && <LanguageSwitch lang={lang} onChange={changeLang} />}
            {signed ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-green-500/15 text-green-300 border border-green-400/30 rounded-full px-3 py-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {t.signed}
              </span>
            ) : (
              <a
                href="#sign"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-brand-dark rounded-full px-4 py-1.5 shadow"
              >
                {t.reviewSign}
              </a>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-[880px] mx-auto px-3 sm:px-6 py-6 sm:py-10 print:p-0 print:max-w-none">
        {signed && <SignedBanner agreement={agreement} lang={lang} />}

        <article className="agr bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06),0_20px_60px_rgba(43,26,14,0.10)] print:shadow-none print:rounded-none">
          <div className="px-6 sm:px-12 pt-8 sm:pt-10 pb-8 sm:pb-12">
            <DocHeader lang={lang} />
            <TitleBlock agreement={agreement} lang={lang} />
            {lang === 'es' && <TranslationNotice />}
            <PartiesCard agreement={agreement} lang={lang} />
            {agreement.template === 'growth_systems' ? (
              <GrowthBody agreement={agreement} />
            ) : agreement.template === 'restoration_growth' ? (
              <RestorationBody agreement={agreement} />
            ) : agreement.template === 'launch_package' ? (
              <LaunchBody agreement={agreement} />
            ) : agreement.template === 'growth_partner' ? (
              lang === 'es' ? (
                <GrowthPartnerBodyEs agreement={agreement} />
              ) : (
                <GrowthPartnerBody agreement={agreement} />
              )
            ) : (
              <StandardBody agreement={agreement} />
            )}

            <SignaturePanel
              agreement={agreement}
              scriptFont={scriptFont}
              scriptClassName={scriptClassName}
              onSigned={setAgreement}
              lang={lang}
            />

            <DocFooter template={agreement.template} lang={lang} />
          </div>
        </article>

        <p className="print:hidden text-center text-[11px] text-gray-500 mt-6">
          {t.questions}{' '}
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

/** Which restoration_growth services are on for this agreement (all default on). */
export function restorationServices(a: Pick<PublicAgreement, 'pov_included' | 'meta_ads_included' | 'reputation_included'>) {
  return {
    pov: a.pov_included !== false,
    meta: a.meta_ads_included !== false,
    rep: a.reputation_included !== false,
  }
}

export function restorationSubtitle(a: Pick<PublicAgreement, 'pov_included' | 'meta_ads_included' | 'reputation_included'>): string {
  const { pov, meta, rep } = restorationServices(a)
  const parts: string[] = []
  if (pov) parts.push('POV Content')
  parts.push(meta ? 'Paid Search & Social' : 'Paid Search')
  parts.push('Landing Pages')
  if (rep) parts.push('Reputation')
  if (!rep && !meta) parts.push('Tracking')
  return parts.join(', ')
}

function RestorationBody({ agreement }: { agreement: PublicAgreement }) {
  const co = agreement.company_name
  const setup = agreement.setup_fee
  const { pov, meta, rep } = restorationServices(agreement)
  const platforms = ['Google Ads', 'LSA', ...(meta ? ['Meta'] : [])]
  const platformsText = platforms.length > 2 ? `${platforms.slice(0, -1).join(', ')}, and ${platforms[platforms.length - 1]}` : platforms.join(' and ')
  const adsText = meta ? 'paid campaigns on Google and Meta' : 'Google Ads and Local Services Ads campaigns'
  const accessList = [
    'Google Ads',
    'Google Business Profile',
    'Local Services Ads',
    ...(meta ? ['Meta Business Manager'] : []),
    ...(pov || meta ? ['social profiles'] : []),
    'the website and its hosting',
    ...(rep ? ['the CRM or job-management system used to trigger review requests'] : []),
  ]
  return (
    <>
      <Section n={1} title="The Engagement" />
      <p className="agr-p">
        Crucible builds and runs <span className="tk">{co}</span>&apos;s lead engine:{' '}
        {pov ? (
          <>a POV content system that turns real job-site footage into daily video, {adsText} that capture high-intent restoration demand, </>
        ) : (
          <>{adsText} that capture high-intent restoration demand, </>
        )}
        custom landing pages built for the searches that convert,
        {rep ? (
          <>
            {' '}and a review and reputation system that keeps <span className="tk">{co}</span> at the top of Google,
            Local Services Ads, and AI search results.
          </>
        ) : (
          <> and the tracking to show exactly what every lead and booked job costs.</>
        )}{' '}
        <strong>
          {pov
            ? 'Your team captures the footage and answers the phone; we handle everything in between.'
            : 'Your team answers the phone; we handle everything that gets it ringing.'}
        </strong>
      </p>

      <Section n={2} title="What Crucible Delivers" />
      <div className="flex flex-col gap-3">
        {pov && (
          <DeliverableCard title="POV Content System">
            <li>
              Implement Crucible&apos;s POV Pro system: content strategy, shot list, and posting schedule built for
              restoration (water, fire, mold, storm, and commercial loss jobs)
            </li>
            <li>Train the team, designated POV Pro(s), and leadership on capture, upload, and daily execution</li>
            <li>
              Up to <strong>30 POV videos per month</strong>, edited, captioned, and posted to Instagram, Facebook,
              TikTok, and YouTube
            </li>
            <li>Ongoing footage review and coaching to keep the system producing</li>
          </DeliverableCard>
        )}
        {meta && (
          <DeliverableCard title="Video Ads (Meta)">
            {pov ? (
              <li>
                Turn the strongest POV footage into <strong>5+ ad creatives per month</strong>
              </li>
            ) : (
              <li>
                Produce <strong>5+ ad creatives per month</strong> from job photos, video, and testimonials the Client
                provides
              </li>
            )}
            <li>
              Launch and manage Meta (Facebook and Instagram) lead campaigns when the content warrants it, targeted
              to homeowners and property managers in the service area
            </li>
          </DeliverableCard>
        )}
        <DeliverableCard title="High-Intent Search">
          <li>
            Build <strong>custom landing pages</strong> for the highest-intent searches (water damage, flood
            cleanup, fire restoration, mold remediation, commercial restoration) with click-to-call and fast quote
            forms
          </li>
          <li>
            Launch and manage Google Ads search campaigns to those pages, built around emergency and
            insurance-claim demand
          </li>
          <li>
            Manage or monitor Google Local Services Ads: profile, budget, lead disputes, and review velocity (at
            Client&apos;s election)
          </li>
          {!rep && (
            <li>Ongoing keyword, bid, and landing-page optimization driven by cost per booked job, not clicks</li>
          )}
        </DeliverableCard>
        {rep && (
          <DeliverableCard title="Review & Reputation">
            <li>Automated review requests after every completed job (text and email)</li>
            <li>Response to every Google review within 24 hours and weekly Google Business Profile posts</li>
            <li>
              Service and city pages written in question-and-answer form so Google AI Overviews and AI assistants
              cite <span className="tk">{co}</span> for restoration searches (answer engine optimization)
            </li>
          </DeliverableCard>
        )}
        <DeliverableCard title="Tracking & Reporting">
          <li>
            One dashboard for lead volume, cost per lead, and cost per booked job across {platformsText}
            {pov ? ', Instagram, and organic' : ''}
          </li>
          <li>Call tracking and form tracking on every landing page so each lead is attributed to its source</li>
          <li>
            <strong>Monthly</strong> performance report and a call to review results and next month&apos;s plan
          </li>
        </DeliverableCard>
      </div>

      <div className="print-break" />

      <Section n={3} title="Month One: Setup & Implementation" />
      <p className="agr-p">
        Month one is the build. {setup != null ? <>The <strong>{formatFee(setup)}</strong> setup fee covers</> : 'The setup month covers'}{' '}
        onboarding plus everything below, so recurring months start with the engine already running.
      </p>
      <ul className="agr-list">
        {pov && (
          <li>POV Pro kickoff: team training session, shot list, capture schedule, and Frame.io upload workflow in place</li>
        )}
        <li>Keyword and demand research for the service area; landing pages built and live for the top high-intent searches</li>
        <li>Google Ads account audit and rebuild (or new build), conversion tracking and call tracking installed</li>
        <li>LSA profile review and, if elected, management handoff</li>
        {meta && (
          <li>
            Meta ad account, pixel, and audiences set up; first ad creatives produced from{' '}
            {pov ? 'early footage' : 'the Client’s existing photos, video, and reviews'}
          </li>
        )}
        {rep ? (
          <li>Review request automation connected and live; Google Business Profile cleaned up</li>
        ) : (
          <li>Google Business Profile reviewed and cleaned up so LSA and Maps traffic lands on an accurate listing</li>
        )}
        <li>Reporting dashboard built; baseline numbers recorded so month two has something to beat</li>
      </ul>
      {pov && (
        <p className="agr-p" style={{ marginTop: 10 }}>
          Delivery target for month one is <strong>10 to 15 videos</strong> while capture habits are established; the
          full 30 per month applies from month two.
        </p>
      )}

      <Section n={4} title="What the Client Provides" />
      <ul className="agr-list">
        {pov ? (
          <>
            <li>
              <strong>Footage.</strong> POV content captured at or around jobs each week, uploaded at least once a week
              via Frame.io. Video delivery is contingent on this.
            </li>
            <li>
              <strong>Recording equipment.</strong> Client purchases and owns camera equipment for each POV Pro,
              approximately <strong>$325 per POV Pro</strong>.
            </li>
          </>
        ) : (
          <li>
            <strong>Photos and proof.</strong> Job photos, before-and-after shots, and customer testimonials as they
            come in, so {meta ? 'landing pages and ad creative stay' : 'landing pages stay'} fresh and real.
          </li>
        )}
        <li>
          <strong>Ad budget.</strong> All advertising spend on {platformsText}, billed directly by the platforms and
          separate from Crucible&apos;s fee.
        </li>
        <li>
          <strong>Access.</strong> Admin access to {accessList.slice(0, -1).join(', ')}, and {accessList[accessList.length - 1]}.
        </li>
        <li>
          <strong>Point of contact.</strong> One person to approve {meta || pov ? 'creative and pages' : 'pages and campaign changes'}
          {pov ? ' and to hold the team accountable to daily capture' : ' and answer questions quickly'}.
        </li>
        <li>
          <strong>Lead follow-up.</strong> Answer the phone and respond to form leads promptly; restoration leads
          decay within minutes.
        </li>
      </ul>

      <Section n={5} title="Investment & Terms" />
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-4 bg-brand-cream border border-[#EADFD1] rounded-2xl px-5 py-4 mb-3">
        <div className="flex-none flex flex-col justify-center gap-3 sm:pr-5 sm:border-r border-[#EADFD1]">
          {setup != null && (
            <div>
              <div className="text-brand-dark font-black text-[28px] leading-none tracking-tight">
                <span className="tk text-[22px]">{formatFee(setup)}</span>
              </div>
              <div className="text-brand-orange-dark font-semibold text-[11px] uppercase tracking-[0.06em] mt-2">
                Month one
              </div>
            </div>
          )}
          <div>
            <div className="text-brand-dark font-black text-[28px] leading-none tracking-tight">
              <span className="tk text-[22px]">{formatFee(agreement.monthly_fee)}</span>
            </div>
            <div className="text-brand-orange-dark font-semibold text-[11px] uppercase tracking-[0.06em] mt-2">
              {setup != null ? 'Per month after' : 'Per month'}
            </div>
          </div>
        </div>
        <p className="agr-p !mb-0 self-center">
          {setup != null ? (
            <>
              <strong>{formatFee(setup)}</strong> for month one (setup and implementation, Section 3), then{' '}
              <strong>{formatFee(agreement.monthly_fee)} per month</strong>, billed monthly and covering all services
              in Section 2.{' '}
            </>
          ) : (
            <>Billed monthly and covering all services in Section 2. </>
          )}
          <strong>Advertising spend{pov ? ' and recording equipment are' : ' is'} separate</strong> and paid by the
          Client. <strong>Month to month, no long-term contract.</strong> Cancellable by either party at any time
          with <strong>30 days written notice via email</strong>.
        </p>
      </div>
      <ul className="agr-list">
        <li>
          <strong>Missed payment.</strong> Crucible pauses {pov ? 'video editing and ' : ''}ad management. Client has
          15 days to process payment.
        </li>
        <li>
          <strong>Ownership.</strong> Client owns {pov ? 'raw footage, finished videos, ' : 'all creative, '}landing
          pages, ad accounts, {meta ? 'pixels, ' : 'tracking numbers, '}and all leads; everything stays with the Client
          at the end of the engagement. Crucible retains the right to use anonymized work in its own marketing and
          case studies.
        </li>
        <li>
          <strong>Goal, not guarantee.</strong> Lead volume depends on market conditions, ad budget, and the
          Client&apos;s response speed, and is not guaranteed.
        </li>
      </ul>
    </>
  )
}

function LaunchBody({ agreement }: { agreement: PublicAgreement }) {
  const co = agreement.company_name
  const total = agreement.monthly_fee
  const deposit = agreement.setup_fee ?? total / 2
  const balance = Math.max(total - deposit, 0)
  return (
    <>
      <Section n={1} title="The Engagement" />
      <p className="agr-p">
        Crucible builds <span className="tk">{co}</span>&apos;s complete business launch system: the online
        presence customers find (Google Business Profile, website, Instagram), the back office that runs the
        business (GoHighLevel CRM, business phone line, scheduling and client-communication automations), the
        brand and print materials used for local marketing, eight weeks of lead-generation social content, and two
        offers built to win homeowners and referral partners.{' '}
        <strong>One flat project fee, delivered as a working system, owned entirely by the Client.</strong>
      </p>

      <Section n={2} title="What Crucible Delivers" />
      <div className="flex flex-col gap-3">
        <DeliverableCard title="Online Presence">
          <li>
            <strong>Google Business Profile</strong> set up and verified: categories, service area, hours, services,
            photos, and description written to rank for local home-inspection searches
          </li>
          <li>
            <strong>Website</strong> built and launched: service pages, about page, online booking or quote request,
            click-to-call, and reviews, on a domain and hosting the Client owns
          </li>
          <li>
            <strong>Instagram</strong> business account created and branded (profile, bio, highlights, link), ready to
            post
          </li>
        </DeliverableCard>
        <DeliverableCard title="CRM & Operations">
          <li>
            <strong>GoHighLevel CRM</strong> set up with pipelines for inspection leads and referral partners,
            contact records, and calendars
          </li>
          <li>
            <strong>Everything connected:</strong> website forms, Google Business Profile, Instagram, Facebook, and
            email routed into the CRM so every lead lands in one place
          </li>
          <li>
            <strong>Business phone number</strong> provisioned inside the CRM with call tracking, voicemail, and
            text messaging
          </li>
          <li>
            <strong>Automations</strong> for scheduling (booking confirmations, reminders, reschedules) and client
            communications (new-lead response, inspection follow-up, report delivery, review request)
          </li>
        </DeliverableCard>
        <DeliverableCard title="Brand Kit">
          <li>
            <strong>Logo</strong> (primary, secondary, and icon versions) and a <strong>color scheme</strong> with
            usage guide
          </li>
          <li>
            Print-ready designs for <strong>business cards, yard signs, door hangers, and flyers</strong>, delivered
            as files the Client can send to any printer
          </li>
        </DeliverableCard>
        <DeliverableCard title="Social Content">
          <li>
            <strong>Eight weeks of social media posts</strong> (copy and image direction) written for local Facebook
            groups and the Client&apos;s own pages to generate inspection leads
          </li>
        </DeliverableCard>
        <DeliverableCard title="Offers">
          <li>
            A <strong>home inspection offer</strong>: the packaged service, pricing structure, guarantee, and the
            words to sell it
          </li>
          <li>
            An <strong>affiliate / referral offer</strong> for real estate agents and other partners who refer
            business, including the pitch and the incentive structure
          </li>
        </DeliverableCard>
      </div>

      <div className="print-break" />

      <Section n={3} title="Timeline & Handoff" />
      <ul className="agr-list">
        <li>
          <strong>Kickoff.</strong> Work begins once the deposit is received and the Client has completed the
          onboarding questionnaire and provided the access listed in Section 4.
        </li>
        <li>
          <strong>Build order.</strong> Brand kit first (logo and colors set the look of everything else), then
          Google Business Profile, website, and Instagram, then CRM, phone, and automations, then print materials,
          social content, and offers.
        </li>
        <li>
          <strong>Target completion.</strong> Approximately <strong>30 days</strong> from kickoff, assuming the
          Client supplies feedback and approvals within two business days of each request.
        </li>
        <li>
          <strong>Revisions.</strong> Two rounds of revisions on the logo and each print piece; one round on
          website copy and social posts. Additional rounds are billed at Crucible&apos;s hourly rate with the
          Client&apos;s approval.
        </li>
        <li>
          <strong>Handoff.</strong> A walkthrough of every system plus login credentials and a short written guide.
          Ongoing management after handoff is not included and can be quoted separately.
        </li>
      </ul>

      <Section n={4} title="What the Client Provides" />
      <ul className="agr-list">
        <li>
          <strong>Business details.</strong> Legal business name, service area, services and pricing, license and
          insurance details, headshot and any existing photos, and completion of the onboarding questionnaire.
        </li>
        <li>
          <strong>Access.</strong> A Google account for the business, the domain (or approval for Crucible to
          register one in the Client&apos;s name), and any existing social accounts.
        </li>
        <li>
          <strong>Subscriptions.</strong> The Client pays third-party costs directly: GoHighLevel subscription, phone
          number and usage, domain and hosting, and printing. Crucible will recommend the lowest-cost options that
          fit.
        </li>
        <li>
          <strong>Timely feedback.</strong> Approvals and feedback within two business days of each request so the
          30-day target can be met.
        </li>
      </ul>

      <Section n={5} title="Investment & Terms" />
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-4 bg-brand-cream border border-[#EADFD1] rounded-2xl px-5 py-4 mb-3">
        <div className="flex-none flex flex-col justify-center gap-3 sm:pr-5 sm:border-r border-[#EADFD1]">
          <div>
            <div className="text-brand-dark font-black text-[28px] leading-none tracking-tight">
              <span className="tk text-[22px]">{formatFee(total)}</span>
            </div>
            <div className="text-brand-orange-dark font-semibold text-[11px] uppercase tracking-[0.06em] mt-2">
              One-time project fee
            </div>
          </div>
        </div>
        <p className="agr-p !mb-0 self-center">
          <strong>{formatFee(deposit)} due at signing</strong> to begin work, and{' '}
          <strong>{formatFee(balance)} due within 30 days of signing</strong>. The fee covers every deliverable
          in Section 2. <strong>Third-party subscriptions, printing, and any advertising spend are separate</strong>{' '}
          and paid by the Client. No recurring fees.
        </p>
      </div>
      <ul className="agr-list">
        <li>
          <strong>Late balance.</strong> If the balance is not received within 30 days of signing, Crucible may
          pause remaining work and withhold final files and credentials until it is paid.
        </li>
        <li>
          <strong>Cancellation.</strong> Either party may cancel in writing. The deposit is non-refundable once work
          has begun; completed deliverables are released to the Client on payment for work performed to date.
        </li>
        <li>
          <strong>Ownership.</strong> On full payment the Client owns the brand assets, website, content, accounts,
          phone number, and all leads. Crucible retains the right to use anonymized work in its own marketing and
          case studies.
        </li>
        <li>
          <strong>Goal, not guarantee.</strong> Crucible builds the systems; lead volume depends on market
          conditions, the Client&apos;s consistency with the social content, and follow-up speed, and is not
          guaranteed.
        </li>
      </ul>
    </>
  )
}

/** growth_partner: "10%" / "7.5%" */
function formatPct(n: number | null): string {
  if (n == null) return ''
  return `${Number.isInteger(n) ? n : n.toFixed(1).replace(/\.0$/, '')}%`
}

function GrowthPartnerBody({ agreement }: { agreement: PublicAgreement }) {
  const co = agreement.company_name
  const retainer = formatFee(agreement.monthly_fee)
  const upfront = formatFee(agreement.setup_fee ?? 0)
  const pct = formatPct(agreement.revenue_share_pct)
  const chosen = agreement.status === 'signed' ? agreement.pricing_option : null

  return (
    <>
      <Section n={1} title="The Engagement" />
      <p className="agr-p">
        Crucible acts as <span className="tk">{co}</span>&apos;s growth partner: it builds and manages the
        company&apos;s website, Google search presence, Google Ads, CRM, email marketing, and marketing campaigns,
        and structures the company&apos;s offers, so that more of the right customers find the Client, call, and
        buy.
      </p>

      <Section n={2} title="What Crucible Delivers" />
      <div className="flex flex-col gap-3">
        <DeliverableCard title="Website">
          <li>Develop, launch, and manage the company website, including service and service-area pages</li>
          <li>Ongoing updates, new pages, and conversion improvements (calls, forms, quote requests)</li>
        </DeliverableCard>
        <DeliverableCard title="Google Search Ranking">
          <li>Optimize and manage the Google Business Profile to rank in the map pack across the service area</li>
          <li>Build citations and review momentum that support local ranking</li>
        </DeliverableCard>
        <DeliverableCard title="SEO / AEO">
          <li>On-page and technical SEO, schema markup, and content built around what customers search for</li>
          <li>
            Answer Engine Optimization (AEO): structure content so AI answer tools such as Google AI Overviews and
            ChatGPT cite the Client
          </li>
        </DeliverableCard>
        <DeliverableCard title="Google Ads">
          <li>Build and manage Google Ads campaigns: keywords, ad copy, landing page routing, and budgets</li>
          <li>Conversion tracking on calls and forms, with ongoing optimization toward booked jobs</li>
        </DeliverableCard>
        <DeliverableCard title="CRM Build-Out">
          <li>Build the CRM: pipelines, lead capture from every channel, and call and form tracking</li>
          <li>Automations for speed-to-lead, estimate follow-up, and inspection and renewal reminders</li>
        </DeliverableCard>
        <DeliverableCard title="Email Marketing">
          <li>Build email campaigns: past-customer reactivation, nurture for open estimates, and seasonal sends</li>
        </DeliverableCard>
        <DeliverableCard title="Marketing Campaigns">
          <li>Develop and manage the Client&apos;s general marketing campaigns, promotions, and outreach</li>
        </DeliverableCard>
        <DeliverableCard title="Offer Structuring">
          <li>Structure the company&apos;s offers: service packages, pricing tiers, and recurring service agreements</li>
        </DeliverableCard>
        <DeliverableCard title="Reporting">
          <li>A monthly summary of leads, opportunities, and booked revenue from the systems above</li>
        </DeliverableCard>
      </div>

      <div className="print-break" />

      <Section n={3} title="What the Client Provides" />
      <ul className="agr-list">
        <li>
          <strong>Access.</strong> Admin access to the website and hosting, the domain, Google Business Profile,
          Google Ads, Google Search Console and Analytics, the email sending account, and the CRM.
        </li>
        <li>
          <strong>Ad budget and tools.</strong> All advertising spend is billed directly by Google and is separate
          from Crucible&apos;s fee. The Client pays third-party subscriptions (CRM, email platform, hosting) directly.
        </li>
        <li>
          <strong>Point of contact.</strong> One person to approve pages, copy, offers, and campaigns within two
          business days of each request.
        </li>
        <li>
          <strong>Sales follow-up.</strong> Timely follow-up on every lead, with each lead&apos;s status and the
          amount sold kept current in the CRM.
        </li>
      </ul>

      <Section n={4} title="Investment: Choose One Option" />
      <p className="agr-p">
        The Client chooses one of the two options below when signing. Both options cover every service in Section
        2. <strong>Advertising spend is separate under either option</strong> and paid by the Client.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <PricingOptionCard
          label="Option A"
          name="Monthly Retainer"
          price={retainer}
          unit="Per month"
          chosen={chosen === 'retainer'}
          dimmed={chosen === 'revenue_share'}
        >
          <li>Billed monthly in advance.</li>
          <li>
            <strong>Month to month.</strong> Either party may cancel at any time with 30 days written notice by email.
          </li>
        </PricingOptionCard>
        <PricingOptionCard
          label="Option B"
          name="Revenue Share"
          price={`${upfront} + ${pct}`}
          unit="Upfront, then share of attributed revenue"
          chosen={chosen === 'revenue_share'}
          dimmed={chosen === 'retainer'}
        >
          <li>
            <strong>{upfront} due at signing</strong>, non-refundable once work begins. No monthly retainer.
          </li>
          <li>
            Then <strong>{pct} of Attributed Revenue</strong> (defined below), paid monthly.
          </li>
          <li>
            <strong>Six-month close-out.</strong> Either party may cancel with written notice by email. Crucible stops
            work on the notice date, and the Agreement closes <strong>6 months after the notice date</strong>; during
            those 6 months the revenue share continues on revenue from leads and opportunities Crucible generated
            before the notice date.
          </li>
        </PricingOptionCard>
      </div>

      <ul className="agr-list">
        <li>
          <strong>Attributed Revenue (Option B).</strong> Revenue the Client collects from any customer whose first
          contact came through a lead or opportunity Crucible generated: the website, Google Business Profile,
          Google Ads, email campaigns, or other campaigns Crucible runs, as recorded in the CRM. Customers already in
          the Client&apos;s records before the Effective Date are excluded.
        </li>
        <li>
          <strong>Statements and payment (Option B).</strong> By the 5th of each month Crucible sends a statement of
          the prior month&apos;s Attributed Revenue from the CRM. The Client pays within 10 days and gives Crucible
          read access to the CRM and invoicing needed to verify it.
        </li>
        <li>
          <strong>Missed payment.</strong> Crucible pauses work until payment is received. Client has 15 days to
          process payment.
        </li>
        <li>
          <strong>Changing options.</strong> The chosen option stays in place unless both parties agree in writing
          to switch.
        </li>
        <li>
          <strong>Ownership.</strong> Client owns the website, its content, the domain, ad accounts, the CRM and its
          data, and all leads. Crucible retains the right to use anonymized work in its own marketing and case studies.
        </li>
        <li>
          <strong>Goal, not guarantee.</strong> Crucible builds and runs the systems toward more leads and booked
          jobs. Results depend on market conditions, ad budget, and the Client&apos;s sales follow-up, and are not
          guaranteed.
        </li>
      </ul>
    </>
  )
}

/** Spanish translation of GrowthPartnerBody. Keep the two in sync when either changes. */
function GrowthPartnerBodyEs({ agreement }: { agreement: PublicAgreement }) {
  const co = agreement.company_name
  const retainer = formatFee(agreement.monthly_fee)
  const upfront = formatFee(agreement.setup_fee ?? 0)
  const pct = formatPct(agreement.revenue_share_pct)
  const chosen = agreement.status === 'signed' ? agreement.pricing_option : null

  return (
    <>
      <Section n={1} title="Descripción del Servicio" />
      <p className="agr-p">
        Crucible actúa como socio de crecimiento de <span className="tk">{co}</span>: crea y administra el sitio
        web de la empresa, su presencia en las búsquedas de Google, Google Ads, el CRM, el email marketing y las
        campañas de marketing, y estructura las ofertas de la empresa, para que más clientes adecuados encuentren
        al Cliente, lo llamen y le compren.
      </p>

      <Section n={2} title="Lo que Crucible Entrega" />
      <div className="flex flex-col gap-3">
        <DeliverableCard title="Sitio Web">
          <li>Desarrollar, lanzar y administrar el sitio web de la empresa, incluyendo páginas de servicios y de áreas de servicio</li>
          <li>Actualizaciones continuas, páginas nuevas y mejoras de conversión (llamadas, formularios y solicitudes de cotización)</li>
        </DeliverableCard>
        <DeliverableCard title="Posicionamiento en Google">
          <li>
            Optimizar y administrar el Perfil de Empresa en Google para aparecer en los resultados del mapa en toda
            el área de servicio
          </li>
          <li>Crear menciones del negocio en directorios en línea y aumentar las reseñas para apoyar el posicionamiento local</li>
        </DeliverableCard>
        <DeliverableCard title="SEO / AEO">
          <li>SEO técnico y en la página, datos estructurados (schema) y contenido basado en lo que buscan los clientes</li>
          <li>
            Optimización para Motores de Respuesta (AEO): estructurar el contenido para que las herramientas de
            respuesta con inteligencia artificial, como Google AI Overviews y ChatGPT, recomienden al Cliente
          </li>
        </DeliverableCard>
        <DeliverableCard title="Google Ads">
          <li>Crear y administrar campañas de Google Ads: palabras clave, textos de anuncios, páginas de destino y presupuestos</li>
          <li>Medición de conversiones en llamadas y formularios, con optimización continua para conseguir trabajos agendados</li>
        </DeliverableCard>
        <DeliverableCard title="Implementación del CRM">
          <li>Configurar el CRM: etapas de venta, captura de prospectos de todos los canales y seguimiento de llamadas y formularios</li>
          <li>
            Automatizaciones para responder rápido a nuevos prospectos, dar seguimiento a cotizaciones y enviar
            recordatorios de inspecciones y renovaciones
          </li>
        </DeliverableCard>
        <DeliverableCard title="Email Marketing">
          <li>Crear campañas de email: reactivación de clientes anteriores, seguimiento de cotizaciones abiertas y envíos de temporada</li>
        </DeliverableCard>
        <DeliverableCard title="Campañas de Marketing">
          <li>Desarrollar y administrar las campañas generales de marketing, promociones y prospección del Cliente</li>
        </DeliverableCard>
        <DeliverableCard title="Estructura de Ofertas">
          <li>Estructurar las ofertas de la empresa: paquetes de servicios, niveles de precios y contratos de servicio recurrente</li>
        </DeliverableCard>
        <DeliverableCard title="Reportes">
          <li>Un resumen mensual de los prospectos, las oportunidades y los ingresos por trabajos cerrados que generan estos sistemas</li>
        </DeliverableCard>
      </div>

      <div className="print-break" />

      <Section n={3} title="Lo que Proporciona el Cliente" />
      <ul className="agr-list">
        <li>
          <strong>Accesos.</strong> Acceso de administrador al sitio web y su hosting, el dominio, el Perfil de
          Empresa en Google, Google Ads, Google Search Console y Google Analytics, la cuenta de envío de email y el
          CRM.
        </li>
        <li>
          <strong>Presupuesto de publicidad y herramientas.</strong> Google factura todo el gasto en publicidad
          directamente al Cliente, y ese gasto es aparte de los honorarios de Crucible. El Cliente paga directamente
          las suscripciones de terceros (CRM, plataforma de email y hosting).
        </li>
        <li>
          <strong>Persona de contacto.</strong> Una persona que apruebe páginas, textos, ofertas y campañas dentro
          de los dos días hábiles siguientes a cada solicitud.
        </li>
        <li>
          <strong>Seguimiento de ventas.</strong> Dar seguimiento oportuno a cada prospecto y mantener actualizado
          en el CRM el estado de cada prospecto y el monto vendido.
        </li>
      </ul>

      <Section n={4} title="Inversión: Elija una Opción" />
      <p className="agr-p">
        El Cliente elige una de las dos opciones siguientes al firmar. Ambas opciones incluyen todos los servicios
        de la Sección 2. <strong>El gasto en publicidad es aparte en cualquiera de las dos opciones</strong> y lo
        paga el Cliente.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <PricingOptionCard
          label="Opción A"
          name="Pago Mensual Fijo"
          price={retainer}
          unit="Por mes"
          chosen={chosen === 'retainer'}
          dimmed={chosen === 'revenue_share'}
          selectedLabel="Elegida"
        >
          <li>Se factura cada mes por adelantado.</li>
          <li>
            <strong>Mes a mes.</strong> Cualquiera de las partes puede cancelar en cualquier momento con 30 días de
            aviso por escrito por correo electrónico.
          </li>
        </PricingOptionCard>
        <PricingOptionCard
          label="Opción B"
          name="Participación en Ingresos"
          price={`${upfront} + ${pct}`}
          unit="Pago inicial, luego un porcentaje de los ingresos atribuidos"
          chosen={chosen === 'revenue_share'}
          dimmed={chosen === 'retainer'}
          selectedLabel="Elegida"
        >
          <li>
            <strong>{upfront} al firmar</strong>, no reembolsable una vez que comience el trabajo. Sin pago mensual
            fijo.
          </li>
          <li>
            Después, el <strong>{pct} de los Ingresos Atribuidos</strong> (definidos abajo), pagado cada mes.
          </li>
          <li>
            <strong>Cierre de seis meses.</strong> Cualquiera de las partes puede cancelar con aviso por escrito por
            correo electrónico. Crucible deja de trabajar en la fecha del aviso, y el Acuerdo termina{' '}
            <strong>6 meses después de la fecha del aviso</strong>; durante esos 6 meses, la participación en
            ingresos continúa sobre los ingresos de los prospectos y oportunidades que Crucible generó antes de la
            fecha del aviso.
          </li>
        </PricingOptionCard>
      </div>

      <ul className="agr-list">
        <li>
          <strong>Ingresos Atribuidos (Opción B).</strong> Los ingresos que el Cliente cobra a cualquier cliente cuyo
          primer contacto llegó por medio de un prospecto u oportunidad que generó Crucible: el sitio web, el Perfil
          de Empresa en Google, Google Ads, las campañas de email u otras campañas que Crucible administre, según lo
          registrado en el CRM. Se excluyen los clientes que ya estaban en los registros del Cliente antes de la
          Fecha de Entrada en Vigor.
        </li>
        <li>
          <strong>Estados de cuenta y pagos (Opción B).</strong> A más tardar el día 5 de cada mes, Crucible envía un
          estado de cuenta de los Ingresos Atribuidos del mes anterior, tomado del CRM. El Cliente paga dentro de los
          10 días siguientes y le da a Crucible acceso de solo lectura al CRM y a la facturación para poder
          verificarlo.
        </li>
        <li>
          <strong>Pago atrasado.</strong> Crucible pausa el trabajo hasta recibir el pago. El Cliente tiene 15 días
          para realizar el pago.
        </li>
        <li>
          <strong>Cambio de opción.</strong> La opción elegida se mantiene, a menos que ambas partes acuerden por
          escrito cambiarla.
        </li>
        <li>
          <strong>Propiedad.</strong> El Cliente es dueño del sitio web, su contenido, el dominio, las cuentas de
          publicidad, el CRM y sus datos, y todos los prospectos. Crucible se reserva el derecho de usar el trabajo,
          sin datos que identifiquen al Cliente, en su propio marketing y casos de éxito.
        </li>
        <li>
          <strong>Meta, no garantía.</strong> Crucible crea y opera los sistemas con el objetivo de generar más
          prospectos y trabajos cerrados. Los resultados dependen de las condiciones del mercado, el presupuesto de
          publicidad y el seguimiento de ventas del Cliente, y no están garantizados.
        </li>
      </ul>
    </>
  )
}

function PricingOptionCard({
  label,
  name,
  price,
  unit,
  chosen,
  dimmed,
  selectedLabel = 'Selected',
  children,
}: {
  label: string
  name: string
  price: string
  unit: string
  chosen: boolean
  dimmed: boolean
  selectedLabel?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`relative bg-brand-cream border rounded-2xl px-5 py-4 flex flex-col ${
        chosen ? 'border-brand-orange border-2' : 'border-[#EADFD1]'
      } ${dimmed ? 'opacity-50' : ''}`}
    >
      {chosen && (
        <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 bg-brand-orange text-white text-[10px] font-bold uppercase tracking-[0.06em] rounded-full px-2.5 py-0.5">
          <CheckCircle2 className="w-3 h-3" /> {selectedLabel}
        </span>
      )}
      <div className="text-brand-orange-dark font-semibold text-[11px] uppercase tracking-[0.06em]">{label}</div>
      <div className="text-brand-dark font-extrabold text-[17px] leading-tight mb-2">{name}</div>
      <div className="text-brand-dark font-black text-[24px] leading-none tracking-tight">
        <span className="tk text-[20px]">{price}</span>
      </div>
      <div className="text-brand-orange-dark font-semibold text-[11px] uppercase tracking-[0.06em] mt-1.5 mb-3">
        {unit}
      </div>
      <ul className="agr-list !gap-1.5 !mb-0">{children}</ul>
    </div>
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
  restoration_growth: {
    footer: 'Restoration Growth Engine Agreement',
    title: 'Restoration Growth Engine',
    subtitle: 'POV Content, Paid Search & Social, Landing Pages, Reputation',
  },
  launch_package: {
    footer: 'Business Launch Package Agreement',
    title: 'Business Launch Package',
    subtitle: 'Online Presence, CRM & Automations, Brand Kit, Content & Offers',
  },
  growth_partner: {
    footer: 'Growth Partner Agreement',
    title: 'Growth Partner',
    subtitle: 'Website, Search & AEO, Google Ads, CRM, Email, Campaigns & Offers',
  },
}

/** Spanish title/subtitle/footer for templates that have a translation. */
const TEMPLATE_COPY_ES: Partial<Record<AgreementTemplate, { footer: string; title: string; subtitle: string }>> = {
  growth_partner: {
    footer: 'Acuerdo de Socio de Crecimiento',
    title: 'Socio de Crecimiento',
    subtitle: 'Sitio web, búsqueda y AEO, Google Ads, CRM, email, campañas y ofertas',
  },
}

function templateCopy(template: AgreementTemplate, lang: AgreementLang) {
  return (lang === 'es' && TEMPLATE_COPY_ES[template]) || TEMPLATE_COPY[template]
}

/** Effective-date label: when the agreement takes effect on signature, say so until it is signed. */
function effectiveDateLabel(agreement: PublicAgreement, lang: AgreementLang = 'en'): string {
  if (agreement.effective_on_signing && agreement.status !== 'signed') return UI[lang].effectiveOnSignature
  return formatLongDate(agreement.effective_date, DATE_LOCALE[lang])
}

/** English / Español switch in the top bar. */
function LanguageSwitch({ lang, onChange }: { lang: AgreementLang; onChange: (l: AgreementLang) => void }) {
  return (
    <div
      role="group"
      aria-label="Language / Idioma"
      className="inline-flex items-center rounded-full bg-white/10 border border-white/15 p-0.5 text-[11px] font-bold"
    >
      <Globe className="w-3.5 h-3.5 mx-1.5 text-white/60" aria-hidden />
      {(
        [
          ['en', 'English', 'EN'],
          ['es', 'Español', 'ES'],
        ] as const
      ).map(([value, full, short]) => (
        <button
          key={value}
          type="button"
          lang={value}
          aria-pressed={lang === value}
          onClick={() => onChange(value)}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            lang === value ? 'bg-white text-brand-dark' : 'text-white/75 hover:text-white'
          }`}
        >
          <span className="hidden sm:inline">{full}</span>
          <span className="sm:hidden">{short}</span>
        </button>
      ))}
    </div>
  )
}

/** Shown at the top of the Spanish version. */
function TranslationNotice() {
  return (
    <div className="mb-6 rounded-2xl border border-[#EADFD1] bg-white px-5 py-3.5 text-[12.5px] leading-relaxed text-brand-dark">
      <strong>Versión en español.</strong> Esta es una traducción del acuerdo original en inglés, ofrecida para su
      comodidad. Puede leer y firmar el acuerdo en esta versión. Si hubiera alguna diferencia entre las dos
      versiones, prevalecerá la versión en inglés.
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/* Document chrome                                                          */
/* ------------------------------------------------------------------------ */

function DocHeader({ lang }: { lang: AgreementLang }) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-[#EADFD1]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-dark.png" alt="Crucible" className="h-[52px] sm:h-[66px] w-auto" />
      <div className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-page-muted">
        <span className="hidden sm:inline">Crucible Consulting, LLC</span>
        <span className="hidden sm:inline w-1 h-1 rounded-full bg-brand-orange" />
        <span className="text-brand-orange-dark">{UI[lang].confidential}</span>
      </div>
    </div>
  )
}

function DocFooter({ template, lang }: { template: AgreementTemplate; lang: AgreementLang }) {
  return (
    <div className="mt-8 pt-3 border-t border-[#EADFD1] flex items-center justify-between text-[10px] font-medium text-gray-400">
      <span>cruciblecoaching.org</span>
      <span>{templateCopy(template, lang).footer}</span>
    </div>
  )
}

function TitleBlock({ agreement, lang }: { agreement: PublicAgreement; lang: AgreementLang }) {
  const copy = templateCopy(agreement.template, lang)
  const subtitle =
    agreement.template === 'restoration_growth' ? restorationSubtitle(agreement) : copy.subtitle
  return (
    <div className="mt-4 mb-6">
      <h1 className="text-brand-dark font-black text-[30px] sm:text-[34px] leading-[1.08] tracking-[-0.03em] mb-1.5">
        {copy.title}
      </h1>
      <p className="text-brand-orange-dark font-semibold text-[15px]">{subtitle}</p>
    </div>
  )
}

function PartiesCard({ agreement, lang }: { agreement: PublicAgreement; lang: AgreementLang }) {
  const t = UI[lang]
  return (
    <div className="bg-brand-cream border border-[#EADFD1] rounded-[20px] px-5 sm:px-6 py-5 mb-6">
      <p className="agr-p mb-4">
        {t.madeAsOf} <span className="tk">{effectiveDateLabel(agreement, lang)}</span> (
        {lang === 'en' ? 'the ' : 'la '}
        <strong>&ldquo;{t.effectiveDate}&rdquo;</strong>) {t.between} <strong>Crucible Consulting, LLC</strong>{' '}
        (&ldquo;Crucible&rdquo;), {t.operatedBy}, 1461 W Ridge Road, Apache Junction, AZ 85203,
        Chandler@cruciblecoaching.org, {t.and} <span className="tk">{agreement.company_name}</span>{' '}
        (&ldquo;{t.client}&rdquo;).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-7 gap-y-3.5">
        <Field label={t.clientName} value={agreement.client_name} />
        <Field label={t.company} value={agreement.company_name} />
        <Field label={t.email} value={agreement.client_email} />
        <Field label={t.phone} value={agreement.client_phone} />
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
  lang,
}: {
  agreement: PublicAgreement
  scriptFont: string
  scriptClassName: string
  onSigned: (a: PublicAgreement) => void
  lang: AgreementLang
}) {
  const signed = agreement.status === 'signed'
  const t = UI[lang]

  return (
    <div
      id="sign"
      className="bg-brand-cream border border-[#EADFD1] rounded-[20px] px-5 sm:px-7 pt-5 pb-6 mt-6 text-brand-dark scroll-mt-20"
    >
      <p className="text-brand-dark font-semibold text-[12.5px] leading-relaxed mb-5">
        {t.bySigning}
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
          <div className="sig-lbl">{t.signature}</div>
          <div className="sig-line flex items-end">
            <span className="font-semibold text-[15px] leading-none pb-1">
              {agreement.crucible_signer}, {t.founder}
            </span>
          </div>
          <div className="sig-lbl">{t.nameTitle}</div>
          <div className="sig-line flex items-end">
            <span className="font-semibold text-[15px] leading-none pb-1">
              {agreement.effective_on_signing && agreement.status !== 'signed'
                ? t.uponSignature
                : formatLongDate(agreement.effective_date, DATE_LOCALE[lang])}
            </span>
          </div>
          <div className="sig-lbl !mb-0">{t.date}</div>
        </div>

        {/* Client side */}
        <div>
          <div className="party-label">{agreement.company_name}</div>
          {signed ? (
            <ClientSigned agreement={agreement} lang={lang} />
          ) : (
            <ClientSignForm
              agreement={agreement}
              scriptFont={scriptFont}
              onSigned={onSigned}
              lang={lang}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/** "Option A: $1,000 per month" / "Opción B: $1,000 de pago inicial + 2% de participación en ingresos" */
function pricingOptionLabel(agreement: PublicAgreement, option: AgreementPricingOption, lang: AgreementLang): string {
  const monthly = formatFee(agreement.monthly_fee)
  const upfront = formatFee(agreement.setup_fee ?? 0)
  const pct = formatPct(agreement.revenue_share_pct)
  if (lang === 'es') {
    return option === 'retainer'
      ? `Opción A: ${monthly} por mes`
      : `Opción B: ${upfront} de pago inicial + ${pct} de participación en ingresos`
  }
  return option === 'retainer' ? `Option A: ${monthly} per month` : `Option B: ${upfront} upfront + ${pct} revenue share`
}

function ClientSigned({ agreement, lang }: { agreement: PublicAgreement; lang: AgreementLang }) {
  const t = UI[lang]
  return (
    <>
      <div className="sig-line flex items-end">
        {agreement.signature_data ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={agreement.signature_data} alt="Client signature" className="h-[44px] w-auto max-w-full -mb-0.5" />
        ) : null}
      </div>
      <div className="sig-lbl">{t.signature}</div>
      <div className="sig-line flex items-end">
        <span className="font-semibold text-[15px] leading-none pb-1">
          {[agreement.signer_name, agreement.signer_title].filter(Boolean).join(', ')}
        </span>
      </div>
      <div className="sig-lbl">{t.nameTitle}</div>
      <div className="sig-line flex items-end">
        <span className="font-semibold text-[15px] leading-none pb-1">
          {formatLongDate(agreement.signed_date, DATE_LOCALE[lang])}
        </span>
      </div>
      <div className="sig-lbl !mb-0">{t.date}</div>
      {agreement.template === 'growth_partner' && agreement.pricing_option && (
        <p className="text-[12.5px] font-semibold mt-3">
          {t.selected}: {pricingOptionLabel(agreement, agreement.pricing_option, lang)}
        </p>
      )}
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
  lang,
}: {
  agreement: PublicAgreement
  scriptFont: string
  onSigned: (a: PublicAgreement) => void
  lang: AgreementLang
}) {
  const t = UI[lang]
  const defaults = useMemo(() => splitName(agreement.client_name), [agreement.client_name])
  const [name, setName] = useState(defaults.name)
  const [title, setTitle] = useState(defaults.title)
  const [date, setDate] = useState(todayISO)
  const [agree, setAgree] = useState(false)
  const needsOption = agreement.template === 'growth_partner'
  const [pricingOption, setPricingOption] = useState<AgreementPricingOption | null>(null)
  const [hasSig, setHasSig] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const padRef = useRef<SignaturePadHandle>(null)

  const canSubmit =
    name.trim().length > 1 && date && agree && hasSig && (!needsOption || pricingOption) && !submitting

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const sig = padRef.current?.getSignature()
    if (!sig) {
      setError(t.addSignature)
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
          pricing_option: needsOption ? pricingOption : undefined,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error ? translateServerError(json.error, lang) : t.genericError)
      onSigned(json.agreement as PublicAgreement)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 print:hidden">
      {needsOption && (
        <fieldset>
          <legend className="sig-lbl !mb-1.5">
            {t.pricingOption} <span className="text-brand-orange">*</span>
          </legend>
          <div className="grid grid-cols-1 gap-2">
            {(['retainer', 'revenue_share'] as const).map((value) => (
              <label
                key={value}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-[13px] font-semibold cursor-pointer bg-white ${
                  pricingOption === value ? 'border-brand-orange ring-2 ring-brand-orange/20' : 'border-[#C9B8A6]'
                }`}
              >
                <input
                  type="radio"
                  name="pricing_option"
                  value={value}
                  checked={pricingOption === value}
                  onChange={() => setPricingOption(value)}
                  className="h-4 w-4 accent-[#E86530]"
                />
                {pricingOptionLabel(agreement, value, lang)}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div>
        <div className="sig-lbl !mb-1.5 flex items-center gap-1">
          {t.signature} <span className="text-brand-orange">*</span>
        </div>
        <SignaturePad
          ref={padRef}
          defaultTypedName={name}
          scriptFont={scriptFont}
          onChange={setHasSig}
          labels={t.pad}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
        <label className="block">
          <div className="sig-lbl !mb-1.5">
            {t.fullName} <span className="text-brand-orange">*</span>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            placeholder={t.fullNamePlaceholder}
            className="w-full text-sm px-3 py-2 rounded-lg border border-[#C9B8A6] bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
          />
        </label>
        <label className="block">
          <div className="sig-lbl !mb-1.5">{t.title}</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.titlePlaceholder}
            className="w-full text-sm px-3 py-2 rounded-lg border border-[#C9B8A6] bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
          />
        </label>
      </div>

      <label className="block">
        <div className="sig-lbl !mb-1.5">
          {t.date} <span className="text-brand-orange">*</span>
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
          {t.authorizedPre} <strong>{agreement.company_name}</strong>
          {t.authorizedPost}
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
        {submitting ? t.signing : t.signButton}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-[10.5px] text-gray-500">
        <ShieldCheck className="w-3.5 h-3.5" /> {t.recorded}
      </p>
    </form>
  )
}

function SignedBanner({ agreement, lang }: { agreement: PublicAgreement; lang: AgreementLang }) {
  const t = UI[lang]
  const when = formatLongDate(agreement.signed_date ?? agreement.signed_at, DATE_LOCALE[lang])
  return (
    <div className="print:hidden mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white border border-green-200 px-5 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex-none w-9 h-9 rounded-full bg-green-100 text-green-700 inline-flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5" />
        </span>
        <div>
          <div className="font-bold text-gray-900 text-sm">{t.agreementSigned}</div>
          <div className="text-xs text-gray-500">
            {t.signedBy} {agreement.signer_name}
            {agreement.signer_title ? `, ${agreement.signer_title}` : ''} {t.on} {when}. {t.copySaved}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gray-900 text-white text-xs font-bold px-4 py-2"
      >
        <Download className="w-3.5 h-3.5" /> {t.downloadPdf}
      </button>
    </div>
  )
}
