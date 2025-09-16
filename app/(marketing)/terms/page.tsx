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
  title: 'Terms of Service | Dayboard™ by BentLo Labs LLC',
  description: 'Terms of Service for Dayboard™ Family Management Platform by BentLo Labs LLC.',
  openGraph: {
    title: 'Terms of Service | Dayboard™',
    description: 'Legal terms and conditions for using Dayboard™.',
  },
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-lg text-gray-600">Dayboard™ Family Management Platform</p>
            <p className="text-sm text-gray-500 mt-2">Last Updated: September 15, 2025</p>
          </header>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Dayboard™ (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). 
                Dayboard™ is a proprietary family management platform owned and operated by BentLo Labs LLC (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Intellectual Property Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Proprietary Software:</strong> Dayboard™ and all related software, documentation, and materials are the 
                exclusive property of BentLo Labs LLC and are protected by United States copyright laws and international treaties.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Trademarks:</strong> &quot;Dayboard™&quot; and &quot;BentLo Labs™&quot; are trademarks of BentLo Labs LLC. All other 
                trademarks, service marks, and logos used in this Service are the property of their respective owners.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>License:</strong> We grant you a limited, non-exclusive, non-transferable license to use the Service 
                for personal, non-commercial purposes only, subject to these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Data</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account 
                credentials and for all activities that occur under your account.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Household Data:</strong> You retain ownership of the personal and household data you input into the Service. 
                We use this data solely to provide the Service to you and your household members.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Privacy:</strong> Your use of the Service is also governed by our Privacy Policy, which is incorporated 
                into these Terms by reference.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Subscription and Payment Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Subscription Plans:</strong> The Service offers both free and paid subscription plans. Paid features 
                require a valid subscription and payment method.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Billing:</strong> Subscription fees are billed in advance on a monthly or annual basis. All fees are 
                non-refundable except as required by law or as otherwise specified in these Terms.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Cancellation:</strong> You may cancel your subscription at any time. Upon cancellation, you will 
                retain access to paid features until the end of your current billing period.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Daycare and Educational Institution Features</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>COPPA Compliance:</strong> When providing services to children under 13 through daycare partnerships, 
                we comply with the Children&apos;s Online Privacy Protection Act (COPPA).
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>FERPA Compliance:</strong> For educational institution partnerships, we maintain compliance with the 
                Family Educational Rights and Privacy Act (FERPA) regarding student records.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Parental Consent:</strong> Daycare and educational features require appropriate parental consent and 
                are subject to additional terms specific to institutional partnerships.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Prohibited Uses</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree not to use the Service for any unlawful purpose or in any way that could harm, disable, 
                overburden, or impair the Service. You may not attempt to reverse engineer, decompile, or disassemble 
                the Service or any portion thereof.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Disclaimers and Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>AS IS BASIS:</strong> The Service is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind, 
                either express or implied, including but not limited to implied warranties of merchantability and fitness for a particular purpose.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>LIMITATION OF LIABILITY:</strong> In no event shall BentLo Labs LLC be liable for any indirect, 
                incidental, special, consequential, or punitive damages, including without limitation, loss of profits, 
                data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, 
                for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the United States and the 
                state where BentLo Labs LLC is incorporated, without regard to conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                For questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">BentLo Labs LLC</p>
                <p>Email: legal@bentlolabs.com</p>
                <p>Subject: Terms of Service Inquiry</p>
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
              <a href="/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</a>
              <a href="/cookies" className="text-blue-600 hover:text-blue-800">Cookie Policy</a>
              <a href="mailto:legal@bentlolabs.com" className="text-blue-600 hover:text-blue-800">Legal Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}