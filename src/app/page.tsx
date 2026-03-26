import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  TrendingUp,
  Star,
  CheckCircle2,
  TrendingDown,
  Clock,
  Shield,
} from 'lucide-react'

const levers = [
  {
    icon: TrendingDown,
    title: 'Reduce CAC Payback Period',
    description:
      'Most businesses bleed cash waiting months to recoup acquisition costs. We engineer your offer stack so you recover that spend within 30 days — often faster.',
  },
  {
    icon: BarChart3,
    title: 'Improve Offer Structure',
    description:
      'Your offers determine your economics. We restructure how value is packaged and priced so every new customer interaction maximizes gross profit from day one.',
  },
  {
    icon: TrendingUp,
    title: 'Increase Lifetime Value',
    description:
      'A well-structured value ladder keeps customers ascending through your offers — dramatically increasing total revenue per relationship.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Analyze Your Offer Economics',
    description:
      'We break down your current offers, pricing, and acquisition costs. Every dollar in, every dollar out. No guessing — just the math.',
  },
  {
    number: '02',
    title: 'Build Your Money Model',
    description:
      'We engineer a custom money model that shows exactly what needs to change in your first 30 days of customer conversion to maximize gross profit.',
  },
  {
    number: '03',
    title: 'Implement & Scale',
    description:
      'With the math fixed, you have permission to scale. We support implementation so your fulfillment stays strong as volume increases.',
  },
]

const testimonials = [
  {
    quote:
      'Before Crucible, I had no idea how broken my offer economics were. We restructured our first 30 days and cut CAC payback from 4 months to 11 days.',
    name: 'Sarah M.',
    title: 'E-commerce Brand Owner',
  },
  {
    quote:
      "This is the most clarity I've had on my business model in 6 years. Crucible didn't just identify the problems — they gave me the exact math to fix them.",
    name: 'James T.',
    title: 'Agency Founder',
  },
  {
    quote:
      'We went from being afraid to spend on ads to scaling aggressively because the numbers finally made sense. Revenue tripled in 4 months.',
    name: 'Priya K.',
    title: 'Course Creator',
  },
]

