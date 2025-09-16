/**
 * Dayboard - Family Management Platform
 * 
 * © 2025 BentLo Labs LLC. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This source code is the proprietary and confidential property of BentLo Labs LLC.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * @company BentLo Labs LLC
 * @product Dayboard
 * @license Proprietary
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | Dayboard™ by BentLo Labs LLC',
  description: 'Cookie Policy for Dayboard™ Family Management Platform by BentLo Labs LLC.',
  openGraph: {
    title: 'Cookie Policy | Dayboard™',
    description: 'How we use cookies and tracking technologies.',
  },
};

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
            <p className="text-lg text-gray-600">Dayboard™ Family Management Platform</p>
            <p className="text-sm text-gray-500 mt-2">Last Updated: September 15, 2025</p>
          </header>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies?</h2>
              <p className="text-gray-700 leading-relaxed">
                Cookies are small text files that are stored on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and 
                improving the functionality of Dayboard™.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                BentLo Labs LLC uses cookies for the following purposes:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Essential Functionality:</strong> To enable core features like login and security</li>
                <li><strong>Performance:</strong> To understand how you use our service and identify improvements</li>
                <li><strong>Personalization:</strong> To remember your preferences and customize your experience</li>
                <li><strong>Analytics:</strong> To measure usage patterns and optimize our platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Essential Cookies</h3>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-700 mb-2"><strong>Purpose:</strong> Required for basic functionality</p>
                  <p className="text-gray-700 mb-2"><strong>Examples:</strong> Authentication, security, session management</p>
                  <p className="text-gray-700"><strong>Can be disabled:</strong> No - required for service operation</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Analytics Cookies</h3>
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-700 mb-2"><strong>Purpose:</strong> Understand usage patterns and improve performance</p>
                  <p className="text-gray-700 mb-2"><strong>Examples:</strong> Google Analytics, page view tracking</p>
                  <p className="text-gray-700"><strong>Can be disabled:</strong> Yes - through browser settings or our preferences</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Preference Cookies</h3>
                <div className="bg-purple-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-700 mb-2"><strong>Purpose:</strong> Remember your settings and preferences</p>
                  <p className="text-gray-700 mb-2"><strong>Examples:</strong> Language, theme, dashboard layout</p>
                  <p className="text-gray-700"><strong>Can be disabled:</strong> Yes - but may affect user experience</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Marketing Cookies</h3>
                <div className="bg-orange-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-700 mb-2"><strong>Purpose:</strong> Measure effectiveness of marketing campaigns</p>
                  <p className="text-gray-700 mb-2"><strong>Examples:</strong> Conversion tracking, referral source</p>
                  <p className="text-gray-700"><strong>Can be disabled:</strong> Yes - will not affect core functionality</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Specific Cookies We Use</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left">Cookie Name</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">supabase-auth-token</td>
                      <td className="border border-gray-300 px-4 py-2">User authentication</td>
                      <td className="border border-gray-300 px-4 py-2">Session</td>
                      <td className="border border-gray-300 px-4 py-2">Essential</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">dayboard-preferences</td>
                      <td className="border border-gray-300 px-4 py-2">User interface preferences</td>
                      <td className="border border-gray-300 px-4 py-2">1 year</td>
                      <td className="border border-gray-300 px-4 py-2">Preference</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">_ga</td>
                      <td className="border border-gray-300 px-4 py-2">Google Analytics tracking</td>
                      <td className="border border-gray-300 px-4 py-2">2 years</td>
                      <td className="border border-gray-300 px-4 py-2">Analytics</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">_gid</td>
                      <td className="border border-gray-300 px-4 py-2">Google Analytics session</td>
                      <td className="border border-gray-300 px-4 py-2">24 hours</td>
                      <td className="border border-gray-300 px-4 py-2">Analytics</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Third-Party Cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use trusted third-party services that may set their own cookies:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Google Analytics:</strong> For usage analytics and performance monitoring</li>
                <li><strong>Supabase:</strong> For authentication and database services</li>
                <li><strong>Stripe:</strong> For payment processing (when applicable)</li>
                <li><strong>Vercel:</strong> For hosting and content delivery</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Managing Your Cookie Preferences</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Browser Settings</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You can control cookies through your browser settings:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li><strong>Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies</li>
                <li><strong>Firefox:</strong> Preferences &gt; Privacy &amp; Security &gt; Cookies</li>
                <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Cookies</li>
                <li><strong>Edge:</strong> Settings &gt; Cookies and Site Permissions</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Dayboard™ Preferences</h3>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700 mb-2">
                  <strong>Cookie Preference Center:</strong> Visit your account settings to manage cookie preferences for analytics and marketing cookies.
                </p>
                <p className="text-gray-700">
                  <strong>Note:</strong> Essential cookies cannot be disabled as they are required for core functionality.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. COPPA and Children&apos;s Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Children Under 13:</strong> When providing services through daycare partnerships:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>We obtain parental consent before setting cookies for children under 13</li>
                <li>We limit tracking to essential functionality only</li>
                <li>Parents can request deletion of all tracking data</li>
                <li>We do not use marketing cookies for children&apos;s accounts</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. GDPR Compliance</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>For EU Users:</strong> We comply with GDPR requirements for cookies:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>We obtain explicit consent for non-essential cookies</li>
                <li>You can withdraw consent at any time</li>
                <li>We provide clear information about each cookie&apos;s purpose</li>
                <li>You have the right to access and delete cookie data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookie Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We protect cookie data through:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Encryption:</strong> Sensitive cookies are encrypted in transit and storage</li>
                <li><strong>Secure Flags:</strong> Cookies are marked as secure and httpOnly when appropriate</li>
                <li><strong>Expiration:</strong> All cookies have appropriate expiration times</li>
                <li><strong>Domain Restrictions:</strong> Cookies are limited to our domain only</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Updates to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices or 
                applicable laws. We will notify you of significant changes and update the effective date above.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For questions about our use of cookies or to exercise your rights, contact us at:
              </p>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">BentLo Labs LLC - Privacy Office</p>
                <p>Email: privacy@bentlolabs.com</p>
                <p>Subject: Cookie Policy Inquiry</p>
                <p className="mt-2 text-sm text-gray-600">
                  We will respond to cookie-related requests within 30 days.
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* BentLo Labs LLC Copyright Footer */}
        <footer className="text-center py-8">
          <div className="border-t pt-8">
            <p className="text-sm text-gray-500">
              © 2025 BentLo Labs LLC. All rights reserved. Dayboard™ is a trademark of BentLo Labs LLC.
            </p>
            <div className="mt-2 space-x-4">
              <a href="/terms" className="text-blue-600 hover:text-blue-800">Terms of Service</a>
              <a href="/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</a>
              <a href="mailto:privacy@bentlolabs.com" className="text-blue-600 hover:text-blue-800">Privacy Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}