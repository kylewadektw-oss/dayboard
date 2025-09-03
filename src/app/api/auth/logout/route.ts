import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
  try {
    // Clear the session cookie
    const response = NextResponse.json({ success: true })
    response.cookies.delete('dayboard_session')
    
    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
