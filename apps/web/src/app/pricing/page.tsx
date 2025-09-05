'use client'

import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  BarChart3, 
  Target, 
  Globe, 
  Award,
  TrendingUp,
  Clock,
  ArrowRight,
  Crown,
  Sparkles,
  CheckCircle,
  ArrowDown,
  IndianRupee
} from 'lucide-react'
import { useState } from 'react'

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true)

  const pricingTiers = [
    {
      name: "Starter",
      subtitle: "Perfect for small businesses",
      price: { monthly: 999, annual: 799 },
      originalPrice: { monthly: 1499, annual: 1199 },
      description: "Get started with essential SEO tools and basic analytics to improve your website's search performance.",
      icon: <Zap className="h-8 w-8" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      popular: false,
      features: [
        "Up to 5 website audits per month",
        "Basic SEO analysis & recommendations",
        "Top 10 keyword suggestions",
        "On-page optimization tips",
        "Mobile-friendly audit",
        "Basic competitor analysis",
        "Email support",
        "PDF reports"
      ],
      limitations: [
        "Limited historical data",
        "Basic analytics dashboard",
        "Standard support response time"
      ],
      cta: "Start Free Trial",
      ctaColor: "bg-blue-600 hover:bg-blue-700"
    },
    {
      name: "Professional",
      subtitle: "Most popular for growing businesses",
      price: { monthly: 2499, annual: 1999 },
      originalPrice: { monthly: 3499, annual: 2799 },
      description: "Advanced SEO tools with comprehensive analytics, competitor tracking, and priority support for serious businesses.",
      icon: <Crown className="h-8 w-8" />,
      color: "from-primary-500 to-primary-600",
      bgColor: "bg-primary-50",
      borderColor: "border-primary-200",
      popular: true,
      features: [
        "Unlimited website audits",
        "Advanced SEO analysis & recommendations",
        "Top 50 keyword suggestions with difficulty scores",
        "Comprehensive on-page optimization",
        "Technical SEO audit",
        "Advanced competitor analysis",
        "Backlink analysis & monitoring",
        "DA/PA tracking",
        "Priority email & chat support",
        "Custom PDF reports",
        "Historical data (6 months)",
        "Advanced analytics dashboard",
        "API access",
        "White-label reports"
      ],
      limitations: [
        "Limited API calls per month",
        "Standard integration support"
      ],
      cta: "Start Free Trial",
      ctaColor: "bg-primary-600 hover:bg-primary-700"
    },
    {
      name: "Enterprise",
      subtitle: "For large organizations & agencies",
      price: { monthly: 4999, annual: 3999 },
      originalPrice: { monthly: 6999, annual: 5599 },
      description: "Complete SEO solution with unlimited access, custom integrations, and dedicated support for enterprise needs.",
      icon: <Award className="h-8 w-8" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      popular: false,
      features: [
        "Everything in Professional",
        "Unlimited API calls",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 priority support",
        "Custom reporting & dashboards",
        "Advanced competitor intelligence",
        "Bulk website analysis",
        "Custom keyword research",
        "Historical data (unlimited)",
        "Team collaboration tools",
        "SSO integration",
        "Custom training sessions",
        "SLA guarantee",
        "White-label solution"
      ],
      limitations: [],
      cta: "Contact Sales",
      ctaColor: "bg-purple-600 hover:bg-purple-700"
    }
  ]

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "Bank-level security with 256-bit SSL encryption and GDPR compliance"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Coverage",
      description: "Analyze websites from 195+ countries with localized SEO insights"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Real-time Updates",
      description: "Get instant notifications when your SEO metrics change"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description: "Share reports and collaborate with your team seamlessly"
    }
  ]

  const testimonials = [
    {
      name: "Rajesh Kumar",
      company: "TechStart India",
      role: "Founder & CEO",
      content: "RIVISO helped us increase our organic traffic by 300% in just 6 months. The competitor analysis feature is game-changing!",
      rating: 5,
      avatar: "RK"
    },
    {
      name: "Priya Sharma",
      company: "Digital Marketing Pro",
      role: "SEO Manager",
      content: "As an agency, we need reliable SEO tools. RIVISO's white-label reports and API integration saved us hours of work.",
      rating: 5,
      avatar: "PS"
    },
    {
      name: "Amit Patel",
      company: "E-commerce Solutions",
      role: "Marketing Director",
      content: "The keyword research and DA/PA tracking features are incredibly accurate. Best SEO tool for Indian businesses!",
      rating: 5,
      avatar: "AP"
    }
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
              <Crown className="h-4 w-4 mr-2" />
              India's #1 SEO Platform
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Choose Your
              <span className="text-primary-600 block">Growth Plan</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Scale your SEO success with our comprehensive plans designed for businesses of all sizes. 
              Start free, upgrade anytime.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-16">
              <span className={`text-lg font-medium ${!isAnnual ? 'text-primary-600' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`mx-4 relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  isAnnual ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-lg font-medium ${isAnnual ? 'text-primary-600' : 'text-gray-500'}`}>
                Annual
              </span>
              {isAnnual && (
                <div className="ml-3 inline-flex items-center px-3 py-1 rounded-full bg-success-100 text-success-800 text-sm font-medium">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  Save 20%
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                className={`relative rounded-3xl p-8 border-2 transition-all duration-300 hover:shadow-2xl ${
                  tier.popular
                    ? 'border-primary-300 shadow-xl scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${tier.bgColor} text-white`}>
                    {tier.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-gray-600 mb-6">{tier.subtitle}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-gray-900">
                        <IndianRupee className="inline h-8 w-8" />
                        {isAnnual ? tier.price.annual : tier.price.monthly}
                      </span>
                      <span className="text-gray-500 ml-2">/month</span>
                    </div>
                    {isAnnual && (
                      <div className="text-sm text-gray-500 mt-1">
                        Billed annually (₹{(isAnnual ? tier.price.annual : tier.price.monthly) * 12}/year)
                      </div>
                    )}
                    <div className="flex items-center justify-center mt-2">
                      <span className="text-lg text-gray-400 line-through mr-2">
                        ₹{isAnnual ? tier.originalPrice.annual : tier.originalPrice.monthly}
                      </span>
                      <span className="text-sm text-success-600 font-medium">
                        {Math.round((1 - (isAnnual ? tier.price.annual : tier.price.monthly) / (isAnnual ? tier.originalPrice.annual : tier.originalPrice.monthly)) * 100)}% off
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-8">{tier.description}</p>
                </div>

                <div className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-success-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {tier.limitations.length > 0 && (
                  <div className="space-y-2 mb-8">
                    {tier.limitations.map((limitation, limitIndex) => (
                      <div key={limitIndex} className="flex items-start">
                        <X className="h-4 w-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-500 text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  className={`w-full py-4 px-6 rounded-xl text-lg font-semibold text-white transition-all duration-200 ${tier.ctaColor} flex items-center justify-center`}
                >
                  {tier.cta}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose RIVISO?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built for Indian businesses with global standards and local expertise.
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

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by 10,000+ Indian Businesses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our customers say about their success with RIVISO.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                    <span className="text-primary-600 font-semibold text-sm">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-primary-600">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about RIVISO pricing and features.
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                question: "Can I change my plan anytime?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
              },
              {
                question: "Is there a free trial?",
                answer: "Absolutely! All plans come with a 14-day free trial. No credit card required to get started."
              },
              {
                question: "Do you offer custom enterprise solutions?",
                answer: "Yes! For large organizations with specific needs, we offer custom enterprise solutions with dedicated support and custom integrations."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, UPI, net banking, and digital wallets. All payments are processed securely through Razorpay."
              },
              {
                question: "Is my data secure?",
                answer: "Your data security is our top priority. We use enterprise-grade encryption, comply with GDPR, and never share your data with third parties."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
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
            Join thousands of Indian businesses using RIVISO to improve their SEO performance 
            and drive organic traffic growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center">
              Start Free Trial
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
