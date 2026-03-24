import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, TrendingDown, Clock, TrendingUp, Shield } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '$297',
    period: 'one-time',
    description:
      'Get a clear picture of your current money model and identify your top revenue gaps.',
    features: [
      '1 Offer Map Session (60 min)',
      'Full offer audit & documentation',
      'Gap analysis report',
      'Money model PDF export',
      'CAC & LTV impact assessment',
      'Email support',
    ],
    cta: 'Book a Starter Session',
    highlighted: false,
    badge: null,
  },
  {
    name: 'Growth',
    price: '$997',
    period: 'per month',
    description:
      'For business owners actively building and optimizing their offer stack to stabilize and scale.',
    features: [
      '4 Strategy Sessions / month',
      'Live offer mapping sessions',
      'Custom scale roadmap',
      'CAC reduction strategy',
      'CAC payback period planning',
      'LTV maximization roadmap',
      'Priority implementation support',
      'Monthly money model reviews',
      'Slack access to your consultant',
    ],
    cta: 'Start Growing',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Scale',
    price: '$2,997',
    period: 'per month',
    description:
      'Full-service engagement for businesses serious about building a predictable, scalable money model.',
    features: [
      'Everything in Growth',
      'Weekly strategy calls',
      'Done-with-you offer creation',
      'Launch planning & support',
      'Full money model buildout',
      'Revenue stability framework',
      'VIP Slack & direct line access',
      'Team onboarding support',
    ],
    cta: 'Scale My Business',
    highlighted: false,
    badge: null,
  },
]

const moneyModelGoals = [
  {
    icon: TrendingDown,
    label: 'Lower Your CAC',
    desc: 'A complete offer stack with strong lead magnets drives organic acquisition, cutting what you pay per customer.',
  },
  {
    icon: Clock,
    label: 'Shrink Your CAC Payback Period',
    desc: 'Entry offers and order bumps mean customers cover their acquisition cost in days, not months.',
  },
  {
    icon: TrendingUp,
    label: 'Maximize Customer LTV',
    desc: 'A well-structured value ladder keeps customers ascending, dramatically increasing revenue per relationship.',
  },
  {
    icon: Shield,
    label: 'Stabilize Your Business',
    desc: 'Continuity offers create predictable monthly revenue you can plan, hire, and invest from.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        {/* ─── Header ─── */}
        <section className="pt-20 pb-16 px-4 text-center bg-white">
          <div className="inline-flex items-center gap-2 bg-brand-dark text-brand-gold text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
            Straightforward Pricing
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Invest in fixing<br />your money model.
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            The right offer stack lowers your CAC, speeds payback, maximizes LTV, and stabilizes your business. Choose the engagement that fits where you are right now.
          </p>
        </section>

        {/* ─── Goal pills ─── */}
        <section className="pb-16 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {moneyModelGoals.map((goal) => {
              const Icon = goal.icon
              return (
                <div key={goal.label} className="bg-brand-cream rounded-2xl p-5 border border-gray-100 text-center">
                  <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon size={18} className="text-brand-gold" />
                  </div>
                  <div className="font-semibold text-gray-900 text-sm mb-1.5">{goal.label}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{goal.desc}</div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ─── Plans ─── */}
        <section className="pb-24 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 flex flex-col relative ${
                  plan.highlighted
                    ? 'bg-brand-dark ring-2 ring-brand-gold'
                    : 'bg-white border border-gray-100'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-gold text-brand-dark text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wide">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-7">
                  <h3
                    className={`text-lg font-bold mb-2 ${
                      plan.highlighted ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span
                      className={`text-4xl font-black tracking-tight ${
                        plan.highlighted ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span className={`text-sm ${plan.highlighted ? 'text-gray-400' : 'text-gray-400'}`}>
                      / {plan.period}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${plan.highlighted ? 'text-gray-400' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <CheckCircle2
                        size={15}
                        className={`mt-0.5 flex-shrink-0 ${
                          plan.highlighted ? 'text-brand-gold' : 'text-brand-gold'
                        }`}
                      />
                      <span className={plan.highlighted ? 'text-gray-300' : 'text-gray-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/dashboard"
                  className={`flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all text-sm ${
                    plan.highlighted
                      ? 'bg-brand-gold hover:bg-brand-gold-light text-brand-dark'
                      : 'bg-brand-dark hover:bg-brand-charcoal text-white'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FAQ / Start simple ─── */}
        <section className="py-20 px-4 bg-brand-cream border-t border-gray-100">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Not sure where to start?</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Start with a single Starter session. In 60 minutes, you&apos;ll see exactly which offer tiers are missing from your money model and how it&apos;s affecting your CAC, payback period, LTV, and revenue stability. Most clients upgrade after the first session.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-brand-dark hover:bg-brand-charcoal text-white font-bold px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-gray-200"
            >
              Book a Free Discovery Call
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
