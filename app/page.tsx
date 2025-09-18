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

import { headers } from 'next/headers'
import CompanyLandingPage from '@/components/pages/CompanyLandingPage'
import DayboardLandingPage from '@/components/pages/DayboardLandingPage'
import LogsDashboardPage from '@/components/pages/LogsDashboardPage'

export default async function HomePage() {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  
  // Extract subdomain
  const parts = host.split('.')
  let subdomain = ''
  
  // Handle different host patterns
  if (parts.length >= 3) {
    // subdomain.bentlolabs.com or subdomain.domain.com
    subdomain = parts[0]
  } else if (parts.length === 2 && host.includes('localhost')) {
    // localhost:3000 with subdomain simulation
    // For local testing, you can use: dayboard.localhost:3000
    subdomain = parts[0] === 'localhost' ? '' : parts[0]
  }
  
  console.log(`[Subdomain Router] host=${host}, subdomain=${subdomain}`)
  
  // Route based on subdomain
  switch (subdomain.toLowerCase()) {
    case 'dayboard':
      console.log('[Subdomain Router] Serving Dayboard product page')
      return <DayboardLandingPage />
    
    case 'logs':
      console.log('[Subdomain Router] Serving logs dashboard')
      return <LogsDashboardPage />
    
    case '':
    case 'www':
    default:
      console.log('[Subdomain Router] Serving BentLo Labs company page')
      return <CompanyLandingPage />
  }
}