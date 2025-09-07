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


import { Metadata } from 'next';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';
import { Toaster } from '@/components/ui/Toasts/toaster';
import LoggerProvider from '@/components/providers/LoggerProvider';
import CodeProtectionProvider from '@/components/providers/CodeProtectionProvider';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import 'styles/main.css';

const title = 'Dayboard - Household Command Center';
const description = 'Proprietary household command center application. © 2025 Kyle Wade. All rights reserved.';

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description
  },
  other: {
    'copyright': '© 2025 Kyle Wade. All rights reserved.',
    'license': 'Proprietary - Unauthorized copying prohibited'
  }
};

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        {/* Anti-scraping meta tags */}
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="bingbot" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="copyright" content="© 2025 Kyle Wade. All rights reserved." />
        <meta name="license" content="Proprietary - Unauthorized copying prohibited" />
      </head>
      <body className="bg-black">
        <CodeProtectionProvider />
        <LoggerProvider>
          {children}
        </LoggerProvider>
        <Suspense>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
