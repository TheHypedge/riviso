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
  MessageSquare,
  Sparkles,
  ArrowDown,
  Play
} from 'lucide-react'

export default function FeaturesPage() {
  const heroFeatures = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Get results in minutes"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "Bank-level protection"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Coverage",
      description: "195+ countries supported"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Advanced Analytics",
      description: "Deep insights & reports"
    }
  ]

  const mainFeatures = [
    {
      category: "Website Analysis",
      icon: <Search className="h-8 w-8" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
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
      category: "Competitor Intelligence",
      icon: <Users className="h-8 w-8" />,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
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
      category: "Keyword Research",
      icon: <Target className="h-8 w-8" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
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
      category: "Reporting & Analytics",
      icon: <BarChart3 className="h-8 w-8" />,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
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
      icon: <BarChart3 className="h-8 w-8" />,
      color: "bg-blue-100 text-blue-600"
    },
    {
      name: "Google Search Console",
      description: "Import search performance data directly from GSC",
      icon: <Search className="h-8 w-8" />,
      color: "bg-green-100 text-green-600"
    },
    {
      name: "Google My Business",
      description: "Optimize your local business listings and reviews",
      icon: <Globe className="h-8 w-8" />,
      color: "bg-purple-100 text-purple-600"
    },
    {
      name: "Social Media Platforms",
      description: "Track social signals and engagement metrics",
      icon: <Share2 className="h-8 w-8" />,
      color: "bg-pink-100 text-pink-600"
    }
  ]

  const stats = [
    { number: "10,000+", label: "Websites Analyzed", icon: <Search className="h-6 w-6" /> },
    { number: "50+", label: "SEO Metrics", icon: <BarChart3 className="h-6 w-6" /> },
    { number: "99.9%", label: "Uptime", icon: <Shield className="h-6 w-6" /> },
    { number: "24/7", label: "Support", icon: <Users className="h-6 w-6" /> }
  ]

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 lg:py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-100 rounded-full opacity-20"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4 mr-2" />
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

            {/* Hero Feature Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
              {heroFeatures.map((feature, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="bg-primary-100 rounded-xl w-12 h-12 flex items-center justify-center mx-auto mb-4 text-primary-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/pricing" className="bg-primary-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center">
                Get Started Today
                <ArrowRight className="h-5 w-5 ml-2" />
              </a>
              <a href="/" className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-600 hover:text-white transition-colors duration-200 flex items-center justify-center">
                <Play className="h-5 w-5 mr-2" />
                Try Free Audit
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-20 bg-white">
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
            {mainFeatures.map((category, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                  <div className="flex items-center mb-8">
                    <div className={`rounded-2xl w-16 h-16 flex items-center justify-center mr-6 ${category.bgColor} text-white`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900">{category.category}</h3>
                      <p className="text-gray-600 mt-2">Advanced tools for {category.category.toLowerCase()}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {category.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="group p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-200">
                        <div className="flex items-start">
                          <div className={`rounded-xl w-12 h-12 flex items-center justify-center mr-4 ${category.bgColor} text-white group-hover:scale-110 transition-transform duration-300`}>
                            {feature.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">{feature.name}</h4>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 bg-gray-50">
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
              <div key={index} className="group bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200">
                <div className={`rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 ${integration.color} group-hover:scale-110 transition-transform duration-300`}>
                  {integration.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {integration.name}
                </h3>
                <p className="text-gray-600 leading-relaxed">
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
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/10 rounded-2xl p-6 mb-4 group-hover:bg-white/20 transition-colors duration-300">
                  <div className="text-white mb-3 flex justify-center">
                    {stat.icon}
                  </div>
                </div>
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
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-12">
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
        </div>
      </section>

    </div>
  )
}