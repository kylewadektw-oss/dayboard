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

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DevelopmentTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Development Testing
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lists System Test */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                📋 Enhanced Lists System
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  ✅ Working
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Test the comprehensive family list management system with 5 core
                list types, search functionality, and interactive item
                management.
              </p>

              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <span className="font-medium">Features:</span>
                  <ul className="list-disc list-inside text-gray-600 ml-2">
                    <li>Grocery, Chores, Goals, Books, Gifts lists</li>
                    <li>Search and category filtering</li>
                    <li>Add/check items with progress tracking</li>
                    <li>Responsive design with mock data</li>
                  </ul>
                </div>
              </div>

              <Link href="/lists">
                <Button className="w-full">🚀 Test Lists System</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Authentication Status */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                🔐 Authentication Status
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  ⚠️ Disabled
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Google OAuth authentication has been disabled for development.
                Protected routes require auth bypass for testing.
              </p>

              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <span className="font-medium">Current Status:</span>
                  <ul className="list-disc list-inside text-gray-600 ml-2">
                    <li>Dashboard requires authentication</li>
                    <li>Lists page temporarily made public</li>
                    <li>Middleware redirects to /signin</li>
                    <li>OAuth providers disabled</li>
                  </ul>
                </div>
              </div>

              <Link href="/test-auth">
                <Button variant="outline" className="w-full">
                  View Auth Details
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Database Status */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                🗄️ Database Schema
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  ✅ Ready
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Comprehensive lists database schema created with Supabase
                migration. Ready for 24 list types with household sharing and
                RLS policies.
              </p>

              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <span className="font-medium">Migration Ready:</span>
                  <ul className="list-disc list-inside text-gray-600 ml-2">
                    <li>Lists table with type enumeration</li>
                    <li>List items with JSONB metadata</li>
                    <li>Household-level RLS policies</li>
                    <li>Helper functions for data retrieval</li>
                  </ul>
                </div>
              </div>

              <Button variant="outline" className="w-full" disabled>
                Migration File Created
              </Button>
            </CardContent>
          </Card>

          {/* Development Progress */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                🚀 Implementation Progress
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  75% Complete
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Track the development progress of the comprehensive family list
                management system.
              </p>

              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <span className="font-medium">Completed:</span>
                  <ul className="list-disc list-inside text-green-600 ml-2">
                    <li>✅ Database schema design</li>
                    <li>✅ Core component architecture</li>
                    <li>✅ 5 list types implementation</li>
                    <li>✅ UI/UX with mock data</li>
                  </ul>

                  <span className="font-medium">Next Steps:</span>
                  <ul className="list-disc list-inside text-gray-600 ml-2">
                    <li>🔄 Database integration</li>
                    <li>🔄 Authentication restoration</li>
                    <li>🔄 Specialized list templates</li>
                    <li>🔄 Meal planning integration</li>
                  </ul>
                </div>
              </div>

              <Button variant="outline" className="w-full" disabled>
                View Project Roadmap
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">🚀 Quick Test Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/lists">
              <Button>📋 Test Lists System</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">🏠 Home Page</Button>
            </Link>
            <Link href="/signin">
              <Button variant="outline">🔐 Sign In Page</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
