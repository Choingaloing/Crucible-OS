import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import FacebookPixel from '@/components/shared/FacebookPixel'
import './globals.css'

// Inter is self-hosted (variable font, Latin incl. Spanish accents) instead of next/font/google:
// Next 14.2's Google loader can no longer parse Google's font responses, so builds either fail
// or reuse stale cached font CSS whose class names don't match the HTML (pages lose the font).
const inter = localFont({
  src: './fonts/inter-latin.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Crucible — Reduce Your CAC Payback Period',
  description: 'AI-powered analysis to help business owners reduce their customer acquisition cost payback period.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Crucible',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  verification: {
    other: {
      'facebook-domain-verification': 'e5qc3zaa2tiga1r368hl73m6gl1t3e',
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#FF8800',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <FacebookPixel />
        {children}
      </body>
    </html>
  )
}
