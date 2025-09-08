'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Search, User, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import logoImage from '@/assets/riviso.png'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const { user, logout } = useAuth()
  const pathname = usePathname()
  
  // Hide header in dashboard routes
  if (pathname?.startsWith('/dashboard')) {
    return null
  }

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
                className="mr-3"
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
              {/* <Link href="/resources-checker" className="text-gray-700 hover:text-primary-600 transition-colors font-medium hover-lift">
                Resources Checker
              </Link>
              <Link href="/domain-history-checker" className="text-gray-700 hover:text-primary-600 transition-colors font-medium hover-lift">
                Domain History
              </Link>
              <Link href="/onpage-optimization" className="text-gray-700 hover:text-primary-600 transition-colors font-medium hover-lift">
                On-Page SEO
              </Link> */}
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                 
                  <div className="relative">
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {user.firstName?.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    
                    {showUserDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <User className="h-4 w-4 mr-3" />
                            Dashboard
                          </Link>
                          <button
                            onClick={() => {
                              logout()
                              setShowUserDropdown(false)
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-primary-600 transition-colors font-medium hover-lift">
                    Login
                  </Link>
                  <Link href="/signup" className="btn btn-primary btn-sm hover-glow">
                    Sign Up
                  </Link>
                  <Link href="/" className="btn btn-secondary btn-sm hover-glow">
                    Start Free Audit
                  </Link>
                </>
              )}
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
              {/* <Link
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
               */}
              {/* Mobile Auth Links */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                {user ? (
                  <>
                    <div className="flex items-center px-4 py-3 mb-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-primary-600">
                          {user.firstName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                      onClick={closeMobileMenu}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        closeMobileMenu()
                      }}
                      className="block w-full px-4 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
