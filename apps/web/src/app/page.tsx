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

export default function HomePage() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const validateUrl = (inputUrl: string): boolean => {
    try {
      const urlObj = new URL(inputUrl)
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

    if (!validateUrl(url)) {
      setError('Please enter a valid URL (including http:// or https://)')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/audit/audits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
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
      router.push(`/a/${audit.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
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
                <a href="/features" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Features</a>
                <a href="/services" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Services</a>
                <a href="/pricing" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Pricing</a>
                <button className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700">
                  Start Free Audit
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4 mr-2" />
              India's #1 All-in-One SEO Platform
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Transform Your Website's
              <span className="text-primary-600 block">SEO Performance</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Get comprehensive SEO insights, competitor analysis, and actionable recommendations 
              to dominate search rankings and drive organic traffic growth.
            </p>

            {/* Audit Form */}
            <div className="max-w-2xl mx-auto mb-16">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="mb-6">
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-3">
                    Enter your website URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 text-error-600 bg-error-50 p-4 rounded-lg mb-6">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-8 rounded-xl text-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing Your Website...
                    </>
                  ) : (
                    <>
                      Start Free SEO Audit
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-success-500 mr-2" />
                <span className="text-sm">100% Free Analysis</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-primary-500 mr-2" />
                <span className="text-sm">Results in 2 Minutes</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-info-500 mr-2" />
                <span className="text-sm">Secure & Private</span>
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