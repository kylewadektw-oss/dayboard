/**
 * Dayboard - Family Management Platform
 * 
 * © 2025 BentLo Labs LLC. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This source code is the proprietary and confidential property of BentLo Labs LLC.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * @company BentLo Labs LLC
 * @product Dayboard
 * @license Proprietary
 */

import { Metadata } from 'next';
import { Toaster } from '@/components/ui/Toasts/toaster';
import LoggerProvider from '@/components/providers/LoggerProvider';
import CodeProtectionProvider from '@/components/providers/CodeProtectionProvider';
import ClientAuthWrapper from '../components/providers/ClientAuthWrapper';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import 'styles/main.css';

const title = 'Dayboard - Household Command Center';
const description = 'Proprietary household command center application. Copyright 2025 Kyle Wade. All rights reserved.';

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description
  },
  other: {
    'copyright': 'Copyright 2025 Kyle Wade. All rights reserved.',
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
        <meta name="copyright" content="Copyright 2025 Kyle Wade. All rights reserved." />
        <meta name="license" content="Proprietary - Unauthorized copying prohibited" />
      </head>
      <body className="bg-black">
        <CodeProtectionProvider />
        <ClientAuthWrapper>
          <LoggerProvider>
            {children}
          </LoggerProvider>
        </ClientAuthWrapper>
        <Suspense>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
