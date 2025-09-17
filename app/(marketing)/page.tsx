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
  ChefHat,
  ListTodo,
  Users,
  Timer,
  Star,
  ArrowRight,
  PlayCircle,
  CheckCircle,
  Sparkles,
  Clock,
  Shield,
  MapPin,
  BarChart3,
  Wrench,
  Baby,
  Cloud,
  Zap,
  Eye,
  Settings,
  Crown,
  Martini,
  BookOpen,
  ActivitySquare,
  Home,
  Monitor,
  Check,
  X
} from 'lucide-react';
import LandingPageLogger from '@/components/marketing/LandingPageLogger';

export default function LandingPage() {
  // Remove auth redirect for now to avoid provider issues
  // The signin page will handle auth flow properly

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

            {/* Comprehensive Meals */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-500 border border-orange-100">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ChefHat className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Complete Meal System
                </h3>
                <p className="text-gray-700 mb-4">
                  <strong>
                    Recipe library, weekly planning, favorites management
                  </strong>
                  , plus TheCocktailDB integration for beverages and
                  entertaining.
                </p>
                <div className="text-orange-600 font-semibold">
                  Recipes • Planning • Cocktails • Lists →
                </div>
              </div>
            </div>

            {/* Advanced Lists */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-500 border border-emerald-100">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ListTodo className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Smart List Management
                </h3>
                <p className="text-gray-700 mb-4">
                  <strong>Multi-type lists</strong> with grocery categories,
                  todo tracking, shopping progress, and real-time household
                  collaboration.
                </p>
                <div className="text-emerald-600 font-semibold">
                  Grocery • Todo • Shopping • Progress →
                </div>
              </div>
            </div>

            {/* Work & Time Tracking */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-500 border border-purple-100">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Timer className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Work & Time Management
                </h3>
                <p className="text-gray-700 mb-4">
                  <strong>Built-in timers, productivity tracking</strong>,
                  schedule management, and analytics for balancing work and
                  household responsibilities.
                </p>
                <div className="text-purple-600 font-semibold">
                  Timers • Analytics • Productivity • Reports →
                </div>
              </div>
            </div>

            {/* Project Management */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-500 border border-rose-100">
                <div className="w-14 h-14 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Wrench className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Project Coordination
                </h3>
                <p className="text-gray-700 mb-4">
                  <strong>Visual project tracking</strong> with progress bars,
                  priority levels, task management, and collaborative household
                  project coordination.
                </p>
                <div className="text-rose-600 font-semibold">
                  Projects • Tasks • Progress • Teams →
                </div>
              </div>
            </div>

            {/* Household Management */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-500 border border-cyan-100">
                <div className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Family Coordination
                </h3>
                <p className="text-gray-700 mb-4">
                  <strong>Household profiles, role management</strong>,
                  permissions system, daycare updates, and multi-member
                  coordination tools.
                </p>
                <div className="text-cyan-600 font-semibold">
                  Profiles • Roles • Updates • Coordination →
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Features Grid */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8 mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Advanced Features Built-In
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Weather Integration
                  </div>
                  <div className="text-sm text-gray-600">6-day forecasts</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Location Maps
                  </div>
                  <div className="text-sm text-gray-600">Google Maps</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Analytics Suite
                  </div>
                  <div className="text-sm text-gray-600">7 dashboards</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Baby className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Daycare Updates
                  </div>
                  <div className="text-sm text-gray-600">Photo feeds</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Martini className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Cocktail Database
                  </div>
                  <div className="text-sm text-gray-600">TheCocktailDB</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <ActivitySquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Real-time Logging
                  </div>
                  <div className="text-sm text-gray-600">Debug system</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Recipe Library
                  </div>
                  <div className="text-sm text-gray-600">50+ recipes</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Advanced Settings
                  </div>
                  <div className="text-sm text-gray-600">Full control</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start free with core features. Upgrade for advanced household
              coordination and premium integrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">$0</div>
                <div className="text-gray-600">Forever</div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Complete dashboard with 8 widgets</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Basic meal planning & recipes</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Smart lists & task management</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Household profiles (up to 4)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Weather & location widgets</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-500">Advanced analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-500">Premium integrations</span>
                </li>
              </ul>

              <Link
                href="/signin"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition-colors text-center block"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-500 p-8 relative scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">$12</div>
                <div className="text-gray-600">per month</div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Everything in Free</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Advanced analytics & insights</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Unlimited household members</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Calendar & productivity integrations</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Advanced project coordination</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Export & backup features</span>
                </li>
              </ul>

              <Link
                href="/signin"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors text-center block"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Enterprise
                </h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">$29</div>
                <div className="text-gray-600">per month</div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Multiple household management</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Advanced security & compliance</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>API access</span>
                </li>
                <li className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span>White-label options</span>
                </li>
                <li className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span>Dedicated account manager</span>
                </li>
              </ul>

              <Link
                href="mailto:developer@bentlolabs.com"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors text-center block"
              >
                Contact Sales
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              All plans include free updates, mobile access, and data export. No
              setup fees.
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>30-day money back</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>No contracts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-black">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-8 w-8 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <blockquote className="text-2xl font-light text-white max-w-4xl mx-auto leading-relaxed mb-8">
              &ldquo;This isn&apos;t just another household app concept.
              Dayboard actually works - comprehensive features, beautiful
              design, and real functionality that eliminated our family
              chaos.&rdquo;
            </blockquote>
            <div className="text-gray-300 text-lg">
              — Sarah Chen, Working Parent of 3
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Beta User • San Francisco, CA
            </div>
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
