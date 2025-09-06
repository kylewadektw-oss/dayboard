// Test script to check if authentication logs are being saved to database
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseLogs() {
  console.log('🔍 Checking recent authentication logs in database...')
  
  try {
    const { data, error } = await supabase
      .from('application_logs')
      .select('*')
      .or('message.ilike.%auth%,message.ilike.%oauth%,message.ilike.%sign%,component.eq.Auth')
      .order('timestamp', { ascending: false })
      .limit(20)

    if (error) {
      console.error('❌ Database query error:', error)
      return
    }

    console.log(`📊 Found ${data?.length || 0} authentication-related logs`)
    
    if (data && data.length > 0) {
      console.log('📝 Recent auth logs:')
      data.forEach((log, index) => {
        console.log(`${index + 1}. [${log.level?.toUpperCase()}] ${log.message}`)
        console.log(`   Time: ${log.timestamp}`)
        console.log(`   Component: ${log.component || 'N/A'}`)
        console.log('---')
      })
    } else {
      console.log('⚠️ No authentication logs found in database')
      console.log('💡 This suggests server-side logging might not be working')
    }

    // Also check if the table exists and has any logs at all
    const { data: allLogs, error: allError } = await supabase
      .from('application_logs')
      .select('id, level, message, component, timestamp')
      .order('timestamp', { ascending: false })
      .limit(5)

    if (allError) {
      console.error('❌ Error checking all logs:', allError)
    } else {
      console.log(`\n📈 Total recent logs in database: ${allLogs?.length || 0}`)
      if (allLogs && allLogs.length > 0) {
        console.log('🔗 Recent logs (any type):')
        allLogs.forEach((log, index) => {
          console.log(`${index + 1}. [${log.level?.toUpperCase()}] ${log.message?.substring(0, 50)}...`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

testDatabaseLogs()
