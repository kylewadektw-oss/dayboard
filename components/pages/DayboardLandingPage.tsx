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
  ArrowRight,
  PlayCircle,
  CheckCircle,
  Sparkles,
  Shield,
  Zap,
  Eye,
  Home,
  Monitor
} from 'lucide-react';
import LandingPageLogger from '@/components/marketing/LandingPageLogger';

export default function DayboardLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <LandingPageLogger />

      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-24 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 mb-8 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
            <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              75% Complete • Production Ready
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl leading-tight">
            Your Complete
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
              Household OS
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-xl leading-relaxed text-gray-700 max-w-3xl mx-auto">
            Stop juggling apps. Dayboard unifies <strong>meal planning</strong>,{' '}
            <strong>household coordination</strong>,
            <strong> project tracking</strong>, and{' '}
            <strong>family organization</strong> into one intelligent command
            center.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signin"
              className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-xl hover:shadow-blue-500/25 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              <PlayCircle className="w-5 h-5" />
              Try Free Dashboard
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center gap-2 px-6 py-4 text-lg font-semibold text-gray-800 hover:text-blue-600 transition-all duration-300 group"
            >
              <Eye className="w-5 h-5" />
              See Features
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-500" />
              <span>Multi-Device Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-500" />
              <span>Real-Time Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>No Credit Card</span>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the Dayboard content continues... */}
      {/* For brevity, I'll include a key section */}
      
      {/* Built Features Showcase */}
      <section id="demo" className="relative py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need, Built & Ready
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Unlike concept apps, Dayboard is production-ready with real
              features you can use today. Here&apos;s what&apos;s already built
              and working.
            </p>
          </div>

          {/* Core Dashboard Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Smart Dashboard */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 border border-blue-100">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Home className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Smart Dashboard
                </h3>
                <p className="text-gray-700 mb-4">
                  <strong>8 interactive widgets</strong> including real weather,
                  household maps, calendar events, quick actions, and profile
                  status monitoring.
                </p>
                <div className="text-blue-600 font-semibold">
                  Weather • Maps • Calendar • Actions →
                </div>
              </div>
            </div>

            {/* Additional feature cards would continue here... */}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
            Ready to Unify Your Household?
          </h2>
          <p className="text-xl text-gray-700 mb-10">
            Join the families who&apos;ve transformed their home management with
            a single, powerful platform that actually works.
          </p>

          <div className="mb-10">
            <Link
              href="/signin"
              className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-10 py-5 text-xl font-bold text-white shadow-xl hover:shadow-blue-500/25 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              <PlayCircle className="w-6 h-6" />
              Start Your Free Dashboard
            </Link>

            <p className="mt-6 text-base text-gray-600">
              Free forever • No credit card required • All core features
              included
            </p>
          </div>

          {/* Feature Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-gray-700">
            <div className="flex items-center gap-2 justify-center">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="font-medium">Complete Meal System</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="font-medium">Smart Lists & Tasks</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="font-medium">Project Coordination</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="font-medium">Family Organization</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}