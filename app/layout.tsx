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
import { headers } from 'next/headers';
import { Toaster } from '@/components/ui/Toasts/toaster';
import LoggerProvider from '@/components/providers/LoggerProvider';
import CodeProtectionProvider from '@/components/providers/CodeProtectionProvider';
import ClientAuthWrapper from '../components/providers/ClientAuthWrapper';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import 'styles/main.css';

// Dynamic metadata generation based on subdomain
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  // Extract subdomain
  const parts = host.split('.');
  let subdomain = '';
  
  if (parts.length >= 3) {
    subdomain = parts[0];
  } else if (parts.length === 2 && host.includes('localhost')) {
    subdomain = parts[0] === 'localhost' ? '' : parts[0];
  }

  // Generate metadata based on subdomain
  switch (subdomain.toLowerCase()) {
    case 'dayboard':
      return {
        metadataBase: new URL(getURL()),
        title: 'Dayboard - Complete Household OS',
        description: 'Unify meal planning, household coordination, project tracking, and family organization into one intelligent command center.',
        openGraph: {
          title: 'Dayboard - Complete Household OS',
          description: 'Unify meal planning, household coordination, project tracking, and family organization into one intelligent command center.',
          images: ['/dayboard-og.png']
        },
        other: {
          copyright: 'Copyright 2025 BentLo Labs LLC. All rights reserved.',
          license: 'Proprietary - Unauthorized copying prohibited'
        }
      };
    
    case 'logs':
      return {
        metadataBase: new URL(getURL()),
        title: 'BentLo Labs - System Monitoring Dashboard',
        description: 'Real-time system monitoring, analytics, and operational intelligence platform.',
        openGraph: {
          title: 'BentLo Labs - System Monitoring Dashboard',
          description: 'Real-time system monitoring, analytics, and operational intelligence platform.'
        },
        other: {
          copyright: 'Copyright 2025 BentLo Labs LLC. All rights reserved.',
          license: 'Proprietary - Unauthorized access prohibited'
        },
        robots: 'noindex, nofollow' // Logs dashboard should not be indexed
      };
    
    default:
      // Main company site
      return {
        metadataBase: new URL(getURL()),
        title: 'BentLo Labs - Software Design Group',
        description: 'We craft intelligent software solutions that solve real-world problems. From household management platforms to enterprise applications.',
        openGraph: {
          title: 'BentLo Labs - Software Design Group',
          description: 'We craft intelligent software solutions that solve real-world problems. From household management platforms to enterprise applications.',
          images: ['/bentlolabs-og.png']
        },
        other: {
          copyright: 'Copyright 2025 BentLo Labs LLC. All rights reserved.',
          license: 'Proprietary - Unauthorized copying prohibited'
        }
      };
  }
}

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        {/* Anti-scraping meta tags */}
        <meta
          name="robots"
          content="noindex, nofollow, noarchive, nosnippet, noimageindex"
        />
        <meta
          name="googlebot"
          content="noindex, nofollow, noarchive, nosnippet, noimageindex"
        />
        <meta
          name="bingbot"
          content="noindex, nofollow, noarchive, nosnippet, noimageindex"
        />
        <meta
          name="copyright"
          content="Copyright 2025 BentLo Labs LLC. All rights reserved."
        />
        <meta
          name="license"
          content="Proprietary - Unauthorized copying prohibited"
        />
      </head>
      <body className="bg-black">
        <CodeProtectionProvider />
        <ClientAuthWrapper>
          <LoggerProvider>{children}</LoggerProvider>
        </ClientAuthWrapper>
        <Suspense>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
