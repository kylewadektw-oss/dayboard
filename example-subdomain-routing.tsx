import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

// Import your different page components
import CompanyLandingPage from '@/components/pages/CompanyLandingPage'
import DayboardLandingPage from '@/components/pages/DayboardLandingPage'
import LogsDashboardPage from '@/components/pages/LogsDashboardPage'

export default async function HomePage() {
  const headersList = headers()
  const host = headersList.get('host') || ''
  
  // Extract subdomain
  const parts = host.split('.')
  const subdomain = parts.length > 2 ? parts[0] : ''
  
  console.log(`Routing request: host=${host}, subdomain=${subdomain}`)
  
  // Route based on subdomain
  switch (subdomain) {
    case 'dayboard':
      return <DayboardLandingPage />
    case 'logs':
      return <LogsDashboardPage />
    case '':
    case 'www':
    default:
      // Main company site (bentlolabs.com or www.bentlolabs.com)
      return <CompanyLandingPage />
  }
}