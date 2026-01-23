import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Riviso - AI-Driven Growth Intelligence Platform',
  description: 'SEO analysis, competitor tracking, and AI-powered insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