const offerTiers = ['Lead Magnet', 'Entry Offer', 'Core Offer', 'Upsell', 'Continuity', 'High-Ticket']

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-charcoal">
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-brand-charcoal pt-20 pb-28 px-4">
        <div className="relative max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-dark text-brand-gold text-xs font-black uppercase tracking-widest px-5 py-2 rounded-full mb-8 border border-brand-gold/20">
            <Star size={11} className="fill-brand-gold" />
            Client-Financed Acquisition
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-brand-off-white leading-[1.02] tracking-tight mb-6">
            Get Permission<br />
            <span className="text-brand-gold">to Scale.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Most businesses can&apos;t scale because their offer economics are broken — they spend to acquire, collect too little too soon, and can&apos;t survive the math of growth. Crucible fixes the math.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-light text-brand-charcoal font-black uppercase tracking-wider px-10 py-4 rounded-full text-base transition-all hover:shadow-xl hover:shadow-brand-gold/30 hover:-translate-y-0.5"
            >
              Apply Now
              <ArrowRight size={18} />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-brand-off-white hover:text-brand-gold font-bold px-6 py-4 rounded-full border-2 border-white/20 hover:border-brand-gold transition-all"
            >
              See How It Works
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-500 font-medium">
            For established business owners ready to restructure their offer economics
          </p>
        </div>

        {/* App preview mockup */}
        <div className="relative max-w-5xl mx-auto mt-16">
          <div className="bg-brand-dark border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
            {/* Browser chrome */}
            <div className="bg-brand-dark border-b border-white/10 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="ml-3 flex-1 bg-white/10 rounded-md h-6 flex items-center px-3 max-w-xs mx-auto">
                <span className="text-xs text-gray-400">app.crucible.co/tool</span>
              </div>
            </div>

            {/* Fake tool UI */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-white/10 rounded w-48" />
                <div className="flex gap-2">
                  <div className="h-7 w-20 bg-white/10 rounded-lg" />
                  <div className="h-7 w-16 bg-brand-gold rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-6 gap-3">
                {offerTiers.map((tier, i) => (
                  <div key={tier} className="space-y-2">
                    <div
                      className={`text-xs font-bold px-2 py-1 rounded text-center ${
                        i === 0
                          ? 'bg-blue-900/60 text-blue-300'
                          : i === 1
                          ? 'bg-violet-900/60 text-violet-300'
                          : i === 2
                          ? 'bg-amber-900/60 text-amber-300'
                          : i === 3
                          ? 'bg-orange-900/60 text-orange-300'
                          : i === 4
                          ? 'bg-green-900/60 text-green-300'
                          : 'bg-rose-900/60 text-rose-300'
                      }`}
                    >
                      {tier}
                    </div>
                    {i < 3 ? (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
                        <div className="h-2 bg-white/20 rounded w-3/4" />
                        <div className="h-2 bg-white/10 rounded w-1/2" />
                        <div className="h-5 bg-brand-gold/30 rounded-full" />
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-brand-gold/30 rounded-xl h-16 flex flex-col items-center justify-center gap-1">
                        <span className="text-brand-gold/60 text-lg font-light">+</span>
                        <span className="text-xs text-brand-gold/40">Gap</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats bar ─── */}
      <section className="bg-brand-dark py-14 border-y border-white/10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '30 days', label: 'The Gross Profit Frame' },
              { value: '3x', label: 'Average LTV Increase' },
              { value: '< 2 wks', label: 'Typical CAC Payback' },
              { value: '$3K/mo', label: 'Starting Engagement' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-display font-black text-brand-gold mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── The Three Levers ─── */}
      <section id="levers" className="py-24 px-4 bg-brand-charcoal">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-black text-brand-off-white mb-4 leading-tight">
              The three levers that let you scale.
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
              Every engagement focuses on these three outcomes. Fix these, and the business math works in your favor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {levers.map((lever) => {
              const Icon = lever.icon
              return (
                <div
                  key={lever.title}
                  className="p-7 rounded-2xl bg-brand-dark border border-white/10 hover:border-brand-gold/40 hover:shadow-lg hover:shadow-brand-gold/5 transition-all group"
                >
                  <div className="w-12 h-12 bg-brand-charcoal rounded-xl flex items-center justify-center mb-5 group-hover:bg-brand-gold/10 transition-colors">
                    <Icon size={22} className="text-brand-gold" />
                  </div>
                  <h3 className="font-display font-black text-brand-off-white mb-2 leading-snug">{lever.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{lever.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-24 px-4 bg-brand-dark">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-black text-brand-off-white mb-4 leading-tight">
              From broken economics to permission to scale.
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
              A structured process. No fluff. Just the math and the implementation plan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                <div className="text-7xl font-display font-black text-brand-gold/20 mb-3 leading-none select-none">
                  {step.number}
                </div>
                <h3 className="font-display text-xl font-black text-brand-off-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-5 text-brand-gold/40 text-2xl font-bold">&rarr;</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 px-4 bg-brand-charcoal">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-black text-brand-off-white mb-4 leading-tight">
              Real results from real businesses
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-brand-dark rounded-2xl p-7 border border-white/10 flex flex-col">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-brand-gold fill-brand-gold" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed flex-1 mb-6 font-medium">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <div className="font-black text-brand-off-white text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs mt-0.5 font-medium">{t.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-24 px-4 bg-brand-dark border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl font-black text-brand-off-white mb-4 leading-tight">
            Your offer economics are fixable.
          </h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed font-medium">
            Client-financed acquisition is the mechanism. The 30-day gross profit frame is the target. We give you the math, the model, and the implementation support to make scaling safe.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-light text-brand-charcoal font-black uppercase tracking-wider px-10 py-4 rounded-full transition-all hover:shadow-xl hover:shadow-brand-gold/30 hover:-translate-y-0.5"
            >
              Apply Now
              <ArrowRight size={18} />
            </Link>
            <a
              href="mailto:chandler@cruciblecoaching.org"
              className="text-gray-400 hover:text-brand-gold font-bold underline underline-offset-4 transition-colors"
            >
              chandler@cruciblecoaching.org
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
