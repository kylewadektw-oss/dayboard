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


import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addSideColumn() {
  console.log('🚀 Adding side column to application_logs table...')
  
  try {
    // First check if the side column already exists
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'application_logs')
      .eq('column_name', 'side')
    
    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError)
      return
    }
    
    if (columns && columns.length > 0) {
      console.log('✅ Side column already exists!')
      return
    }
    
    console.log('📝 Creating log_side enum type...')
    const { error: enumError } = await supabase.rpc('exec_sql', {
      sql: "CREATE TYPE log_side AS ENUM ('client', 'server');"
    })
    
    if (enumError && !enumError.message.includes('already exists')) {
      console.error('❌ Error creating enum:', enumError)
      return
    }
    
    console.log('📝 Adding side column...')
    const { error: columnError } = await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE application_logs ADD COLUMN side log_side DEFAULT 'client';"
    })
    
    if (columnError) {
      console.error('❌ Error adding column:', columnError)
      return
    }
    
    console.log('📝 Creating index...')
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: "CREATE INDEX IF NOT EXISTS idx_application_logs_side ON application_logs(side);"
    })
    
    if (indexError) {
      console.error('❌ Error creating index:', indexError)
      return
    }
    
    console.log('✅ Side column added successfully!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

addSideColumn()
