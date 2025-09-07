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
 * 🧩 FOOTER COMPONENT - Reusable UI Element
 * 
 * PURPOSE: Reusable footer component for household management interfaces
 * 
 * PROPS:
 * - [List component props and their types]
 * - [Optional vs required properties]
 * - [Callback functions and event handlers]
 * 
 * FEATURES:
 * - [Interactive elements and behaviors]
 * - [Visual design and styling approach]
 * - [Data handling and display logic]
 * - [Accessibility considerations]
 * 
 * USAGE:
 * ```tsx
 * <🧩 
 *   prop1="value"
 *   onAction={handleAction}
 * />
 * ```
 * 
 * TECHNICAL:
 * - [Implementation details]
 * - [Performance considerations]
 * - [Testing approach]
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

import Link from 'next/link';
import Logo from '@/components/icons/Logo';

export default function Footer() {
  return (
    <footer className="mx-auto max-w-[1920px] px-6 bg-zinc-900">
      <div className="grid grid-cols-1 gap-8 py-12 text-white transition-colors duration-150 border-b lg:grid-cols-12 border-zinc-600 bg-zinc-900">
        <div className="col-span-1 lg:col-span-3">
          <Link
            href="/"
            className="flex items-center flex-initial font-bold md:mr-24 mb-4"
          >
            <Logo className="scale-75" />
          </Link>
          <p className="mt-4 text-sm text-zinc-400 max-w-xs">
            Organize your household life with ease. From meal planning to project tracking, 
            Dayboard helps families stay connected and productive.
          </p>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <ul className="flex flex-col flex-initial md:flex-1">
            <li className="py-3 md:py-0 md:pb-4">
              <p className="font-bold text-white">FEATURES</p>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/#features"
                className="text-zinc-400 transition duration-150 ease-in-out hover:text-white"
              >
                Dashboard
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/#features"
                className="text-zinc-400 transition duration-150 ease-in-out hover:text-white"
              >
                Meal Planning
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/#features"
                className="text-zinc-400 transition duration-150 ease-in-out hover:text-white"
              >
                Task Management
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <ul className="flex flex-col flex-initial md:flex-1">
            <li className="py-3 md:py-0 md:pb-4">
              <p className="font-bold text-white">SUPPORT</p>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/help"
                className="text-zinc-400 transition duration-150 ease-in-out hover:text-white"
              >
                Help Center
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/contact"
                className="text-zinc-400 transition duration-150 ease-in-out hover:text-white"
              >
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <ul className="flex flex-col flex-initial md:flex-1">
            <li className="py-3 md:py-0 md:pb-4">
              <p className="font-bold text-white">LEGAL</p>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/privacy"
                className="text-zinc-400 transition duration-150 ease-in-out hover:text-white"
              >
                Privacy Policy
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/terms"
                className="text-zinc-400 transition duration-150 ease-in-out hover:text-white"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-span-1 lg:col-span-3">
          <p className="font-bold text-white mb-4">STAY CONNECTED</p>
          <p className="text-sm text-zinc-400 mb-4">
            Join our family community and get tips for better household organization.
          </p>
          <div className="flex space-x-4">
            <Link 
              href="/signin" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between py-12 space-y-4 md:flex-row bg-zinc-900">
        <div>
          <span className="text-zinc-400">
            &copy; {new Date().getFullYear()} Dayboard. Built for families, by families.
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-zinc-500 text-sm">
            Made with ❤️ for busy families everywhere
          </span>
        </div>
      </div>
    </footer>
  );
}
