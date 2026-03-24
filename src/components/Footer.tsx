import Link from 'next/link'

const footerLinks = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Offer Map Tool', href: '/tool' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group w-fit">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                <rect width="32" height="32" rx="8" fill="#2D2D2D"/>
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
              <span className="text-lg font-bold text-white">Crucible</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Build the offer stack your business deserves. Map your money model. Scale with clarity.
            </p>
            <p className="text-xs text-gray-600 mt-6">
              &copy; {new Date().getFullYear()} Crucible. All rights reserved.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
