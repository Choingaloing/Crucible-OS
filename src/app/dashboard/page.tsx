'use client'

import Link from 'next/link'
import {
  BarChart2,
  Users,
  Map,
  TrendingUp,
  AlertCircle,
  Plus,
  ChevronRight,
  Settings,
  Bell,
  Search,
  LogOut,
  Home,
} from 'lucide-react'
import { CrucibleIcon, CrucibleWordmark } from '@/components/CrucibleLogo'

const stats = [
  { label: 'Active Clients', value: '12', icon: Users, change: '+2 this month', positive: true },
  { label: 'Offer Maps', value: '8', icon: Map, change: '3 in progress', positive: null },
  { label: 'Offers Mapped', value: '147', icon: BarChart2, change: '+23 this week', positive: true },
  { label: 'Gaps Identified', value: '64', icon: AlertCircle, change: 'Across all clients', positive: null },
]

const clients = [
  { name: 'Apex Marketing Co.', status: 'In Progress', offers: 12, gaps: 5, lastUpdated: '2 days ago', initials: 'AM' },
  { name: 'Summit E-commerce', status: 'Completed', offers: 18, gaps: 3, lastUpdated: '1 week ago', initials: 'SE' },
  { name: 'Bright Consulting', status: 'New', offers: 0, gaps: 0, lastUpdated: 'Today', initials: 'BC' },
  { name: 'Vero Digital', status: 'In Progress', offers: 7, gaps: 8, lastUpdated: '3 days ago', initials: 'VD' },
  { name: 'Pinnacle Health', status: 'Completed', offers: 22, gaps: 2, lastUpdated: '2 weeks ago', initials: 'PH' },
]

const statusStyles: Record<string, string> = {
  New: 'bg-blue-900/40 text-blue-300 border border-blue-700/30',
  'In Progress': 'bg-amber-900/40 text-amber-300 border border-amber-700/30',
  Completed: 'bg-green-900/40 text-green-300 border border-green-700/30',
}

const navItems = [
  { label: 'Overview', icon: Home, href: '/dashboard', active: true },
  { label: 'Clients', icon: Users, href: '/dashboard', active: false },
  { label: 'Offer Maps', icon: Map, href: '/tool', active: false },
  { label: 'Analytics', icon: TrendingUp, href: '/dashboard', active: false },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-brand-charcoal flex">

      {/* ─── Sidebar ─── */}
      <aside className="w-60 bg-brand-dark flex flex-col fixed h-full z-30 border-r border-white/10">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
          <CrucibleIcon size={30} />
          <CrucibleWordmark className="text-brand-off-white text-base" />
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  item.active
                    ? 'bg-brand-gold text-brand-charcoal'
                    : 'text-gray-400 hover:bg-white/5 hover:text-brand-off-white'
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-brand-off-white transition-colors"
          >
            <Settings size={17} />
            Settings
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-brand-off-white transition-colors"
          >
            <LogOut size={17} />
            Sign Out
          </Link>

          {/* Avatar */}
          <div className="flex items-center gap-3 px-3 py-3 mt-2">
            <div className="w-9 h-9 bg-brand-gold rounded-xl flex items-center justify-center text-xs font-black text-brand-charcoal flex-shrink-0">
              JD
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-brand-off-white truncate">John Doe</div>
              <div className="text-xs text-gray-500 truncate">Consultant</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">

        {/* Top header */}
        <header className="bg-brand-dark border-b border-white/10 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="font-display text-xl font-black text-brand-off-white">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5 font-medium">Welcome back, John. Here&apos;s your overview.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-brand-off-white hover:bg-white/5 rounded-lg transition-colors">
              <Search size={18} />
            </button>
            <button className="relative p-2 text-gray-400 hover:text-brand-off-white hover:bg-white/5 rounded-lg transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-gold rounded-full" />
            </button>
            <Link
              href="/tool"
              className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-light text-brand-charcoal text-sm font-black uppercase tracking-wider px-5 py-2.5 rounded-full transition-all ml-2"
            >
              <Plus size={16} />
              New Offer Map
            </Link>
          </div>
        </header>

        <main className="flex-1 p-8">

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-brand-dark rounded-2xl p-6 border border-white/10 hover:border-brand-gold/40 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 bg-brand-charcoal rounded-xl flex items-center justify-center">
                      <Icon size={18} className="text-brand-gold" />
                    </div>
                  </div>
                  <div className="text-3xl font-display font-black text-brand-off-white mb-1 tracking-tight">{stat.value}</div>
                  <div className="text-sm text-gray-400 font-medium mb-1">{stat.label}</div>
                  <div className={`text-xs font-bold ${stat.positive === true ? 'text-green-400' : 'text-gray-500'}`}>
                    {stat.change}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Clients table */}
          <div className="bg-brand-dark rounded-2xl border border-white/10">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <h2 className="font-display font-black text-brand-off-white">Recent Clients</h2>
              <button className="flex items-center gap-1 text-sm text-brand-orange hover:text-brand-orange-light font-bold transition-colors">
                View all <ChevronRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="text-left px-6 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Offers</th>
                    <th className="text-left px-6 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Gaps</th>
                    <th className="text-left px-6 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {clients.map((client) => (
                    <tr key={client.name} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-brand-charcoal rounded-xl flex items-center justify-center text-xs font-black text-brand-gold flex-shrink-0">
                            {client.initials}
                          </div>
                          <span className="text-sm font-bold text-brand-off-white">{client.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusStyles[client.status]}`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 font-bold">{client.offers}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${client.gaps > 0 ? 'text-brand-orange' : 'text-gray-600'}`}>
                          {client.gaps > 0 ? `${client.gaps} gaps` : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">{client.lastUpdated}</td>
                      <td className="px-6 py-4">
                        <Link
                          href="/tool"
                          className="text-sm text-brand-orange hover:text-brand-orange-light font-black opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Open Map &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Start New Offer Map', desc: 'Open a blank session for a new or existing client', href: '/tool', cta: 'Open Tool →' },
              { label: 'Review Pricing', desc: 'Update or review your consulting engagement details', href: '/pricing', cta: 'View Pricing →' },
              { label: 'Export a Report', desc: "Download a client's offer map as a PDF summary", href: '#', cta: 'Coming Soon' },
            ].map((action) => (
              <div key={action.label} className="bg-brand-dark rounded-2xl border border-white/10 p-5 hover:border-brand-gold/40 hover:shadow-md transition-all">
                <h3 className="font-display font-black text-brand-off-white text-sm mb-1">{action.label}</h3>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed font-medium">{action.desc}</p>
                <Link href={action.href} className="text-xs font-black text-brand-orange hover:text-brand-orange-light transition-colors uppercase tracking-wider">
                  {action.cta}
                </Link>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
