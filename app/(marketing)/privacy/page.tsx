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
  title: 'Privacy Policy | Dayboard™ by BentLo Labs LLC',
  description:
    'Privacy Policy for Dayboard™ Family Management Platform by BentLo Labs LLC.',
  openGraph: {
    title: 'Privacy Policy | Dayboard™',
    description: 'How we protect and handle your family data.'
  }
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">
              Dayboard™ Family Management Platform
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last Updated: September 15, 2025
            </p>
          </header>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                BentLo Labs LLC (&quot;we&quot;, &quot;us&quot;,
                &quot;our&quot;) operates Dayboard™, a family management
                platform. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our
                Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Information We Collect
              </h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Personal Information
              </h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Account information (name, email address, profile data)</li>
                <li>Household member information</li>
                <li>Meal planning and grocery list data</li>
                <li>Calendar events and schedules</li>
                <li>Project and task information</li>
                <li>Photos uploaded through daycare integrations</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Technical Information
              </h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Usage analytics and performance metrics</li>
                <li>Log files and error reports</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use your information to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Provide and maintain the Dayboard™ service</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send important updates about your account</li>
                <li>Improve our service through analytics</li>
                <li>Provide customer support</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Information Sharing
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>We do not sell your personal information.</strong> We
                may share your information in the following limited
                circumstances:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>
                  <strong>Within Your Household:</strong> Information is shared
                  among household members you invite
                </li>
                <li>
                  <strong>Service Providers:</strong> With trusted partners who
                  help us operate the service (hosting, payments, analytics)
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or
                  to protect our rights
                </li>
                <li>
                  <strong>Daycare Partners:</strong> Limited information sharing
                  for educational institution features
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Children&apos;s Privacy (COPPA Compliance)
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Protection of Children Under 13:</strong> When providing
                services through daycare partnerships, we comply with the
                Children&apos;s Online Privacy Protection Act (COPPA).
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>
                  We obtain verifiable parental consent before collecting
                  information from children under 13
                </li>
                <li>
                  Parents can review, delete, or refuse further collection of
                  their child&apos;s information
                </li>
                <li>
                  We limit data collection to what is necessary for the service
                </li>
                <li>
                  We do not condition participation on disclosure of more
                  information than necessary
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Educational Records (FERPA Compliance)
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Student Privacy:</strong> For educational institution
                partnerships, we maintain compliance with the Family Educational
                Rights and Privacy Act (FERPA).
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Educational records are kept confidential and secure</li>
                <li>
                  Parents have the right to access their child&apos;s records
                </li>
                <li>
                  We obtain consent before sharing educational information
                </li>
                <li>
                  Records are retained according to institutional policies
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your
                information:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication</li>
                <li>Secure data centers and infrastructure</li>
                <li>Employee training on data protection</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. International Data Transfers
              </h2>
              <p className="text-gray-700 leading-relaxed">
                <strong>GDPR Compliance:</strong> For users in the European
                Union, we ensure adequate protection for international data
                transfers and provide rights under the General Data Protection
                Regulation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Your Privacy Rights
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>
                  <strong>Access:</strong> Request a copy of your personal
                  information
                </li>
                <li>
                  <strong>Correct:</strong> Update or correct inaccurate
                  information
                </li>
                <li>
                  <strong>Delete:</strong> Request deletion of your personal
                  information
                </li>
                <li>
                  <strong>Portability:</strong> Export your data in a portable
                  format
                </li>
                <li>
                  <strong>Opt-out:</strong> Unsubscribe from marketing
                  communications
                </li>
                <li>
                  <strong>Object:</strong> Object to processing based on
                  legitimate interests
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Cookies and Tracking
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your
                experience. See our Cookie Policy for detailed information about
                the types of cookies we use and how to manage them.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Data Retention
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain your information for as long as necessary to provide
                the service and comply with legal obligations:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Account data: Until account deletion + 30 days</li>
                <li>Billing records: 7 years for tax compliance</li>
                <li>Analytics data: Aggregated and anonymized after 2 years</li>
                <li>Support communications: 3 years</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Updates to This Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify you of significant changes by email and by posting the
                updated policy on our website with a new effective date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                13. Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For questions about this Privacy Policy or to exercise your
                privacy rights, contact us at:
              </p>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">
                  BentLo Labs LLC - Privacy Office
                </p>
                <p>Email: privacy@bentlolabs.com</p>
                <p>Subject: Privacy Policy Inquiry</p>
                <p className="mt-2 text-sm text-gray-600">
                  We will respond to privacy requests within 30 days.
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* BentLo Labs LLC Copyright Footer */}
        <footer className="text-center py-8">
          <div className="border-t pt-8">
            <p className="text-sm text-gray-500">
              © 2025 BentLo Labs LLC. All rights reserved. Dayboard™ is a
              trademark of BentLo Labs LLC.
            </p>
            <div className="mt-2 space-x-4">
              <a href="/terms" className="text-blue-600 hover:text-blue-800">
                Terms of Service
              </a>
              <a href="/cookies" className="text-blue-600 hover:text-blue-800">
                Cookie Policy
              </a>
              <a
                href="mailto:privacy@bentlolabs.com"
                className="text-blue-600 hover:text-blue-800"
              >
                Privacy Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
