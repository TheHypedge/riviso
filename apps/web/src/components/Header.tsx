'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Search } from 'lucide-react'
import logoImage from '@/assets/riviso.png'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="glass sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600 flex items-center hover-scale">
              <Image 
                src={logoImage} 
                alt="RIVISO" 
                width={32} 
                height={32} 
                className="mr-3 rounded-lg shadow-lg"
              />
              RIVISO
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <div className="flex space-x-8">
              <Link href="/features" className="text-gray-700 hover:text-primary-600 transition-colors font-medium hover-lift">
                Features
              </Link>
              <Link href="/services" className="text-gray-700 hover:text-primary-600 transition-colors font-medium hover-lift">
                Services
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary-600 transition-colors font-medium hover-lift">
                Pricing
              </Link>
              <Link href="/resources-checker" className="text-gray-700 hover:text-primary-600 transition-colors font-medium hover-lift">
                Resources Checker
              </Link>
              <Link href="/domain-history-checker" className="text-gray-700 hover:text-primary-600 transition-colors font-medium hover-lift">
                Domain History
              </Link>
              <Link href="/onpage-optimization" className="text-gray-700 hover:text-primary-600 transition-colors font-medium hover-lift">
                On-Page SEO
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-primary-600 transition-colors font-medium hover-lift">
                Login
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm hover-glow">
                Sign Up
              </Link>
              <Link href="/" className="btn btn-secondary btn-sm hover-glow">
                Start Free Audit
              </Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600 focus-ring p-2 rounded-lg"
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
          <div className="md:hidden animate-slide-up">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-sm border-t border-gray-200 rounded-b-2xl shadow-lg">
              <Link
                href="/features"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                onClick={closeMobileMenu}
              >
                Features
              </Link>
              <Link
                href="/services"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                onClick={closeMobileMenu}
              >
                Services
              </Link>
              <Link
                href="/pricing"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                onClick={closeMobileMenu}
              >
                Pricing
              </Link>
              <Link
                href="/resources-checker"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                onClick={closeMobileMenu}
              >
                Resources Checker
              </Link>
              <Link
                href="/domain-history-checker"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                onClick={closeMobileMenu}
              >
                Domain History
              </Link>
              <Link
                href="/onpage-optimization"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                onClick={closeMobileMenu}
              >
                On-Page SEO
              </Link>
              
              {/* Mobile Auth Links */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <Link
                  href="/login"
                  className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-3 text-base font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl transition-all duration-200 shadow-lg text-center"
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </Link>
                <Link
                  href="/"
                  className="block px-4 py-3 text-base font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 text-center"
                  onClick={closeMobileMenu}
                >
                  Start Free Audit
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
