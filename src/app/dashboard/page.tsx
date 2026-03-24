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

const stats = [
  {
    label: 'Active Clients',
    value: '12',
    icon: Users,
    change: '+2 this month',
    positive: true,
  },
  {
    label: 'Offer Maps',
    value: '8',
    icon: Map,
    change: '3 in progress',
    positive: null,
  },
  {
    label: 'Offers Mapped',
    value: '147',
    icon: BarChart2,
    change: '+23 this week',
    positive: true,
  },
  {
    label: 'Gaps Identified',
    value: '64',
    icon: AlertCircle,
    change: 'Across all clients',
    positive: null,
  },
]

const clients = [
  { name: 'Apex Marketing Co.', status: 'In Progress', offers: 12, gaps: 5, lastUpdated: '2 days ago', initials: 'AM' },
  { name: 'Summit E-commerce', status: 'Completed', offers: 18, gaps: 3, lastUpdated: '1 week ago', initials: 'SE' },
  { name: 'Bright Consulting', status: 'New', offers: 0, gaps: 0, lastUpdated: 'Today', initials: 'BC' },
  { name: 'Vero Digital', status: 'In Progress', offers: 7, gaps: 8, lastUpdated: '3 days ago', initials: 'VD' },
  { name: 'Pinnacle Health', status: 'Completed', offers: 22, gaps: 2, lastUpdated: '2 weeks ago', initials: 'PH' },
]

const statusStyles: Record<string, string> = {
  New: 'bg-blue-50 text-blue-700 border border-blue-100',
  'In Progress': 'bg-amber-50 text-amber-700 border border-amber-100',
  Completed: 'bg-green-50 text-green-700 border border-green-100',
}

const navItems = [
  { label: 'Overview', icon: Home, href: '/dashboard', active: true },
  { label: 'Clients', icon: Users, href: '/dashboard', active: false },
  { label: 'Offer Maps', icon: Map, href: '/tool', active: false },
  { label: 'Analytics', icon: TrendingUp, href: '/dashboard', active: false },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ─── Sidebar ─── */}
      <aside className="w-60 bg-brand-dark flex flex-col fixed h-full z-30">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 flex-shrink-0">
            <rect width="32" height="32" rx="8" fill="#2D2D2D"/>
            <path d="M10 10 L16 8 L22 10 L22 19 Q16 26 10 19 Z" fill="#C9A84C" opacity="0.9"/>
            <path d="M13 14 L16 12 L19 14 L19 19 Q16 23 13 19 Z" fill="#E8C96A"/>
          </svg>
          <span className="text-lg font-bold text-white">Crucible</span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Settings size={17} />
            Settings
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut size={17} />
            Sign Out
          </Link>

          {/* Avatar */}
          <div className="flex items-center gap-3 px-3 py-3 mt-2">
            <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center text-xs font-bold text-brand-dark flex-shrink-0">
              JD
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">John Doe</div>
              <div className="text-xs text-gray-500 truncate">Consultant</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">

        {/* Top header */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">Welcome back, John. Here&apos;s your overview.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <Search size={18} />
            </button>
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-gold rounded-full" />
            </button>
            <Link
              href="/tool"
              className="flex items-center gap-2 bg-brand-dark hover:bg-brand-charcoal text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors ml-2"
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
                <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center">
                      <Icon size={18} className="text-brand-gold" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{stat.value}</div>
                  <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
                  <div
                    className={`text-xs font-medium ${
                      stat.positive === true
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {stat.change}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Clients table */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
              <h2 className="font-bold text-gray-900">Recent Clients</h2>
              <button className="flex items-center gap-1 text-sm text-brand-gold hover:text-brand-gold-dark font-medium transition-colors">
                View all <ChevronRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Offers
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Gaps
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {clients.map((client) => (
                    <tr key={client.name} className="hover:bg-gray-50/60 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-brand-dark rounded-xl flex items-center justify-center text-xs font-bold text-brand-gold flex-shrink-0">
                            {client.initials}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{client.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[client.status]}`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">{client.offers}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${client.gaps > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                          {client.gaps > 0 ? `${client.gaps} gaps` : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{client.lastUpdated}</td>
                      <td className="px-6 py-4">
                        <Link
                          href="/tool"
                          className="text-sm text-brand-gold hover:text-brand-gold-dark font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Open Map →
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
              { label: 'Review Pricing Plans', desc: 'Update or review your consulting engagement tiers', href: '/pricing', cta: 'View Pricing →' },
              { label: 'Export a Report', desc: 'Download a client\'s offer map as a PDF summary', href: '#', cta: 'Coming Soon' },
            ].map((action) => (
              <div key={action.label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-colors">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{action.label}</h3>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">{action.desc}</p>
                <Link
                  href={action.href}
                  className="text-xs font-semibold text-brand-gold hover:text-brand-gold-dark transition-colors"
                >
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
