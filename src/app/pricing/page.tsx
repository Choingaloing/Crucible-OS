import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, TrendingDown, Clock, TrendingUp, Shield } from 'lucide-react'

const moneyModelGoals = [
  {
    icon: TrendingDown,
    label: 'Reduce CAC Payback',
    desc: 'Engineer your offers so acquisition costs are recovered within 30 days — not months.',
  },
  {
    icon: Clock,
    label: 'Speed Up Cash Flow',
    desc: 'Restructure your first 30 days so gross profit hits before your next ad bill does.',
  },
  {
    icon: TrendingUp,
    label: 'Increase LTV',
    desc: 'Build a value ladder that keeps customers ascending — more revenue per relationship, compounding over time.',
  },
  {
    icon: Shield,
    label: 'Scale With Confidence',
    desc: 'When the math works, you have permission to spend. Scale until your fulfillment can\'t catch up.',
  },
]

const included = [
  'Offer analysis & audit',
  'Custom money model development',
  'CAC payback period engineering',
  'Offer structure recommendations',
  'LTV maximization roadmap',
  'Ongoing strategy support',
  'Implementation guidance (do-it-with-you)',
  'Revenue gap identification',
  'Scale readiness assessment',
  'Direct access via Slack',
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-brand-charcoal">
      <Navbar />

      <main>
        {/* ─── Header ─── */}
        <section className="pt-20 pb-16 px-4 text-center bg-brand-charcoal">
          <div className="inline-flex items-center gap-2 bg-brand-dark text-brand-gold text-xs font-black uppercase tracking-widest px-5 py-2 rounded-full mb-8 border border-brand-gold/20">
            Straightforward Pricing
          </div>
          <h1 className="font-display text-5xl font-black text-brand-off-white mb-4 leading-tight">
            Invest in fixing<br />your offer economics.
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
            One engagement. Three levers. Reduce CAC payback period, improve offer structure, increase LTV. Do-it-with-you, not done-for-you.
          </p>
        </section>

        {/* ─── Goal pills ─── */}
        <section className="pb-16 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {moneyModelGoals.map((goal) => {
              const Icon = goal.icon
              return (
                <div key={goal.label} className="bg-brand-dark rounded-2xl p-5 border border-white/10 text-center hover:border-brand-gold/40 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-brand-charcoal rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon size={18} className="text-brand-gold" />
                  </div>
                  <div className="font-display font-black text-brand-off-white text-sm mb-1.5">{goal.label}</div>
                  <div className="text-xs text-gray-400 leading-relaxed font-medium">{goal.desc}</div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ─── Single Plan ─── */}
        <section className="pb-24 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl p-10 bg-brand-dark ring-2 ring-brand-gold shadow-2xl shadow-black/40 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-brand-gold text-brand-charcoal text-xs font-black px-5 py-1.5 rounded-full uppercase tracking-widest">
                  Monthly Consulting
                </span>
              </div>

              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-2 mb-3">
                  <span className="text-5xl font-display font-black text-brand-off-white tracking-tight">
                    $3,000
                  </span>
                  <span className="text-lg text-gray-400 font-medium">/ month</span>
                </div>
                <p className="text-gray-400 font-medium leading-relaxed max-w-md mx-auto">
                  Ongoing engagement focused on shortening CAC payback period and building offer economics that make scaling safe.
                </p>
              </div>

              <div className="border-t border-white/10 pt-8 mb-8">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-5">What&apos;s included</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {included.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <CheckCircle2
                        size={15}
                        className="mt-0.5 flex-shrink-0 text-brand-gold"
                      />
                      <span className="text-gray-300 font-medium">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center">
                <a
                  href="https://cruciblecoaching.org/money-model"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 font-black uppercase tracking-wider py-4 px-12 rounded-full transition-all text-base bg-brand-gold hover:bg-brand-gold-light text-brand-charcoal hover:shadow-lg hover:shadow-brand-gold/30 hover:-translate-y-0.5"
                >
                  Apply Now
                  <ArrowRight size={18} />
                </a>
                <p className="text-xs text-gray-500 mt-4 font-medium">
                  Starting at $3,000/month. Not a commodity — a consulting engagement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Who It's For ─── */}
        <section className="py-20 px-4 bg-brand-dark border-t border-white/10">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-black text-brand-off-white mb-8 text-center">Who this is for</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-black text-brand-gold uppercase tracking-wider mb-4">Good fit</p>
                <ul className="space-y-3">
                  {[
                    'Established business with consistent acquisition',
                    'Team that can handle 2x+ volume',
                    'Willing to restructure your offer',
                    'CAC exceeds 30-day gross profit',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-300 font-medium">
                      <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0 text-brand-gold" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-black text-brand-orange uppercase tracking-wider mb-4">Not for</p>
                <ul className="space-y-3">
                  {[
                    'Pre-revenue businesses',
                    'Solopreneurs with no team',
                    'Businesses that can\'t handle more fulfillment',
                    'Anyone unwilling to change their offer',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-400 font-medium">
                      <span className="mt-0.5 flex-shrink-0 text-gray-500">—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Bottom CTA ─── */}
        <section className="py-20 px-4 bg-brand-charcoal">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl font-black text-brand-off-white mb-4">Not sure if this fits?</h2>
            <p className="text-gray-400 mb-8 leading-relaxed font-medium">
              If your CAC payback period is longer than 30 days, your offer economics are costing you. One conversation will tell you whether client-financed acquisition is the right move for your business.
            </p>
            <a
              href="https://cruciblecoaching.org/money-model"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-light text-brand-charcoal font-black uppercase tracking-wider px-10 py-4 rounded-full transition-all hover:shadow-xl hover:shadow-brand-gold/30 hover:-translate-y-0.5"
            >
              Book a Discovery Call
              <ArrowRight size={18} />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
