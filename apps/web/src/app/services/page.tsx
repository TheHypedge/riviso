'use client'

import { 
  Search, 
  Users, 
  Target, 
  Settings, 
  Award,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Globe,
  Zap,
  Shield,
  TrendingUp,
  Eye,
  Link,
  FileText,
  Clock,
  Star,
  Sparkles,
  Play,
  ArrowDown,
  IndianRupee,
  Crown
} from 'lucide-react'

export default function ServicesPage() {
  const services = [
    {
      icon: <Search className="h-12 w-12" />,
      title: "Website Audit",
      subtitle: "Comprehensive SEO Analysis",
      description: "Get a complete analysis of your website's SEO performance with detailed insights into technical issues, on-page optimization, and actionable recommendations.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      features: [
        "On-page SEO analysis with 50+ checkpoints",
        "Technical SEO audit including Core Web Vitals",
        "Mobile optimization assessment",
        "Website speed analysis and optimization tips",
        "Meta tags and structured data review",
        "Internal linking structure analysis",
        "Image optimization recommendations",
        "SSL certificate and security checks"
      ],
      benefits: [
        "Identify critical SEO issues quickly",
        "Improve search engine rankings",
        "Enhance user experience",
        "Boost website performance"
      ],
      pricing: "Starting from ₹799/month",
      popular: false
    },
    {
      icon: <Users className="h-12 w-12" />,
      title: "Competitor Analysis",
      subtitle: "Beat Your Competition",
      description: "Deep dive into your competitors' SEO strategies to identify gaps, opportunities, and market positioning insights that give you a competitive edge.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      features: [
        "Competitor keyword analysis and gap identification",
        "Backlink profile comparison",
        "Content gap analysis and opportunities",
        "Market positioning insights",
        "Competitor traffic analysis",
        "Top-performing content identification",
        "Competitive pricing analysis",
        "Social media presence comparison"
      ],
      benefits: [
        "Discover untapped keyword opportunities",
        "Understand competitor strategies",
        "Find content gaps to exploit",
        "Improve market positioning"
      ],
      pricing: "Starting from ₹1,999/month",
      popular: true
    },
    {
      icon: <Target className="h-12 w-12" />,
      title: "Top Targeting Keywords",
      subtitle: "Strategic Keyword Research",
      description: "Discover high-value keywords that can drive qualified traffic to your website with comprehensive keyword research and analysis tools.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      features: [
        "Advanced keyword research with 100M+ keywords",
        "Search volume and difficulty analysis",
        "Long-tail keyword opportunities",
        "Local keyword research for Indian markets",
        "Keyword trend analysis and forecasting",
        "Competitor keyword tracking",
        "Keyword clustering and grouping",
        "SERP analysis and ranking factors"
      ],
      benefits: [
        "Find profitable keyword opportunities",
        "Target the right audience",
        "Improve content strategy",
        "Increase organic traffic"
      ],
      pricing: "Starting from ₹1,999/month",
      popular: false
    },
    {
      icon: <Settings className="h-12 w-12" />,
      title: "On-Page SEO Optimization",
      subtitle: "Content & Structure Optimization",
      description: "Optimize your website's content and structure for better search engine visibility with our comprehensive on-page SEO tools and recommendations.",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      features: [
        "Meta tags optimization (title, description, keywords)",
        "Content optimization and readability analysis",
        "Internal linking strategy and implementation",
        "Schema markup implementation",
        "Header tag optimization (H1, H2, H3)",
        "Image alt text optimization",
        "URL structure optimization",
        "Content length and quality analysis"
      ],
      benefits: [
        "Improve search engine rankings",
        "Enhance content quality",
        "Better user experience",
        "Higher click-through rates"
      ],
      pricing: "Starting from ₹1,999/month",
      popular: false
    },
    {
      icon: <Award className="h-12 w-12" />,
      title: "Website DA & PA Analysis",
      subtitle: "Authority & Link Analysis",
      description: "Measure your website's domain authority and page authority to understand your SEO strength and track your progress over time.",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      features: [
        "Domain Authority (DA) tracking and analysis",
        "Page Authority (PA) measurement",
        "Backlink profile analysis",
        "Link quality assessment",
        "Authority growth tracking",
        "Competitor authority comparison",
        "Link building opportunities identification",
        "Toxic link detection and removal"
      ],
      benefits: [
        "Understand your website's authority",
        "Track SEO progress over time",
        "Identify link building opportunities",
        "Improve overall domain strength"
      ],
      pricing: "Starting from ₹1,999/month",
      popular: false
    }
  ]

  const additionalServices = [
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "SEO Reporting",
      description: "Comprehensive monthly SEO reports with actionable insights and progress tracking.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Local SEO",
      description: "Optimize your business for local search results and Google My Business.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Technical SEO",
      description: "Advanced technical optimization including Core Web Vitals and site speed.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "SEO Consulting",
      description: "Expert SEO consultation and strategy development for your business.",
      color: "bg-orange-100 text-orange-600"
    }
  ]

  const processSteps = [
    {
      step: "01",
      title: "Analysis",
      description: "We analyze your website and competitors to identify opportunities",
      icon: <Search className="h-6 w-6" />
    },
    {
      step: "02", 
      title: "Strategy",
      description: "Develop a customized SEO strategy based on your business goals",
      icon: <Target className="h-6 w-6" />
    },
    {
      step: "03",
      title: "Implementation",
      description: "Execute the strategy with our advanced tools and techniques",
      icon: <Settings className="h-6 w-6" />
    },
    {
      step: "04",
      title: "Monitoring",
      description: "Track progress and optimize continuously for better results",
      icon: <BarChart3 className="h-6 w-6" />
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
                <a href="/" className="flex items-center">
                  <img src="/riviso.png" alt="RIVISO" className="h-8 w-auto" />
                </a>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="/features" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Features</a>
                <a href="/services" className="text-primary-600 px-3 py-2 rounded-md text-sm font-medium font-semibold">Services</a>
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
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 lg:py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-100 rounded-full opacity-20"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-8">
              <Star className="h-4 w-4 mr-2" />
              India's #1 SEO Services
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Complete SEO
              <span className="text-primary-600 block">Services Suite</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              From website audits to competitor analysis, we provide comprehensive SEO services 
              that drive real results for your business growth.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/pricing" className="bg-primary-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center">
                View Pricing Plans
                <ArrowRight className="h-5 w-5 ml-2" />
              </a>
              <a href="/" className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-600 hover:text-white transition-colors duration-200 flex items-center justify-center">
                <Play className="h-5 w-5 mr-2" />
                Start Free Audit
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core SEO Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive SEO solutions designed to boost your website's visibility, 
              drive organic traffic, and grow your business.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div key={index} className={`relative bg-white rounded-3xl p-8 border-2 transition-all duration-300 hover:shadow-2xl ${service.borderColor} ${service.popular ? 'ring-2 ring-primary-500 ring-opacity-50' : ''}`}>
                {service.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center">
                      <Crown className="h-4 w-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${service.bgColor} text-white`}>
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-lg text-primary-600 font-semibold mb-4">{service.subtitle}</p>
                  <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>
                </div>
                
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Features:</h4>
                  <ul className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Benefits:</h4>
                  <ul className="space-y-2">
                    {service.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-primary-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Starting from</p>
                      <p className="text-2xl font-bold text-primary-600">{service.pricing}</p>
                    </div>
                    <a href="/pricing" className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                      Get Started
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our SEO Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A proven 4-step process that delivers measurable results for your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white rounded-2xl p-8 shadow-lg mb-4 group-hover:shadow-xl transition-all duration-300">
                  <div className="bg-primary-100 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-6 text-primary-600 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <div className="text-3xl font-bold text-primary-600 mb-2">{step.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Additional Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Beyond our core services, we offer specialized SEO solutions to meet your unique business needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalServices.map((service, index) => (
              <div key={index} className="group bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-primary-200">
                <div className={`rounded-xl w-16 h-16 flex items-center justify-center mb-4 ${service.color} group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your SEO?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Choose from our comprehensive SEO services and start driving more organic traffic to your website today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/pricing" className="bg-white text-primary-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center">
              View All Plans
              <ArrowRight className="h-5 w-5 ml-2" />
            </a>
            <a href="/" className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200">
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
              <div className="flex items-center mb-4">
                <img src="/riviso.png" alt="RIVISO" className="h-8 w-auto" />
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                India's leading all-in-one SEO platform. Transform your website's search performance 
                with comprehensive analytics and actionable insights.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/services" className="hover:text-white transition-colors">Website Audit</a></li>
                <li><a href="/services" className="hover:text-white transition-colors">Competitor Analysis</a></li>
                <li><a href="/services" className="hover:text-white transition-colors">Keyword Research</a></li>
                <li><a href="/services" className="hover:text-white transition-colors">On-Page SEO</a></li>
                <li><a href="/services" className="hover:text-white transition-colors">DA/PA Analysis</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
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