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
  manifest: '/manifest.json',
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
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TZ7WWLSG');`,
          }}
        />
        {/* End Google Tag Manager */}

        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "RIVISO",
              "description": "Advanced SEO Analytics Platform for comprehensive website analysis and optimization",
              "url": "https://www.riviso.com",
              "logo": "https://www.riviso.com/logo.png",
              "foundingDate": "2024",
              "founder": {
                "@type": "Person",
                "name": "Akhilesh Soni",
                "email": "akhilesh@riviso.com"
              },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              },
              "sameAs": [
                "https://github.com/TheHypedge/riviso"
              ],
              "offers": {
                "@type": "Offer",
                "name": "SEO Analytics Services",
                "description": "Professional SEO audit and analytics tools",
                "category": "SEO Services"
              }
            })
          }}
        />

        {/* Structured Data - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "RIVISO",
              "url": "https://www.riviso.com",
              "description": "Professional SEO audit and analytics tool for comprehensive website analysis and optimization",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.riviso.com/resources-checker?url={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />

        {/* Structured Data - SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "RIVISO SEO Analytics Platform",
              "description": "Advanced SEO analytics and website audit tool",
              "url": "https://www.riviso.com",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "description": "Free SEO analysis tools"
              },
              "featureList": [
                "Website Performance Analysis",
                "Core Web Vitals Testing",
                "SEO Audit Tools",
                "Domain History Checker",
                "On-Page Optimization",
                "Keyword Testing"
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.className} h-full`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TZ7WWLSG"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
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
