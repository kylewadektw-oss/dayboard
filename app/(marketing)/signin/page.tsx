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

import OauthSignIn from '@/components/ui/AuthForms/OauthSignIn';
import ProtectedRoute from '@/components/ProtectedRoute';
import Logo from '@/components/icons/Logo';
import OAuthDiagnostics from '@/components/OAuthDiagnostics';

export default function SignIn() {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex">
        {/* Left Side - Hero Content */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-600/20"></div>
          <div className="absolute inset-0 opacity-50">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="relative z-10 max-w-lg text-center">
            <div className="mb-8">
              <Logo className="scale-150" />
            </div>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Welcome to Dayboard
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              The modern command center for busy families. Organize, plan, and connect in one beautiful place.
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl mb-3">📅</div>
                <h3 className="font-semibold mb-2">Smart Planning</h3>
                <p className="text-sm text-gray-300">Coordinate schedules, meals, and activities effortlessly</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl mb-3">👥</div>
                <h3 className="font-semibold mb-2">Family Hub</h3>
                <p className="text-sm text-gray-300">Connect every family member in one secure space</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-semibold mb-2">Goal Tracking</h3>
                <p className="text-sm text-gray-300">Track projects, chores, and family milestones</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl mb-3">🏠</div>
                <h3 className="font-semibold mb-2">Home Central</h3>
                <p className="text-sm text-gray-300">Your household&apos;s digital headquarters</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <Logo className="scale-125" />
              <h1 className="text-3xl font-bold text-white mt-4">Welcome to Dayboard</h1>
              <p className="text-gray-400 mt-2">Your family&apos;s digital command center</p>
            </div>

            {/* Sign In Card */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Get Started</h2>
                <p className="text-gray-400">Choose your preferred sign-in method</p>
              </div>

              {/* OAuth Buttons */}
              <OauthSignIn />

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <span className="text-gray-400 text-sm px-4">More coming soon</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm text-gray-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>Free to start - no credit card required</span>
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>Secure family data with enterprise-grade encryption</span>
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  <span>Works on all your devices - phone, tablet, computer</span>
                </div>
              </div>

              {/* Terms */}
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                By continuing, you agree to our Terms of Service and Privacy Policy. 
                You&apos;ll be able to create or join a household after signing in.
              </p>
            </div>
          </div>
        </div>
        
        {/* Debug panel - temporary for OAuth troubleshooting */}
        <div className="hidden lg:block w-1/3 bg-gray-800 border-l border-gray-700 overflow-hidden">
          <OAuthDiagnostics />
        </div>
      </div>
    </ProtectedRoute>
  );
}
