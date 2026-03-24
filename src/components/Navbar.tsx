'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 relative">
              {/* Crucible icon — stylized C with flame */}
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                <rect width="32" height="32" rx="8" fill="#1A1A1A"/>
                <path
                  d="M10 10 L16 8 L22 10 L22 19 Q16 26 10 19 Z"
                  fill="#C9A84C"
                  opacity="0.9"
                />
                <path
                  d="M13 14 L16 12 L19 14 L19 19 Q16 23 13 19 Z"
                  fill="#E8C96A"
                />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 group-hover:text-brand-gold transition-colors">
              Crucible
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-semibold bg-brand-dark hover:bg-brand-charcoal text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-5 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block text-sm text-gray-700 hover:text-gray-900 font-medium py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <Link
              href="/dashboard"
              className="block text-sm text-gray-600 font-medium py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="block text-sm font-semibold bg-brand-dark text-white py-2.5 px-3 rounded-xl text-center"
              onClick={() => setMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
