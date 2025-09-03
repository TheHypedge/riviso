'use client'

import { useState } from 'react'
import { 
  Search, 
  Loader2, 
  AlertCircle, 
  BarChart3, 
  Target, 
  Zap, 
  TrendingUp, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  Star,
  Users,
  Globe,
  Award,
  Clock,
  Sparkles,
  Eye,
  Search as SearchIcon,
  BarChart,
  FileText,
  Settings,
  Link
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function HomePage() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()

  const normalizeUrl = (inputUrl: string): string => {
    let url = inputUrl.trim()
    
    // If it doesn't start with http:// or https://, add https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    
    return url
  }

  const validateUrl = (inputUrl: string): boolean => {
    try {
      const normalizedUrl = normalizeUrl(inputUrl)
      const urlObj = new URL(normalizedUrl)
      return ['http:', 'https:'].includes(urlObj.protocol)
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    const normalizedUrl = normalizeUrl(url)
    
    if (!validateUrl(url)) {
      setError('Please enter a valid domain (e.g., example.com)')
      return
    }

    setIsLoading(true)
    setLoadingProgress(0)
    
    // More realistic progress updates
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 85) return prev
        return prev + Math.random() * 12
      })
    }, 300)

    try {
      // Simulate realistic loading time (2-3 seconds for demo)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const response = await fetch('/api/audit/audits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: normalizedUrl,
          options: {
            include_sitemap: true,
            max_sitemap_urls: 5,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to start audit')
      }

      const audit = await response.json()
      setLoadingProgress(100)
      
      // Small delay before redirect
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push(`/a/${audit.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      clearInterval(progressInterval)
      setIsLoading(false)
      setLoadingProgress(0)
    }
  }

  const services = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Website Audit",
      description: "Comprehensive analysis of your website's SEO performance, technical issues, and optimization opportunities.",
      features: ["On-page SEO analysis", "Technical SEO audit", "Performance metrics", "Mobile optimization"]
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Competitor Analysis",
      description: "Deep dive into your competitors' strategies to identify gaps and opportunities in your market.",
      features: ["Competitor keyword analysis", "Backlink comparison", "Content gap analysis", "Market positioning"]
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Top Targeting Keywords",
      description: "Discover high-value keywords that can drive qualified traffic to your website.",
      features: ["Keyword research", "Search volume analysis", "Difficulty assessment", "Long-tail opportunities"]
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: "On-Page SEO Optimization",
      description: "Optimize your website's content and structure for better search engine visibility.",
      features: ["Meta tag optimization", "Content optimization", "Internal linking", "Schema markup"]
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Website DA & PA Analysis",
      description: "Measure your website's domain authority and page authority to understand your SEO strength.",
      features: ["Domain Authority tracking", "Page Authority analysis", "Link profile assessment", "Authority growth"]
    }
  ]

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast Analysis",
      description: "Get comprehensive SEO insights in minutes, not hours."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise-Grade Security",
      description: "Your data is protected with bank-level security measures."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Advanced Analytics",
      description: "Deep insights with actionable recommendations for growth."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Coverage",
      description: "Analyze websites from any country with localized insights."
    }
  ]

  const stats = [
    { number: "10,000+", label: "Websites Analyzed" },
    { number: "50+", label: "SEO Metrics Tracked" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "24/7", label: "Support Available" }
  ]

  // Show loading screen while fetching data
  if (isLoading) {
    return <LoadingScreen url={url} progress={loadingProgress} />
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <a href="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors">RIVISO</a>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/features" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Features</Link>
                <Link href="/services" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Services</Link>
                <Link href="/pricing" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Pricing</Link>
                
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                      Dashboard
                    </Link>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {user?.firstName?.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-700">{user?.firstName}</span>
                    </div>
                    <button
                      onClick={logout}
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link href="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                      Sign In
                    </Link>
                    <Link href="/signup" className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 lg:py-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-accent-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-8 animate-fade-in-up">
              <Sparkles className="h-4 w-4 mr-2" />
              India's #1 All-in-One SEO Platform
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fade-in-up animation-delay-200">
              Transform Your Website's
              <span className="text-primary-600 block bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                SEO Performance
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up animation-delay-400">
              Get comprehensive SEO insights, competitor analysis, and actionable recommendations 
              to dominate search rankings and drive organic traffic growth.
            </p>

            {/* Minimal Search Form */}
            <div className="max-w-xl mx-auto mb-16 animate-fade-in-up animation-delay-600">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-white/20">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Enter your domain (e.g., example.com)"
                      className="w-full pl-12 pr-4 py-4 border-0 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 text-lg placeholder-gray-400"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !url}
                    className="bg-gradient-to-r from-primary-600 to-secondary-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-primary-700 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Start Audit
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Animated Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in-up animation-delay-800">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/80 transition-all duration-300">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-success-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">100% Free</div>
                <div className="text-sm text-gray-600">Complete Analysis</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/80 transition-all duration-300">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">2 Minutes</div>
                <div className="text-sm text-gray-600">Quick Results</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/80 transition-all duration-300">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-info-100 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-info-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">Secure</div>
                <div className="text-sm text-gray-600">Private & Safe</div>
              </div>
            </div>

            {/* Animated SEO Chart */}
            <div className="mt-16 animate-fade-in-up animation-delay-1000">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">SEO Performance Overview</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-gray-200"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray="251.2"
                          strokeDashoffset="75.36"
                          className="text-success-500 animate-draw-circle"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">70%</span>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700">Technical SEO</div>
                  </div>
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-gray-200"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray="251.2"
                          strokeDashoffset="50.24"
                          className="text-primary-500 animate-draw-circle animation-delay-1000"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">80%</span>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700">On-Page SEO</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete SEO Solutions for Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From technical audits to competitor analysis, we provide everything you need 
              to dominate search rankings and drive organic growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-primary-200">
                <div className="bg-primary-100 rounded-xl w-16 h-16 flex items-center justify-center mb-6 text-primary-600">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-success-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose RIVISO?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built for modern businesses that demand excellence in SEO performance and results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
                  <div className="bg-primary-100 rounded-xl w-12 h-12 flex items-center justify-center mx-auto mb-4 text-primary-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Dominate Search Rankings?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using RIVISO to improve their SEO performance 
            and drive organic traffic growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => (document.querySelector('input[type="url"]') as HTMLInputElement)?.focus()}
              className="bg-white text-primary-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
            >
              Start Free Audit
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
            <a href="/pricing" className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200 inline-block text-center">
              View Pricing
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">RIVISO</h3>
              <p className="text-gray-400 mb-6 max-w-md">
                India's leading all-in-one SEO platform. Transform your website's search performance 
                with comprehensive analytics and actionable insights.
              </p>
              <div className="flex space-x-4">
                <div className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors">
                  <Users className="h-5 w-5" />
                </div>
                <div className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors">
                  <Award className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Website Audit</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Competitor Analysis</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Keyword Research</a></li>
                <li><a href="#" className="hover:text-white transition-colors">On-Page SEO</a></li>
                <li><a href="#" className="hover:text-white transition-colors">DA/PA Analysis</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/services" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms-conditions" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/refund-cancellation" className="hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RIVISO. All rights reserved. Made with ❤️ in India.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}