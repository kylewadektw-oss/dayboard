/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Copyright (c) 2025 BentLo Labs LLC (developer@bentlolabs.com)
 *
 * This file is part of Dayboard, a proprietary household command center application.
 *
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 *
 * For licensing inquiries: developer@bentlolabs.com
 *
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

'use client';

export default function DetailedOAuthTest() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Testing - Disabled</h1>

      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
        <strong className="font-bold">Notice:</strong>
        <span className="block sm:inline">
          {' '}
          Google OAuth has been disabled for development. This test page is no
          longer functional.
        </span>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">OAuth Status:</h3>
        <p className="text-sm mb-4">
          Google authentication has been removed from this project to simplify
          development. Authentication features can be re-implemented later when
          needed for production.
        </p>

        <div className="bg-red-50 border border-red-200 p-3 rounded">
          <h4 className="font-medium text-red-800 mb-2">What was disabled:</h4>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            <li>Google OAuth provider configuration</li>
            <li>Environment variables for Google Client ID</li>
            <li>OAuth URL generation and redirect functionality</li>
            <li>All Google authentication test endpoints</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
