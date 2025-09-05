'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search } from 'lucide-react'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-orange-600 flex items-center">
              <div className="w-8 h-8 bg-orange-600 rounded-lg mr-2 flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              RIVISO
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/features" className="text-gray-700 hover:text-orange-600 transition-colors">
              Features
            </Link>
            <Link href="/services" className="text-gray-700 hover:text-orange-600 transition-colors">
              Services
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-orange-600 transition-colors">
              Pricing
            </Link>
            <Link href="/resources-checker" className="text-gray-700 hover:text-orange-600 transition-colors">
              Resources Checker
            </Link>
            <Link href="/domain-history-checker" className="text-gray-700 hover:text-orange-600 transition-colors">
              Domain History
            </Link>
            <Link href="/onpage-optimization" className="text-gray-700 hover:text-orange-600 transition-colors">
              On-Page SEO
            </Link>
            <Link href="/" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
              Start Free Audit
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-orange-600 focus:outline-none focus:text-orange-600"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <Link
                href="/features"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                Features
              </Link>
              <Link
                href="/services"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                Services
              </Link>
              <Link
                href="/pricing"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                Pricing
              </Link>
              <Link
                href="/resources-checker"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                Resources Checker
              </Link>
              <Link
                href="/domain-history-checker"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                Domain History
              </Link>
              <Link
                href="/onpage-optimization"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                On-Page SEO
              </Link>
              <Link
                href="/"
                className="block px-3 py-2 text-base font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors text-center"
                onClick={closeMobileMenu}
              >
                Start Free Audit
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
