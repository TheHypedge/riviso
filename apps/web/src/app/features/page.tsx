'use client'

import { 
  Zap, 
  Shield, 
  BarChart3, 
  Globe,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
  Target,
  Award,
  Eye,
  Search,
  Settings,
  FileText,
  Link,
  Smartphone,
  Monitor,
  Database,
  Lock,
  RefreshCw,
  Download,
  Share2,
  Bell,
  MessageSquare
} from 'lucide-react'

export default function FeaturesPage() {
  const coreFeatures = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast Analysis",
      description: "Get comprehensive SEO insights in minutes, not hours. Our optimized engine analyzes your website at lightning speed.",
      details: [
        "Real-time website crawling",
        "Instant SEO scoring",
        "Quick performance metrics",
        "Fast report generation"
      ]
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise-Grade Security",
      description: "Your data is protected with bank-level security measures and GDPR compliance for complete peace of mind.",
      details: [
        "256-bit SSL encryption",
        "GDPR compliant data handling",
        "Secure data centers",
        "Regular security audits"
      ]
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Advanced Analytics",
      description: "Deep insights with actionable recommendations for growth. Track your progress with detailed analytics.",
      details: [
        "Comprehensive SEO metrics",
        "Historical data tracking",
        "Custom dashboard views",
        "Exportable reports"
      ]
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Coverage",
      description: "Analyze websites from any country with localized insights and region-specific SEO recommendations.",
      details: [
        "195+ country support",
        "Local SEO insights",
        "Regional keyword data",
        "Multi-language support"
      ]
    }
  ]

  const featureCategories = [
    {
      title: "Website Analysis",
      icon: <Search className="h-6 w-6" />,
      features: [
        {
          name: "Comprehensive SEO Audit",
          description: "50+ SEO checkpoints covering technical, on-page, and content optimization",
          icon: <CheckCircle className="h-5 w-5" />
        },
        {
          name: "Core Web Vitals Analysis",
          description: "Measure and optimize your website's loading performance and user experience",
          icon: <Clock className="h-5 w-5" />
        },
        {
          name: "Mobile Optimization Check",
          description: "Ensure your website is fully optimized for mobile devices and search engines",
          icon: <Smartphone className="h-5 w-5" />
        },
        {
          name: "Technical SEO Audit",
          description: "Identify and fix technical issues that impact your search rankings",
          icon: <Settings className="h-5 w-5" />
        }
      ]
    },
    {
      title: "Competitor Intelligence",
      icon: <Users className="h-6 w-6" />,
      features: [
        {
          name: "Competitor Keyword Analysis",
          description: "Discover what keywords your competitors are ranking for",
          icon: <Target className="h-5 w-5" />
        },
        {
          name: "Backlink Profile Comparison",
          description: "Compare your backlink profile with competitors to find opportunities",
          icon: <Link className="h-5 w-5" />
        },
        {
          name: "Content Gap Analysis",
          description: "Identify content opportunities your competitors are missing",
          icon: <FileText className="h-5 w-5" />
        },
        {
          name: "Market Positioning Insights",
          description: "Understand your competitive landscape and market position",
          icon: <TrendingUp className="h-5 w-5" />
        }
      ]
    },
    {
      title: "Keyword Research",
      icon: <Target className="h-6 w-6" />,
      features: [
        {
          name: "Advanced Keyword Discovery",
          description: "Find high-value keywords with our 100M+ keyword database",
          icon: <Search className="h-5 w-5" />
        },
        {
          name: "Search Volume & Difficulty",
          description: "Get accurate search volume and competition difficulty scores",
          icon: <BarChart3 className="h-5 w-5" />
        },
        {
          name: "Long-tail Opportunities",
          description: "Discover profitable long-tail keywords with lower competition",
          icon: <TrendingUp className="h-5 w-5" />
        },
        {
          name: "Local Keyword Research",
          description: "Find location-specific keywords for Indian markets",
          icon: <Globe className="h-5 w-5" />
        }
      ]
    },
    {
      title: "Reporting & Analytics",
      icon: <BarChart3 className="h-6 w-6" />,
      features: [
        {
          name: "Custom Dashboards",
          description: "Create personalized dashboards with the metrics that matter to you",
          icon: <Monitor className="h-5 w-5" />
        },
        {
          name: "Automated Reports",
          description: "Schedule and receive regular SEO reports via email",
          icon: <Bell className="h-5 w-5" />
        },
        {
          name: "White-label Reports",
          description: "Brand reports with your company logo and colors",
          icon: <Award className="h-5 w-5" />
        },
        {
          name: "Data Export",
          description: "Export your data in multiple formats (PDF, CSV, Excel)",
          icon: <Download className="h-5 w-5" />
        }
      ]
    }
  ]

  const integrations = [
    {
      name: "Google Analytics",
      description: "Connect your Google Analytics data for comprehensive insights",
      icon: <BarChart3 className="h-6 w-6" />
    },
    {
      name: "Google Search Console",
      description: "Import search performance data directly from GSC",
      icon: <Search className="h-6 w-6" />
    },
    {
      name: "Google My Business",
      description: "Optimize your local business listings and reviews",
      icon: <Globe className="h-6 w-6" />
    },
    {
      name: "Social Media Platforms",
      description: "Track social signals and engagement metrics",
      icon: <Share2 className="h-6 w-6" />
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <a href="/" className="text-2xl font-bold text-primary-600">RIVISO</a>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="/features" className="text-primary-600 px-3 py-2 rounded-md text-sm font-medium font-semibold">Features</a>
                <a href="/services" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Services</a>
                <a href="/pricing" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Pricing</a>
                <a href="/" className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700">
                  Start Free Audit
                </a>
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
              <Star className="h-4 w-4 mr-2" />
              India's #1 SEO Platform Features
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Powerful Features for
              <span className="text-primary-600 block">SEO Success</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Discover the comprehensive suite of SEO tools and features that make RIVISO 
              the preferred choice for businesses across India.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/pricing" className="bg-primary-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center">
                Get Started Today
                <ArrowRight className="h-5 w-5 ml-2" />
              </a>
              <a href="/" className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-600 hover:text-white transition-colors duration-200">
                Try Free Audit
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 bg-white">
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
            {coreFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-4 border border-gray-200 hover:shadow-xl transition-all duration-300">
                  <div className="bg-primary-100 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2 text-left">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center text-xs text-gray-600">
                        <CheckCircle className="h-3 w-3 text-success-500 mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Feature Set
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to dominate search rankings and drive organic growth.
            </p>
          </div>

          <div className="space-y-16">
            {featureCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="flex items-center mb-8">
                  <div className="bg-primary-100 rounded-xl w-12 h-12 flex items-center justify-center mr-4 text-primary-600">
                    {category.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{category.title}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start p-4 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="bg-primary-100 rounded-lg w-10 h-10 flex items-center justify-center mr-4 text-primary-600 flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.name}</h4>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Seamless Integrations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with your favorite tools and platforms for a unified SEO experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-gray-100 transition-colors">
                <div className="bg-white rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary-600 shadow-sm">
                  {integration.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {integration.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {integration.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Join the growing community of businesses using RIVISO to achieve SEO success.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "10,000+", label: "Websites Analyzed" },
              { number: "50+", label: "SEO Metrics" },
              { number: "99.9%", label: "Uptime" },
              { number: "24/7", label: "Support" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-100 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start your free trial today and discover why thousands of businesses choose RIVISO for their SEO needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/pricing" className="bg-primary-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center">
              View Pricing Plans
              <ArrowRight className="h-5 w-5 ml-2" />
            </a>
            <a href="/" className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-600 hover:text-white transition-colors duration-200">
              Start Free Audit
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
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/features" className="hover:text-white transition-colors">Website Analysis</a></li>
                <li><a href="/features" className="hover:text-white transition-colors">Competitor Intelligence</a></li>
                <li><a href="/features" className="hover:text-white transition-colors">Keyword Research</a></li>
                <li><a href="/features" className="hover:text-white transition-colors">Reporting & Analytics</a></li>
                <li><a href="/features" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
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
