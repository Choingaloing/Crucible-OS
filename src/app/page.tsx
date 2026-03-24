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
} from 'lucide-react'

const features = [
  {
    icon: Layers,
    title: 'Lower Your Cost to Acquire Customers',
    description:
      'A complete offer stack with strong lead magnets drives organic acquisition — systematically reducing what you pay for every new customer.',
  },
  {
    icon: Search,
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
    icon: TrendingUp,
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
      'We start by cataloging every offer your business currently has. Lead magnets, core offers, upsells, continuity programs — everything gets put on the board.',
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
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-white pt-20 pb-28 px-4">
        {/* Subtle background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-amber-50 opacity-70" />
          <div className="absolute bottom-0 -left-24 w-72 h-72 rounded-full bg-gray-50 opacity-80" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-dark text-brand-gold text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
            <Star size={12} className="fill-brand-gold" />
            Business Offer Strategy &amp; Mapping
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.05] tracking-tight mb-6">
            Fix Your Money Model<br />
            <span className="text-brand-gold">in 10 Minutes</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            A broken money model means high customer acquisition costs, slow payback periods, low lifetime value, and an unstable business. Crucible maps exactly what&apos;s missing — and shows you what to build next.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tool"
              className="inline-flex items-center gap-2 bg-brand-dark hover:bg-brand-charcoal text-white font-semibold px-8 py-4 rounded-xl text-base shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5"
            >
              Fix My Money Model Now
              <ArrowRight size={18} />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium px-6 py-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              See How It Works
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-400">
            Used by consultants and business owners across 12+ industries
          </p>
        </div>

        {/* App preview mockup */}
        <div className="relative max-w-5xl mx-auto mt-16">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-2xl shadow-gray-200">
            {/* Browser chrome */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="ml-3 flex-1 bg-gray-100 rounded-md h-6 flex items-center px-3 max-w-xs mx-auto">
                <span className="text-xs text-gray-400">app.crucible.co/tool</span>
              </div>
            </div>

            {/* Fake tool UI */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-48" />
                <div className="flex gap-2">
                  <div className="h-7 w-20 bg-gray-200 rounded-lg" />
                  <div className="h-7 w-16 bg-brand-dark rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-6 gap-3">
                {offerTiers.map((tier, i) => (
                  <div key={tier} className="space-y-2">
                    <div
                      className={`text-xs font-semibold px-2 py-1 rounded text-center ${
                        i === 0
                          ? 'bg-blue-100 text-blue-700'
                          : i === 1
                          ? 'bg-violet-100 text-violet-700'
                          : i === 2
                          ? 'bg-amber-100 text-amber-700'
                          : i === 3
                          ? 'bg-orange-100 text-orange-700'
                          : i === 4
                          ? 'bg-green-100 text-green-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {tier}
                    </div>
                    {i < 3 ? (
                      <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2 shadow-sm">
                        <div className="h-2 bg-gray-200 rounded w-3/4" />
                        <div className="h-2 bg-gray-100 rounded w-1/2" />
                        <div className="h-5 bg-amber-100 rounded-full" />
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-200 rounded-xl h-16 flex flex-col items-center justify-center gap-1">
                        <span className="text-gray-300 text-lg font-light">+</span>
                        <span className="text-xs text-gray-300">Gap</span>
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
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              One money model. Four problems solved.
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Most business problems trace back to a broken offer stack. Fix the model, fix the business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="flex gap-5 p-7 rounded-2xl border border-gray-100 hover:border-brand-gold/30 hover:bg-amber-50/20 transition-all group"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-dark rounded-xl flex items-center justify-center group-hover:bg-brand-charcoal transition-colors">
                    <Icon size={22} className="text-brand-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-24 px-4 bg-brand-cream">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              From confusion to clarity in three steps
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              A structured process that gives you actionable insight — not just theory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                <div className="text-7xl font-black text-brand-gold/20 mb-3 leading-none select-none">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-5 text-gray-300 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Real results from real businesses
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-7 border border-gray-100 flex flex-col">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-brand-gold fill-brand-gold" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed flex-1 mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{t.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-24 px-4 bg-brand-dark">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Your money model is fixable.
          </h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            In 10 minutes, you&apos;ll see exactly what&apos;s missing — and what to build to lower your CAC, speed up payback, maximize LTV, and stabilize your revenue.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-light text-brand-dark font-bold px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-brand-gold/20"
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/pricing"
              className="text-gray-400 hover:text-white font-medium underline underline-offset-4 transition-colors"
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
