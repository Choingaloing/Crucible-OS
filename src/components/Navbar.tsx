'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'

const navLinks = [
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'The Three Levers', href: '/#levers' },
  { label: 'Pricing', href: '/pricing' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-brand-cream/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/crucible-logo.svg"
              alt="Crucible"
              width={1400}
              height={750}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-gray-600 hover:text-brand-brown font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-brand-brown font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-black uppercase tracking-wider bg-brand-gold hover:bg-brand-gold-light text-brand-brown px-6 py-2.5 rounded-full transition-all hover:shadow-md hover:shadow-brand-gold/30 hover:-translate-y-0.5"
            >
              Apply Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-brand-brown hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-brand-cream border-t border-gray-200 px-4 py-5 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block text-sm text-gray-700 hover:text-brand-brown font-medium py-2.5 px-3 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-200 space-y-2">
            <Link
              href="/dashboard"
              className="block text-sm text-gray-600 font-medium py-2.5 px-3 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/pricing"
              className="block text-sm font-black uppercase tracking-wider bg-brand-gold text-brand-brown py-3 px-4 rounded-full text-center"
              onClick={() => setMenuOpen(false)}
            >
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
