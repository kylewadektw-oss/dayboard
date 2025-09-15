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

import Image from 'next/image';

export default function LogoCloud() {
  return (
    <div>
      <p className="mt-24 text-xs uppercase text-zinc-400 text-center font-bold tracking-[0.3em]">
        Brought to you by
      </p>
      <div className="grid grid-cols-1 place-items-center	my-12 space-y-4 sm:mt-8 sm:space-y-0 md:mx-auto md:max-w-2xl sm:grid sm:gap-6 sm:grid-cols-5">
        <div className="flex items-center justify-start h-12">
          <a href="https://nextjs.org" aria-label="Next.js Link">
            <Image
              src="/nextjs.svg"
              alt="Next.js Logo"
              className="h-6 sm:h-12 text-white"
              width={48}
              height={48}
            />
          </a>
        </div>
        <div className="flex items-center justify-start h-12">
          <a href="https://vercel.com" aria-label="Vercel.com Link">
            <Image
              src="/vercel.svg"
              alt="Vercel.com Logo"
              className="h-6 text-white"
              width={24}
              height={24}
            />
          </a>
        </div>
        <div className="flex items-center justify-start h-12">
          <a href="https://stripe.com" aria-label="stripe.com Link">
            <Image
              src="/stripe.svg"
              alt="stripe.com Logo"
              className="h-12 text-white"
              width={48}
              height={48}
            />
          </a>
        </div>
        <div className="flex items-center justify-start h-12">
          <a href="https://supabase.io" aria-label="supabase.io Link">
            <Image
              src="/supabase.svg"
              alt="supabase.io Logo"
              className="h-10 text-white"
              width={40}
              height={40}
            />
          </a>
        </div>
        <div className="flex items-center justify-start h-12">
          <a href="https://github.com" aria-label="github.com Link">
            <Image
              src="/github.svg"
              alt="github.com Logo"
              className="h-8 text-white"
              width={32}
              height={32}
            />
          </a>
        </div>
      </div>
    </div>
  );
}
