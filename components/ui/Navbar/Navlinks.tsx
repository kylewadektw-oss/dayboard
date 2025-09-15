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


'use client';

import Link from 'next/link';
import { SignOut } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import Logo from '@/components/icons/Logo';
import { usePathname, useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import { User } from '@supabase/supabase-js';
import s from './Navbar.module.css';

interface NavlinksProps {
  user?: User | null;
}

export default function Navlinks({ user }: NavlinksProps) {
  const router = useRouter();
  const pathname = usePathname();
  const redirectMethod = getRedirectMethod();

  return (
    <div className="relative flex flex-row justify-between py-4 align-center md:py-6">
      <div className="flex items-center flex-1">
        <Link href={user ? "/dashboard" : "/"} className={s.logo} aria-label="Dayboard">
          <Logo />
        </Link>
        {user && (
          <nav className="ml-6 space-x-4 lg:block">
            <Link href="/dashboard" className={s.link}>
              Dashboard
            </Link>
            <Link href="/meals" className={s.link}>
              Meals
            </Link>
            <Link href="/lists" className={s.link}>
              Lists
            </Link>
            <Link href="/work" className={s.link}>
              Work
            </Link>
            <Link href="/projects" className={s.link}>
              Projects
            </Link>
          </nav>
        )}
      </div>
      <div className="flex justify-end space-x-8">
        {user ? (
          <div className="flex items-center space-x-4">
            <Link href="/account" className={s.link}>
              Account
            </Link>
            <form onSubmit={(e) => handleRequest(e, SignOut, redirectMethod === 'client' ? router : null)}>
              <input type="hidden" name="pathName" value={pathname} />
              <button type="submit" className={s.link}>
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link href="/signin" className={s.link}>
              Sign In
            </Link>
            <Link 
              href="/#pricing" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
