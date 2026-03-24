'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  Plus,
  X,
  DollarSign,
  Edit3,
  Trash2,
  Save,
  Download,
  Info,
  TrendingDown,
  Clock,
  TrendingUp,
  Shield,
} from 'lucide-react'
import { CrucibleIcon, CrucibleWordmark } from '@/components/CrucibleLogo'

// ─── Types ────────────────────────────────────────────────────────────────────

type Offer = {
  id: string
  name: string
  price: string
  description: string
  format: string
}

type Tier = {
  id: string
  label: string
  description: string
  tagColor: string
  tagBg: string
  impact: string
  impactDetail: string
  impactIcon: 'cac' | 'payback' | 'ltv' | 'stability'
  offers: Offer[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FORMATS = [
  '1:1 Consultation',
  'Group Program',
  'Online Course',
  'PDF / Download',
  'Membership',
  'Monthly Retainer',
  'Workshop',
  'Live Event',
  'Software / Tool',
  'Done-For-You Service',
  'Coaching Package',
  'Community Access',
]

const INITIAL_TIERS: Tier[] = [
  {
    id: 'lead-magnet',
    label: 'Lead Magnet',
    description: 'Free value that attracts your ideal buyer',
    tagColor: 'text-blue-300',
    tagBg: 'bg-blue-900/40 border-blue-700/40',
    impact: 'Lowers CAC',
    impactDetail: 'Organic lead generation reduces your paid acquisition spend',
    impactIcon: 'cac',
    offers: [
      {
        id: '1',
        name: 'Free Business Audit Template',
        price: 'Free',
        description: 'A guided self-assessment for business owners',
        format: 'PDF / Download',
      },
    ],
  },
  {
    id: 'entry',
    label: 'Entry Offer',
    description: '$7–$97 — low-risk first purchase',
    tagColor: 'text-violet-300',
    tagBg: 'bg-violet-900/40 border-violet-700/40',
    impact: 'Speeds CAC Payback',
    impactDetail: 'Covers part of acquisition cost immediately at point of sale',
    impactIcon: 'payback',
    offers: [],
  },
  {
    id: 'core',
    label: 'Core Offer',
    description: 'Your primary product or service',
    tagColor: 'text-amber-300',
    tagBg: 'bg-amber-900/40 border-amber-700/40',
    impact: 'Builds LTV',
    impactDetail: 'Primary revenue driver — the anchor of your money model',
    impactIcon: 'ltv',
    offers: [
      {
        id: '2',
        name: 'Business Strategy Intensive',
        price: '$1,500',
        description: '90-min deep-dive session with full offer map deliverable',
        format: '1:1 Consultation',
      },
    ],
  },
  {
    id: 'upsell',
    label: 'Upsell / Order Bump',
    description: 'Complementary add-on at point of sale',
    tagColor: 'text-orange-300',
    tagBg: 'bg-orange-900/40 border-orange-700/40',
    impact: 'Speeds CAC Payback',
    impactDetail: 'Increases average order value — faster path to profitability',
    impactIcon: 'payback',
    offers: [],
  },
  {
    id: 'continuity',
    label: 'Continuity',
    description: 'Recurring revenue — memberships & retainers',
    tagColor: 'text-green-300',
    tagBg: 'bg-green-900/40 border-green-700/40',
    impact: 'Stabilizes Revenue',
    impactDetail: 'Predictable MRR you can plan, hire, and invest from',
    impactIcon: 'stability',
    offers: [],
  },
  {
    id: 'high-ticket',
    label: 'High-Ticket',
    description: '$5,000+ premium transformation offer',
    tagColor: 'text-rose-300',
    tagBg: 'bg-rose-900/40 border-rose-700/40',
    impact: 'Maximizes LTV',
    impactDetail: 'Dramatically increases total customer value over time',
    impactIcon: 'ltv',
    offers: [],
  },
]

const IMPACT_ICONS = {
  cac: TrendingDown,
  payback: Clock,
  ltv: TrendingUp,
  stability: Shield,
}

const IMPACT_COLORS = {
  cac: 'text-blue-400',
  payback: 'text-violet-400',
  ltv: 'text-green-400',
  stability: 'text-brand-gold',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ToolPage() {
  const [tiers, setTiers] = useState<Tier[]>(INITIAL_TIERS)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTierId, setActiveTierId] = useState<string | null>(null)
  const [selectedOffer, setSelectedOffer] = useState<{ offer: Offer; tierId: string } | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [form, setForm] = useState({ name: '', price: '', description: '', format: FORMATS[0] })

  const totalOffers = tiers.reduce((acc, t) => acc + t.offers.length, 0)
  const totalGaps = tiers.filter((t) => t.offers.length === 0).length

  const openAddModal = (tierId: string) => {
    setActiveTierId(tierId)
    setForm({ name: '', price: '', description: '', format: FORMATS[0] })
    setModalOpen(true)
  }

  const addOffer = () => {
    if (!form.name || !activeTierId) return
    setTiers((prev) =>
      prev.map((tier) =>
        tier.id === activeTierId
          ? { ...tier, offers: [...tier.offers, { id: Date.now().toString(), ...form }] }
          : tier
      )
    )
    setModalOpen(false)
  }

  const removeOffer = (tierId: string, offerId: string) => {
    setTiers((prev) =>
      prev.map((tier) =>
        tier.id === tierId
          ? { ...tier, offers: tier.offers.filter((o) => o.id !== offerId) }
          : tier
      )
    )
    if (selectedOffer?.offer.id === offerId) setSelectedOffer(null)
  }

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">

      {/* ─── Header ─── */}
      <header className="bg-brand-dark border-b border-white/10 px-6 py-3.5 flex items-center gap-4 sticky top-0 z-20">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors font-medium"
        >
          <ChevronLeft size={16} />
          Dashboard
        </Link>

        <div className="h-4 w-px bg-white/20" />

        <div className="flex items-center gap-2">
          <CrucibleIcon size={26} />
          <div>
            <span className="font-black text-white text-sm">Apex Marketing Co.</span>
            <span className="text-gray-400 text-sm font-medium"> — Money Model Map</span>
          </div>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="ml-4 flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-full transition-colors font-medium"
        >
          <Info size={13} />
          Impact Guide
        </button>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-5 text-sm">
            <span className="text-gray-400 font-medium">
              <strong className="text-white font-black">{totalOffers}</strong> offers mapped
            </span>
            {totalGaps > 0 && (
              <span className="text-brand-gold font-black">
                ⚠ {totalGaps} gap{totalGaps !== 1 ? 's' : ''} remaining
              </span>
            )}
          </div>
          <button className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white border border-white/20 hover:border-white/40 px-3 py-2 rounded-full transition-colors font-medium">
            <Download size={14} />
            Export
          </button>
          <button className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wider bg-brand-gold hover:bg-brand-gold-light text-brand-dark px-5 py-2 rounded-full transition-all">
            <Save size={14} />
            Save
          </button>
        </div>
      </header>

      {/* ─── Impact Guide Panel ─── */}
      {showInfo && (
        <div className="bg-brand-charcoal border-b border-white/10 px-6 py-5">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs text-gray-400 mb-4 uppercase tracking-widest font-black">
              How Each Tier Fixes Your Money Model
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { icon: TrendingDown, color: 'text-blue-400', label: 'Lowers CAC', desc: 'Lead Magnets bring leads in organically, reducing what you pay to acquire each customer.' },
                { icon: Clock, color: 'text-violet-400', label: 'Speeds CAC Payback', desc: 'Entry offers and upsells help you recover acquisition cost faster — sometimes immediately.' },
                { icon: TrendingUp, color: 'text-green-400', label: 'Maximizes LTV', desc: 'Core and high-ticket offers increase total revenue earned per customer relationship.' },
                { icon: Shield, color: 'text-brand-gold', label: 'Stabilizes Revenue', desc: 'Continuity (memberships, retainers) creates predictable monthly income you can plan around.' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex gap-3">
                    <Icon size={18} className={`${item.color} mt-0.5 flex-shrink-0`} />
                    <div>
                      <div className="text-white text-xs font-black mb-1">{item.label}</div>
                      <div className="text-gray-400 text-xs leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Page title bar ─── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-lg font-black text-brand-dark">Fix Your Money Model in 10 Minutes</h1>
        <p className="text-sm text-gray-500 mt-0.5 font-medium">
          Map every offer tier below. Gaps mean higher CAC, longer payback periods, lower LTV, and an unstable business.
        </p>
      </div>

      {/* ─── Canvas ─── */}
      <div className={`flex-1 overflow-x-auto p-6 ${selectedOffer ? 'pr-[21rem]' : ''}`}>
        <div className="flex gap-4 min-w-max h-full">
          {tiers.map((tier) => {
            const ImpactIcon = IMPACT_ICONS[tier.impactIcon]
            const impactColor = IMPACT_COLORS[tier.impactIcon]
            return (
              <div key={tier.id} className="w-72 flex flex-col">

                {/* Tier header */}
                <div className={`rounded-xl p-4 mb-3 border ${tier.tagBg} bg-brand-dark`}>
                  <div className={`font-black text-sm ${tier.tagColor} mb-0.5`}>{tier.label}</div>
                  <div className="text-xs text-gray-400 mb-2 font-medium">{tier.description}</div>
                  <div className={`flex items-center gap-1 text-xs font-bold ${impactColor}`}>
                    <ImpactIcon size={12} />
                    {tier.impact}
                  </div>
                  <div className="text-xs text-gray-500 mt-1.5 font-medium">
                    {tier.offers.length} offer{tier.offers.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Offers */}
                <div className="flex-1 space-y-3">
                  {tier.offers.map((offer) => (
                    <div
                      key={offer.id}
                      onClick={() => setSelectedOffer({ offer, tierId: tier.id })}
                      className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedOffer?.offer.id === offer.id
                          ? 'border-brand-gold shadow-md shadow-brand-gold/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2.5">
                        <h4 className="text-sm font-black text-brand-dark leading-snug flex-1 pr-2">
                          {offer.name}
                        </h4>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeOffer(tier.id, offer.id) }}
                          className="p-0.5 text-gray-200 hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs font-black text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                          <DollarSign size={10} />
                          {offer.price}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 font-medium">
                          {offer.format}
                        </span>
                      </div>
                      {offer.description && (
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed line-clamp-2">
                          {offer.description}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Gap state */}
                  {tier.offers.length === 0 && (
                    <div className="border-2 border-dashed border-brand-gold/40 bg-brand-gold/5 rounded-xl p-5 text-center">
                      <div className="text-2xl mb-1">⚠️</div>
                      <div className="text-xs font-black text-brand-dark mb-0.5">Gap Identified</div>
                      <div className="text-xs text-gray-400 mb-3 font-medium">
                        Missing this tier hurts your money model
                      </div>
                      <button
                        onClick={() => openAddModal(tier.id)}
                        className="text-xs font-black text-brand-orange hover:text-brand-orange-light transition-colors uppercase tracking-wider"
                      >
                        + Add an offer
                      </button>
                    </div>
                  )}

                  {/* Add button */}
                  <button
                    onClick={() => openAddModal(tier.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-400 hover:text-brand-dark hover:bg-white border border-transparent hover:border-gray-200 rounded-xl transition-all font-medium"
                  >
                    <Plus size={14} />
                    Add offer
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Offer detail panel ─── */}
      {selectedOffer && (
        <aside className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-2xl z-30 flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h3 className="font-black text-brand-dark">Offer Details</h3>
            <button
              onClick={() => setSelectedOffer(null)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Offer Name</label>
              <div className="mt-1 text-sm font-black text-brand-dark">{selectedOffer.offer.name}</div>
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Price Point</label>
              <div className="mt-1 text-2xl font-black text-green-700">{selectedOffer.offer.price}</div>
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Delivery Format</label>
              <div className="mt-1 text-sm text-gray-700 font-medium">{selectedOffer.offer.format}</div>
            </div>
            {selectedOffer.offer.description && (
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Description</label>
                <div className="mt-1 text-sm text-gray-600 leading-relaxed font-medium">{selectedOffer.offer.description}</div>
              </div>
            )}

            {/* Money model impact */}
            <div className="bg-brand-dark rounded-xl p-4">
              <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
                Money Model Impact
              </div>
              {(() => {
                const tier = tiers.find((t) => t.id === selectedOffer.tierId)
                if (!tier) return null
                const ImpactIcon = IMPACT_ICONS[tier.impactIcon]
                const impactColor = IMPACT_COLORS[tier.impactIcon]
                return (
                  <div>
                    <div className={`flex items-center gap-2 text-sm font-black ${impactColor} mb-1`}>
                      <ImpactIcon size={16} />
                      {tier.impact}
                    </div>
                    <div className="text-xs text-gray-400 leading-relaxed font-medium">{tier.impactDetail}</div>
                  </div>
                )
              })()}
            </div>
          </div>

          <div className="px-6 py-5 border-t border-gray-100 space-y-2">
            <button className="w-full flex items-center justify-center gap-2 text-sm font-bold text-brand-dark border border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-4 py-2.5 rounded-xl transition-colors">
              <Edit3 size={14} />
              Edit Offer
            </button>
            <button
              onClick={() => removeOffer(selectedOffer.tierId, selectedOffer.offer.id)}
              className="w-full flex items-center justify-center gap-2 text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-colors"
            >
              <Trash2 size={14} />
              Remove Offer
            </button>
          </div>
        </aside>
      )}

      {/* ─── Add offer modal ─── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="font-black text-brand-dark text-lg">Add New Offer</h3>
                {activeTierId && (
                  <p className="text-sm text-gray-400 mt-0.5 font-medium">
                    Adding to: {tiers.find((t) => t.id === activeTierId)?.label}
                  </p>
                )}
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-black text-brand-dark mb-1.5">
                  Offer Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. 6-Week Business Accelerator"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold transition-colors font-medium"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-black text-brand-dark mb-1.5">Price Point</label>
                <input
                  type="text"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="e.g. $997 or Free"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-brand-dark mb-1.5">Delivery Format</label>
                <select
                  value={form.format}
                  onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold bg-white transition-colors font-medium"
                >
                  {FORMATS.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-brand-dark mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What does this offer include? Who is it for?"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold transition-colors resize-none font-medium"
                />
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 border border-gray-200 text-brand-dark font-bold py-3 rounded-full text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addOffer}
                disabled={!form.name}
                className="flex-1 bg-brand-gold hover:bg-brand-gold-light disabled:bg-gray-100 disabled:text-gray-300 text-brand-dark font-black uppercase tracking-wider py-3 rounded-full text-sm transition-all"
              >
                Add Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
