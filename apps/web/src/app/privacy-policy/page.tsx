'use client'

import { 
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  Database,
  Globe,
  Users,
  Award
} from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">

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
              <Shield className="h-4 w-4 mr-2" />
              Privacy & Security
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your privacy is our priority. Learn how we collect, use, and protect your information.
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
                  <Lock className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Last Updated:</strong> December 2024. This policy is effective immediately and applies to all users of RIVISO services.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-6">
              RIVISO ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our SEO analysis and optimization services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Personal Information</h3>
            <p className="text-gray-700 mb-4">
              We may collect personal information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Name and contact information (email address, phone number)</li>
              <li>Account credentials and profile information</li>
              <li>Payment and billing information</li>
              <li>Communication preferences</li>
              <li>Website URLs and domain information for analysis</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Usage Information</h3>
            <p className="text-gray-700 mb-4">
              We automatically collect certain information about your use of our services:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent on our platform</li>
              <li>Search queries and analysis requests</li>
              <li>Error logs and performance data</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Website Analysis Data</h3>
            <p className="text-gray-700 mb-6">
              When you request an SEO analysis, we collect publicly available information about the websites you analyze, including content, structure, and performance metrics.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Provide and improve our SEO analysis services</li>
              <li>Process payments and manage your account</li>
              <li>Send you service-related communications</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Analyze usage patterns to improve our platform</li>
              <li>Comply with legal obligations and enforce our terms</li>
              <li>Protect against fraud and security threats</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li><strong>Service Providers:</strong> With trusted third-party vendors who assist in operating our platform</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Consent:</strong> When you have given explicit consent to share your information</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>256-bit SSL encryption for data transmission</li>
              <li>Secure data centers with physical and digital security</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication protocols</li>
              <li>Data backup and disaster recovery procedures</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-700 mb-6">
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Analysis data is typically retained for 24 months unless you request earlier deletion.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights and Choices</h2>
            <p className="text-gray-700 mb-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Objection:</strong> Object to certain processing of your information</li>
              <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar technologies to enhance your experience:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Marketing Cookies:</strong> Used for targeted advertising (with consent)</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-700 mb-6">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700 mb-6">
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Third-Party Services</h2>
            <p className="text-gray-700 mb-6">
              Our platform may contain links to third-party websites or services. This Privacy Policy does not apply to those third-party services. We encourage you to review the privacy policies of any third-party services you use.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Policy</h2>
            <p className="text-gray-700 mb-6">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <ul className="space-y-2 text-gray-700">
                <li><strong>Email:</strong> privacy@riviso.com</li>
                <li><strong>Data Protection Officer:</strong> dpo@riviso.com</li>
                <li><strong>Address:</strong> RIVISO Technologies, India</li>
                <li><strong>Phone:</strong> +91-XXXX-XXXX-XX</li>
              </ul>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Award className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    <strong>Your Privacy Matters:</strong> We are committed to protecting your privacy and being transparent about our data practices. If you have any concerns, please don't hesitate to contact us.
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
              <div className="flex items-center space-x-2 mb-4">
                <img src="/riviso.png" alt="RIVISO" className="h-8 w-auto" />
                <span className="text-2xl font-bold text-white">RIVISO</span>
              </div>
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
