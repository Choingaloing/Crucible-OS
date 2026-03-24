import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Search,
  Layers,
  TrendingUp,
  Star,
  CheckCircle2,
  TrendingDown,
  Clock,
  Shield,
} from 'lucide-react'

const features = [
  {
    icon: TrendingDown,
    title: 'Lower Your Cost to Acquire Customers',
    description:
      'A complete offer stack with strong lead magnets drives organic acquisition — systematically reducing what you pay for every new customer.',
  },
  {
    icon: Clock,
    title: 'Shrink Your CAC Payback Period',
    description:
      'Missing entry offers and upsells means you wait months to recoup acquisition costs. We map the offers that get you paid back fast.',
  },
  {
    icon: BarChart3,
    title: 'Maximize Customer Lifetime Value',
    description:
      'A well-structured value ladder keeps customers ascending through your offers — dramatically increasing total revenue per relationship.',
  },
  {
    icon: Shield,
    title: 'Stabilize Your Business',
    description:
      'Continuity offers — memberships, retainers, subscriptions — create predictable monthly income you can plan, hire, and invest from.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Map Your Current Offers',
    description:
      'We catalog every offer your business currently has. Lead magnets, core offers, upsells, continuity programs — everything gets put on the board.',
  },
  {
    number: '02',
    title: 'Identify the Gaps',
    description:
      'Our framework highlights the missing revenue layers. Most businesses are missing 3–5 critical offer types that prevent sustainable, predictable scale.',
  },
  {
    number: '03',
    title: 'Build Your Scale Plan',
    description:
      'You leave with a prioritized roadmap for building the offers your business needs to create compounding, predictable monthly revenue.',
  },
]

const testimonials = [
  {
    quote:
      'Before Crucible, I had no idea how many revenue gaps existed in my business. We identified over $40K/month in missing offers in one session.',
    name: 'Sarah M.',
    title: 'E-commerce Brand Owner',
  },
  {
    quote:
      "This is the most clarity I've had on my business model in 6 years. I wish I had done this on day one.",
    name: 'James T.',
    title: 'Agency Founder',
  },
  {
    quote:
      'Our revenue went from $30K to $85K monthly within 4 months of implementing the offer map recommendations.',
    name: 'Priya K.',
    title: 'Course Creator',
  },
]

const offerTiers = ['Lead Magnet', 'Entry Offer', 'Core Offer', 'Upsell', 'Continuity', 'High-Ticket']

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-brand-cream pt-20 pb-28 px-4">
        <div className="relative max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-dark text-brand-gold text-xs font-black uppercase tracking-widest px-5 py-2 rounded-full mb-8">
            <Star size={11} className="fill-brand-gold" />
            Business Offer Strategy &amp; Mapping
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-brand-dark leading-[1.02] tracking-tight mb-6">
            Fix Your Money Model<br />
            <span className="text-brand-orange">in 10 Minutes</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            A broken money model means high customer acquisition costs, slow payback periods, low lifetime value, and an unstable business. Crucible maps exactly what&apos;s missing — and shows you what to build next.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tool"
              className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-light text-brand-dark font-black uppercase tracking-wider px-10 py-4 rounded-full text-base transition-all hover:shadow-xl hover:shadow-brand-gold/30 hover:-translate-y-0.5"
            >
              Fix My Money Model
              <ArrowRight size={18} />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-brand-dark hover:text-brand-orange font-bold px-6 py-4 rounded-full border-2 border-brand-dark hover:border-brand-orange transition-all"
            >
              See How It Works
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-500 font-medium">
            Used by consultants and business owners across 12+ industries
          </p>
        </div>

        {/* App preview mockup */}
        <div className="relative max-w-5xl mx-auto mt-16">
          <div className="bg-brand-dark border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-brand-dark/40">
            {/* Browser chrome */}
            <div className="bg-brand-charcoal border-b border-white/10 px-4 py-3 flex items-center gap-2">
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
      <section className="bg-brand-dark py-14">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '3.2x', label: 'Average Revenue Increase' },
              { value: '87%', label: 'Identify 5+ Revenue Gaps' },
              { value: '12+', label: 'Industries Served' },
              { value: '< 60 min', label: 'First Session Clarity' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-brand-gold mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 px-4 bg-brand-cream">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-brand-dark mb-4 leading-tight">
              One money model. Four problems solved.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
              Most business problems trace back to a broken offer stack. Fix the model, fix the business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="flex gap-5 p-7 rounded-2xl bg-white border border-gray-200 hover:border-brand-gold hover:shadow-lg hover:shadow-brand-gold/10 transition-all group"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-dark rounded-xl flex items-center justify-center group-hover:bg-brand-charcoal transition-colors">
                    <Icon size={22} className="text-brand-gold" />
                  </div>
                  <div>
                    <h3 className="font-black text-brand-dark mb-2 leading-snug">{feature.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                  </div>
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
            <h2 className="text-4xl font-black text-white mb-4 leading-tight">
              From confusion to clarity in three steps
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
              A structured process that gives you actionable insight — not just theory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                <div className="text-7xl font-black text-brand-gold/20 mb-3 leading-none select-none">
                  {step.number}
                </div>
                <h3 className="text-xl font-black text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-5 text-brand-gold/40 text-2xl font-bold">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 px-4 bg-brand-cream">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-brand-dark mb-4 leading-tight">
              Real results from real businesses
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-7 border border-gray-200 flex flex-col shadow-sm">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-brand-gold fill-brand-gold" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed flex-1 mb-6 font-medium">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <div className="font-black text-brand-dark text-sm">{t.name}</div>
                  <div className="text-gray-400 text-xs mt-0.5 font-medium">{t.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-24 px-4 bg-brand-dark">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            Your money model is fixable.
          </h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed font-medium">
            In 10 minutes, you&apos;ll see exactly what&apos;s missing — and what to build to lower your CAC, speed up payback, maximize LTV, and stabilize your revenue.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tool"
              className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-light text-brand-dark font-black uppercase tracking-wider px-10 py-4 rounded-full transition-all hover:shadow-xl hover:shadow-brand-gold/30 hover:-translate-y-0.5"
            >
              Fix My Money Model
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/pricing"
              className="text-gray-400 hover:text-brand-gold font-bold underline underline-offset-4 transition-colors"
            >
              View pricing plans
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
