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
import { 
  Monitor, 
  BarChart3, 
  Activity, 
  Database, 
  Shield, 
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  Server
} from 'lucide-react';

export default function LogsDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Header */}
      <section className="relative px-4 pt-12 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 mb-8 bg-white/10 backdrop-blur-sm rounded-full shadow-lg border border-gray-700">
            <Monitor className="w-4 h-4 text-emerald-400 mr-2" />
            <span className="text-sm font-medium text-gray-300">
              Real-Time Monitoring & Analytics
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl leading-tight">
            <span className="block bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Logs Dashboard
            </span>
            System Monitoring Hub
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg leading-relaxed text-gray-300 max-w-2xl mx-auto">
            Comprehensive monitoring and analytics platform for real-time system insights, 
            performance tracking, and operational intelligence.
          </p>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-center mb-3">
                <Activity className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-center mb-3">
                <BarChart3 className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-gray-400">Monitoring</div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-center mb-3">
                <Database className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">Real-time</div>
              <div className="text-sm text-gray-400">Analytics</div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-center mb-3">
                <Shield className="w-8 h-8 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-white">Secure</div>
              <div className="text-sm text-gray-400">Infrastructure</div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Features */}
      <section className="py-20 bg-white/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Monitoring Capabilities
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Comprehensive monitoring suite with advanced analytics and alerting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Performance Monitoring */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Performance Analytics
              </h3>
              <p className="text-gray-400 mb-4">
                Real-time performance metrics, response times, and system resource monitoring.
              </p>
              <Link 
                href="/logs-dashboard/performance"
                className="text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                View Performance →
              </Link>
            </div>

            {/* Security Monitoring */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Security Dashboard
              </h3>
              <p className="text-gray-400 mb-4">
                Security events, authentication logs, and threat detection monitoring.
              </p>
              <Link 
                href="/logs-dashboard/security"
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                View Security →
              </Link>
            </div>

            {/* Error Tracking */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-orange-500/50 transition-colors">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Error Monitoring
              </h3>
              <p className="text-gray-400 mb-4">
                Application errors, exception tracking, and automated alerting systems.
              </p>
              <Link 
                href="/logs-dashboard/errors"
                className="text-orange-400 hover:text-orange-300 font-semibold"
              >
                View Errors →
              </Link>
            </div>

            {/* User Analytics */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                User Analytics
              </h3>
              <p className="text-gray-400 mb-4">
                User behavior tracking, session analytics, and engagement metrics.
              </p>
              <Link 
                href="/logs-dashboard/users"
                className="text-purple-400 hover:text-purple-300 font-semibold"
              >
                View Analytics →
              </Link>
            </div>

            {/* System Health */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-cyan-500/50 transition-colors">
              <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mb-6">
                <Server className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                System Health
              </h3>
              <p className="text-gray-400 mb-4">
                Infrastructure monitoring, server health, and resource utilization.
              </p>
              <Link 
                href="/logs-dashboard/system"
                className="text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                View System →
              </Link>
            </div>

            {/* Real-time Logs */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-green-500/50 transition-colors">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Live Logs
              </h3>
              <p className="text-gray-400 mb-4">
                Real-time log streaming, filtering, and search capabilities.
              </p>
              <Link 
                href="/logs-dashboard/live"
                className="text-green-400 hover:text-green-300 font-semibold"
              >
                View Live Logs →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Access Information */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Access Logs Dashboard
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Authorized access required. Contact system administrator for credentials.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signin?redirect=/logs-dashboard"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              <Monitor className="w-5 h-5" />
              Access Dashboard
            </Link>
            <a
              href="mailto:admin@bentlolabs.com"
              className="inline-flex items-center gap-2 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Request Access
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-bold text-white">BentLo Labs Monitoring</h3>
              <p className="text-gray-400">System Operations Center</p>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                Company
              </Link>
              <a href="https://dayboard.bentlolabs.com" className="text-gray-400 hover:text-white transition-colors">
                Dayboard
              </a>
              <span className="text-gray-600">•</span>
              <span className="text-sm text-gray-500">Authorized Personnel Only</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}