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
        <div className="min-h-full">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-primary-600">
                    RIVISO
                  </h1>
                </div>
                <nav className="hidden md:flex space-x-8">
                  <a
                    href="/"
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Home
                  </a>
                  <a
                    href="/docs"
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Documentation
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-gray-500">
                © 2024 RIVISO. Advanced SEO Analytics Platform.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
