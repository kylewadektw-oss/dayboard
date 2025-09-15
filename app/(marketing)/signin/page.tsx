/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 * 
 * This file is part of Dayboard, a proprietary household command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: kyle.wade.ktw@gmail.com
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */


import OauthSignIn from '@/components/ui/AuthForms/OauthSignIn';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SignIn() {
  // Note: Auth redirect logic is now handled by ProtectedRoute client-side
  // This prevents authenticated users from seeing the signin page
  
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
          
          {/* Main Sign-In Card */}
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            
            {/* Clipboard Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                <svg 
                  width="32" 
                  height="32" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-gray-600"
                >
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <path d="M12 11h4"/>
                  <path d="M12 16h4"/>
                  <path d="M8 11h.01"/>
                  <path d="M8 16h.01"/>
                </svg>
              </div>
            </div>

            {/* Welcome Text */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome to Dayboard
            </h1>
            
            <p className="text-gray-600 mb-8">
              Your household command center
            </p>

            {/* Google Sign-In Button */}
            <OauthSignIn />

            {/* Feature Highlights */}
            <div className="mt-8 mb-6">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>👨‍👩‍👧‍👦</span>
                  <span>Organize your family life in one place</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-8 mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span>🍽️</span>
                  <span>Meal Planning</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📁</span>
                  <span>Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👤</span>
                  <span>Profiles</span>
                </div>
              </div>
            </div>

            {/* Terms Text */}
            <p className="text-xs text-gray-400 leading-relaxed">
              By continuing, you agree to create an account and join/create a<br/>
              household for shared family organization.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
