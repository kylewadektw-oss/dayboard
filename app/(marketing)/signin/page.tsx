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

/*
 * 🛠️ PAGE UTILITY - Helper Functions
 * 
 * PURPOSE: Utility functions and helpers for page functionality
 * 
 * EXPORTS:
 * - [List main functions and classes]
 * - [Constants and type definitions]
 * - [Helper utilities and tools]
 * 
 * USAGE:
 * ```typescript
 * import { functionName } from '@/utils/page';
 * 
 * const result = functionName(parameters);
 * ```
 * 
 * FEATURES:
 * - [Key capabilities and functionality]
 * - [Error handling and validation]
 * - [Performance optimizations]
 * - [Integration patterns]
 * 
 * TECHNICAL:
 * - [Implementation approach]
 * - [Dependencies and requirements]
 * - [Testing and validation]
 * - [Security considerations]
 */


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

/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kylewadektw-oss)
 * 
 * This file is part of Dayboard, a proprietary family command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: [your-email@domain.com]
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Logo from '@/components/icons/Logo';
import Card from '@/components/ui/Card';
import OauthSignIn from '@/components/ui/AuthForms/OauthSignIn';
import SignInLogger from '@/components/auth/SignInLogger';

export default async function SignIn() {
  // Check if user is already logged in
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    return redirect('/dashboard');
  }

  return (
    <div className="flex justify-center height-screen-helper">
      <SignInLogger />
      <div className="flex flex-col justify-between max-w-lg p-3 m-auto w-80">
        <div className="flex justify-center pb-12">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-4 rounded-2xl">
            <Logo className="scale-75" />
          </div>
        </div>
        <Card title="Welcome to Dayboard">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">
              Sign in to manage your household's daily life with ease.
            </p>
            <p className="text-sm text-gray-500">
              Organize meals, lists, projects, and more—all in one place.
            </p>
          </div>
          <OauthSignIn />
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
