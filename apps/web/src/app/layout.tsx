import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RIVISO - Advanced SEO Analytics Platform',
  description: 'Professional SEO audit and analytics tool for comprehensive website analysis and optimization',
  keywords: ['RIVISO', 'SEO', 'analytics', 'audit', 'website analysis', 'search engine optimization', 'digital marketing'],
  authors: [{ name: 'RIVISO' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'RIVISO - Advanced SEO Analytics Platform',
    description: 'Professional SEO audit and analytics tool for comprehensive website analysis and optimization',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RIVISO - Advanced SEO Analytics Platform',
    description: 'Professional SEO audit and analytics tool for comprehensive website analysis and optimization',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        {children}
      </body>
    </html>
  )
}
