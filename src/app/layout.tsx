import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Crucible — Fix Your Money Model in 10 Minutes',
  description:
    'Crucible helps business owners map every offer in their business, identify revenue gaps, and build a clear path to lower CAC, faster payback, higher LTV, and stable revenue.',
  keywords: ['business consulting', 'offer map', 'revenue strategy', 'money model', 'business scaling'],
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
