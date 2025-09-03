'use client'

import { 
  ArrowLeft,
  RefreshCw,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award
} from 'lucide-react'

export default function RefundCancellationPage() {
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
                <a href="/#features" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Features</a>
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

      {/* Header */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <a href="/" className="flex items-center text-primary-600 hover:text-primary-700 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </a>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-6">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refund & Cancellation
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Refund & Cancellation Policy
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Clear and transparent policies for refunds, cancellations, and billing.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CreditCard className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Last Updated:</strong> December 2024. This policy applies to all RIVISO subscriptions and services.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Free Trial Policy</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">14-Day Free Trial</h3>
                  <p className="text-green-700">
                    All paid plans come with a 14-day free trial. No credit card required to start. 
                    You can cancel anytime during the trial period without any charges.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Refund Policy</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 General Refund Terms</h3>
            <p className="text-gray-700 mb-4">
              RIVISO offers refunds under the following conditions:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Refund requests must be made within 7 days of the initial payment</li>
              <li>Refunds are only available for the first payment of a subscription</li>
              <li>Refunds are not available for services that have been extensively used</li>
              <li>Processing time: 5-10 business days after approval</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Refund Eligibility</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <h4 className="font-semibold text-green-800">Eligible for Refund</h4>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Service not working as advertised</li>
                  <li>• Technical issues preventing usage</li>
                  <li>• Duplicate payments</li>
                  <li>• Billing errors on our part</li>
                  <li>• Cancellation within 7 days</li>
                </ul>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  <h4 className="font-semibold text-red-800">Not Eligible for Refund</h4>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Change of mind after 7 days</li>
                  <li>• Extensive usage of services</li>
                  <li>• Violation of terms of service</li>
                  <li>• Downgrade requests</li>
                  <li>• Partial month usage</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cancellation Policy</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 How to Cancel</h3>
            <p className="text-gray-700 mb-4">
              You can cancel your subscription at any time through:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Account settings in your RIVISO dashboard</li>
              <li>Email request to support@riviso.com</li>
              <li>Contact form on our website</li>
              <li>Phone support during business hours</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Cancellation Timeline</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-semibold text-yellow-800 mb-2">Important Notice</h4>
                  <p className="text-yellow-700 mb-2">
                    Cancellations take effect at the end of your current billing period. You will continue to have access to all features until the end of your paid period.
                  </p>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Monthly plans: Access until end of current month</li>
                    <li>• Annual plans: Access until end of current year</li>
                    <li>• No prorated refunds for partial periods</li>
                  </ul>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Billing and Payment</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Payment Methods</h3>
            <p className="text-gray-700 mb-4">
              We accept the following payment methods:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Credit and Debit Cards (Visa, MasterCard, American Express)</li>
              <li>UPI payments (Google Pay, PhonePe, Paytm)</li>
              <li>Net Banking (All major Indian banks)</li>
              <li>Digital Wallets (Paytm, Mobikwik)</li>
              <li>Bank transfers (for enterprise customers)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Billing Cycle</h3>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Monthly plans: Billed every 30 days from signup date</li>
              <li>Annual plans: Billed once per year with 20% discount</li>
              <li>All prices are in Indian Rupees (INR)</li>
              <li>Taxes are included in the displayed price</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Downgrade Policy</h2>
            <p className="text-gray-700 mb-4">
              You can downgrade your plan at any time:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Downgrades take effect at the next billing cycle</li>
              <li>No refunds for the difference in pricing</li>
              <li>Access to higher-tier features ends at the next billing date</li>
              <li>Data and reports remain accessible according to your new plan limits</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention After Cancellation</h2>
            <p className="text-gray-700 mb-4">
              After cancellation, your data will be handled as follows:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Account data: Deleted after 30 days</li>
              <li>Analysis reports: Available for download for 30 days</li>
              <li>Historical data: Permanently deleted after 30 days</li>
              <li>You can request immediate data deletion by contacting support</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Dispute Resolution</h2>
            <p className="text-gray-700 mb-4">
              If you have any disputes regarding billing or refunds:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Contact our support team first: support@riviso.com</li>
              <li>Provide detailed information about your concern</li>
              <li>We will respond within 24-48 hours</li>
              <li>If unresolved, disputes can be escalated to our management team</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Special Circumstances</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">8.1 Force Majeure</h3>
            <p className="text-gray-700 mb-6">
              In case of service disruptions due to circumstances beyond our control (natural disasters, government actions, etc.), we will work with affected customers on a case-by-case basis for appropriate solutions.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">8.2 Service Termination</h3>
            <p className="text-gray-700 mb-6">
              If we need to discontinue a service, we will provide 30 days notice and offer alternative solutions or prorated refunds where applicable.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              For refund and cancellation requests, contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <ul className="space-y-2 text-gray-700">
                <li><strong>Email:</strong> support@riviso.com</li>
                <li><strong>Billing Support:</strong> billing@riviso.com</li>
                <li><strong>Phone:</strong> +91-XXXX-XXXX-XX (Mon-Fri, 9 AM - 6 PM IST)</li>
                <li><strong>Response Time:</strong> Within 24-48 hours</li>
              </ul>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Award className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    <strong>Customer Satisfaction:</strong> We're committed to fair and transparent policies. If you have any questions or concerns, please don't hesitate to contact our support team.
                  </p>
                </div>
              </div>
            </div>

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
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/terms-conditions" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/refund-cancellation" className="hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/services" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
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
