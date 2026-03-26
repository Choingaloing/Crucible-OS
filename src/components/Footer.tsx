import Link from 'next/link'
import { CrucibleIcon, CrucibleWordmark } from './CrucibleLogo'

const footerLinks = {
  Navigation: [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'The Three Levers', href: '/#levers' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Offer Map Tool', href: '/tool' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Community (Skool)', href: '#' },
    { label: 'Contact', href: 'mailto:chandler@cruciblecoaching.org' },
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
            <Link href="/" className="flex items-center gap-2 mb-4 w-fit group">
              <CrucibleIcon size={34} />
              <CrucibleWordmark className="text-brand-off-white" />
            </Link>
            <p className="text-sm leading-relaxed max-w-xs text-gray-400">
              We help business owners implement client-financed acquisition — engineering offers to get you permission to scale until your fulfillment can&apos;t catch up.
            </p>
            <div className="mt-4 text-sm text-gray-500">
              <a href="mailto:chandler@cruciblecoaching.org" className="hover:text-brand-gold transition-colors">
                chandler@cruciblecoaching.org
              </a>
            </div>
            <p className="text-xs text-gray-600 mt-6">
              &copy; {new Date().getFullYear()} Crucible. All rights reserved.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-brand-off-white font-display font-bold text-xs uppercase tracking-widest mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-brand-off-white transition-colors"
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
