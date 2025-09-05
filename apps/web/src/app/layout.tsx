import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RIVISO - Advanced SEO Analytics Platform',
  description: 'Professional SEO audit and analytics tool for comprehensive website analysis and optimization',
  keywords: ['RIVISO', 'SEO', 'analytics', 'audit', 'website analysis', 'search engine optimization', 'digital marketing'],
  authors: [{ name: 'RIVISO' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
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
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
