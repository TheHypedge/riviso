import Link from 'next/link';
import { ArrowLeft, FileText, Shield, Users, Scale } from 'lucide-react';

export default function TermsOfServicePage() {
  const lastUpdated = 'January 31, 2026';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm bg-white/90">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg shadow-purple-500/30">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Terms of Service</h1>
          <p className="text-slate-600">Last updated: {lastUpdated}</p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-8 sm:p-12 space-y-8">
            {/* Introduction */}
            <section>
              <div className="prose prose-slate max-w-none">
                <p className="text-lg text-slate-600 leading-relaxed">
                  Welcome to Riviso. By accessing or using our AI-driven Growth Intelligence Platform, you agree to be bound by these Terms of Service. Please read them carefully.
                </p>
              </div>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
                  <div className="prose prose-slate max-w-none text-slate-600">
                    <p>
                      By creating an account or using Riviso's services, you agree to these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
                    </p>
                    <p>
                      We reserve the right to modify these terms at any time. We will notify you of any material changes via email or through our platform. Your continued use of Riviso after such modifications constitutes acceptance of the updated terms.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* User Accounts */}
            <section>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">2. User Accounts</h2>
                  <div className="prose prose-slate max-w-none text-slate-600">
                    <p>
                      <strong>Account Creation:</strong> You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.
                    </p>
                    <p>
                      <strong>Account Security:</strong> You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized access or security breaches.
                    </p>
                    <p>
                      <strong>Age Requirement:</strong> You must be at least 18 years old to use our services.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Service Usage */}
            <section>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">3. Acceptable Use</h2>
                  <div className="prose prose-slate max-w-none text-slate-600">
                    <p>You agree not to:</p>
                    <ul className="space-y-2">
                      <li>Use our services for any illegal or unauthorized purpose</li>
                      <li>Violate any laws in your jurisdiction</li>
                      <li>Infringe upon the rights of others</li>
                      <li>Transmit any viruses, malware, or harmful code</li>
                      <li>Attempt to gain unauthorized access to our systems</li>
                      <li>Interfere with or disrupt the integrity or performance of our services</li>
                      <li>Create multiple accounts to abuse our free trial or promotional offers</li>
                      <li>Scrape, spider, or crawl our services without permission</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">4. Intellectual Property</h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>
                  All content, features, and functionality of Riviso, including but not limited to text, graphics, logos, icons, images, audio clips, and software, are the exclusive property of Riviso or its licensors and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
                <p>
                  You retain ownership of any data you input into our services. By using our services, you grant us a license to use, store, and process your data solely for the purpose of providing our services to you.
                </p>
              </div>
            </section>

            {/* Subscription and Billing */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">5. Subscription and Billing</h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>
                  <strong>Subscription Plans:</strong> Riviso offers various subscription plans with different features and pricing. Details of each plan are available on our pricing page.
                </p>
                <p>
                  <strong>Billing:</strong> Subscription fees are billed in advance on a recurring basis (monthly or annually). You authorize us to charge your payment method for all applicable fees.
                </p>
                <p>
                  <strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellations take effect at the end of the current billing period. No refunds are provided for partial months or unused features.
                </p>
                <p>
                  <strong>Price Changes:</strong> We reserve the right to change our pricing with 30 days' notice. Price changes will not affect your current billing cycle.
                </p>
              </div>
            </section>

            {/* Data and Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">6. Data and Privacy</h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>
                  Your privacy is important to us. Our collection and use of your personal information is governed by our{' '}
                  <Link href="/legal/privacy" className="text-purple-600 hover:text-purple-700 underline">
                    Privacy Policy
                  </Link>
                  , which is incorporated into these Terms by reference.
                </p>
                <p>
                  We use industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            {/* Disclaimer of Warranties */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">7. Disclaimer of Warranties</h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  Our services are provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not warrant that our services will be uninterrupted, error-free, or completely secure.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">8. Limitation of Liability</h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>
                  To the maximum extent permitted by law, Riviso shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
                </p>
              </div>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">9. Termination</h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>
                  We reserve the right to suspend or terminate your account and access to our services at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
                </p>
                <p>
                  Upon termination, your right to use our services will immediately cease. We may delete your account and all related data.
                </p>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">10. Governing Law</h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Contact Us</h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <p className="font-medium">
                  Email: legal@riviso.com<br />
                  Address: [Your Company Address]
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm">
          <Link href="/legal/privacy" className="text-slate-600 hover:text-slate-900 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-slate-400">•</span>
          <Link href="/auth/login" className="text-slate-600 hover:text-slate-900 transition-colors">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
