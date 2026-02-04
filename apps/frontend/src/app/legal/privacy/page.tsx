import Link from 'next/link';
import { ArrowLeft, Shield, Database, Eye, Lock, UserCheck, Globe } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4 shadow-lg shadow-blue-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Privacy Policy</h1>
          <p className="text-slate-600">Last updated: {lastUpdated}</p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-8 sm:p-12 space-y-8">
            {/* Introduction */}
            <section>
              <div className="prose prose-slate max-w-none">
                <p className="text-lg text-slate-600 leading-relaxed">
                  At Riviso, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-driven Growth Intelligence Platform.
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Database className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">1. Information We Collect</h2>
                  <div className="prose prose-slate max-w-none text-slate-600">
                    <p>
                      <strong>Personal Information:</strong> When you create an account, we collect information such as your name, email address, and password. If you subscribe to a paid plan, we also collect billing information.
                    </p>
                    <p>
                      <strong>Usage Data:</strong> We automatically collect information about how you interact with our services, including:
                    </p>
                    <ul className="space-y-2">
                      <li>IP address and device information</li>
                      <li>Browser type and version</li>
                      <li>Pages visited and features used</li>
                      <li>Time and date of visits</li>
                      <li>Referring website addresses</li>
                    </ul>
                    <p>
                      <strong>Website Data:</strong> When you connect your websites or Google Search Console accounts, we collect and analyze data related to your website's performance, SEO metrics, and analytics.
                    </p>
                    <p>
                      <strong>Cookies and Tracking:</strong> We use cookies and similar tracking technologies to enhance your experience and analyze usage patterns.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">2. How We Use Your Information</h2>
                  <div className="prose prose-slate max-w-none text-slate-600">
                    <p>We use your information to:</p>
                    <ul className="space-y-2">
                      <li>Provide, maintain, and improve our services</li>
                      <li>Process your transactions and manage your subscriptions</li>
                      <li>Send you technical notices, updates, and support messages</li>
                      <li>Respond to your comments, questions, and requests</li>
                      <li>Analyze usage trends and optimize user experience</li>
                      <li>Detect, prevent, and address technical issues or fraudulent activity</li>
                      <li>Comply with legal obligations</li>
                      <li>Send you marketing communications (with your consent)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">3. Data Security</h2>
                  <div className="prose prose-slate max-w-none text-slate-600">
                    <p>
                      We implement industry-standard security measures to protect your personal information:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Encryption</h4>
                        <p className="text-sm text-green-800">256-bit SSL/TLS encryption for data in transit</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Secure Storage</h4>
                        <p className="text-sm text-green-800">Encrypted databases and secure cloud infrastructure</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Access Controls</h4>
                        <p className="text-sm text-green-800">Strict authentication and authorization protocols</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Regular Audits</h4>
                        <p className="text-sm text-green-800">Periodic security assessments and updates</p>
                      </div>
                    </div>
                    <p className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                      <strong>Note:</strong> While we strive to protect your information, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">4. Information Sharing and Disclosure</h2>
                  <div className="prose prose-slate max-w-none text-slate-600">
                    <p>
                      We do not sell your personal information. We may share your information only in the following circumstances:
                    </p>
                    <ul className="space-y-2">
                      <li><strong>Service Providers:</strong> We may share information with third-party vendors who perform services on our behalf (e.g., payment processing, analytics, hosting)</li>
                      <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                      <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                      <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
                      <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users or others</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Third-Party Services */}
            <section>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">5. Third-Party Services</h2>
                  <div className="prose prose-slate max-w-none text-slate-600">
                    <p>
                      Riviso integrates with various third-party services:
                    </p>
                    <ul className="space-y-2">
                      <li><strong>Google Services:</strong> Google Search Console, Google Analytics, Google OAuth</li>
                      <li><strong>Payment Processors:</strong> For handling subscription payments</li>
                      <li><strong>Analytics Tools:</strong> To understand user behavior and improve our services</li>
                    </ul>
                    <p>
                      These services have their own privacy policies. We are not responsible for the privacy practices of third parties.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">6. Your Rights and Choices</h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>You have the following rights regarding your personal information:</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">✓</div>
                    <div>
                      <strong className="text-blue-900">Access:</strong>
                      <span className="text-blue-800"> Request a copy of your personal data</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">✓</div>
                    <div>
                      <strong className="text-blue-900">Correction:</strong>
                      <span className="text-blue-800"> Update or correct inaccurate information</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">✓</div>
                    <div>
                      <strong className="text-blue-900">Deletion:</strong>
                      <span className="text-blue-800"> Request deletion of your account and data</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">✓</div>
                    <div>
                      <strong className="text-blue-900">Opt-out:</strong>
                      <span className="text-blue-800"> Unsubscribe from marketing communications</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">✓</div>
                    <div>
                      <strong className="text-blue-900">Portability:</strong>
                      <span className="text-blue-800"> Request your data in a portable format</span>
                    </div>
                  </div>
                </div>
                <p className="mt-4">
                  To exercise these rights, please contact us at privacy@riviso.com
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">7. Cookies and Tracking Technologies</h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>We use cookies and similar technologies to:</p>
                <ul className="space-y-2">
                  <li>Keep you signed in</li>
                  <li>Remember your preferences</li>
                  <li>Understand how you use our services</li>
                  <li>Improve our platform</li>
                </ul>
                <p>
                  You can control cookies through your browser settings. However, disabling cookies may affect your ability to use certain features.
                </p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">8. Children's Privacy</h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>
                  Riviso is not intended for use by children under 18 years of age. We do not knowingly collect personal information from children. If we learn that we have collected information from a child under 18, we will delete it immediately.
                </p>
              </div>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">9. International Data Transfers</h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>
                  Your information may be transferred to and processed in countries other than your own. We ensure that appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">10. Data Retention</h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>
                  We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. When you delete your account, we will delete or anonymize your information within 30 days, except where retention is required by law.
                </p>
              </div>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">11. Changes to This Privacy Policy</h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of Riviso after such changes constitutes acceptance of the updated policy.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Contact Us</h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
                </p>
                <p className="font-medium">
                  Email: privacy@riviso.com<br />
                  Address: [Your Company Address]<br />
                  Data Protection Officer: dpo@riviso.com
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm">
          <Link href="/legal/terms" className="text-slate-600 hover:text-slate-900 transition-colors">
            Terms of Service
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
