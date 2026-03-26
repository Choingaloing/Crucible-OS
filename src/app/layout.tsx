import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Crucible — Client-Financed Acquisition for Business Owners',
  description:
    'Crucible helps business owners implement client-financed acquisition — engineering offers to maximize gross profit within 30 days and reduce CAC. Permission to scale.',
  keywords: ['client-financed acquisition', 'CAC payback', 'offer structure', 'business scaling', 'money model', 'consulting'],
  icons: {
    icon: '/crucible-icon.svg',
    apple: '/crucible-icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
