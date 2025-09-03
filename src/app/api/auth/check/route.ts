import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('dayboard_session')
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ authenticated: false })
    }

    const sessionData = JSON.parse(sessionCookie.value)
    
    // Check if session is still valid (not expired)
    const sessionAge = Date.now() - sessionData.timestamp
    const maxAge = 60 * 60 * 24 * 7 * 1000 // 7 days in milliseconds
    
    if (sessionAge > maxAge) {
      // Session expired
      const response = NextResponse.json({ authenticated: false })
      response.cookies.delete('dayboard_session')
      return response
    }

    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: sessionData.id,
        email: sessionData.email,
        name: sessionData.name,
        picture: sessionData.picture
      }
    })

  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ authenticated: false })
  }
}
