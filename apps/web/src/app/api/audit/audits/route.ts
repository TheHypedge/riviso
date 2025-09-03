import { NextRequest, NextResponse } from 'next/server'
import { auditQueries } from '../../../../lib/database'

// Try multiple backend URLs in order of preference
const BACKEND_URLS = [
  process.env.BACKEND_URL,
  process.env.RAILWAY_BACKEND_URL,
  'https://riviso.onrender.com', // Render backend URL
  'https://riviso-production.up.railway.app', // Common Railway URL pattern
  'http://localhost:8000' // Fallback for local development
].filter(Boolean)

const BACKEND_URL = BACKEND_URLS[0] || 'https://riviso.onrender.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, userId, device = 'mobile' } = body
    
    console.log(`Attempting to connect to backend: ${BACKEND_URL}`)
    
    const response = await fetch(`${BACKEND_URL}/audits/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log(`Backend response status: ${response.status}`)

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (jsonError) {
        // If response is not JSON (e.g., HTML error page), get text
        const errorText = await response.text()
        console.error('Backend returned non-JSON error:', errorText)
        return NextResponse.json(
          { detail: `Backend error: ${response.status} ${response.statusText}` },
          { status: response.status }
        )
      }
      console.error('Backend error:', errorData)
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to start audit' },
        { status: response.status }
      )
    }

    let data
    try {
      data = await response.json()
    } catch (jsonError) {
      console.error('Failed to parse backend response as JSON:', jsonError)
      const responseText = await response.text()
      console.error('Backend response text:', responseText)
      return NextResponse.json(
        { detail: 'Backend returned invalid JSON response' },
        { status: 500 }
      )
    }

    // Track audit in database if user is logged in
    if (userId && url) {
      const auditId = data.id || Date.now().toString()
      const createdAt = new Date().toISOString()
      
      auditQueries.create.run(
        auditId,
        userId,
        url,
        'pending',
        createdAt,
        device
      )
      console.log('Audit tracked in database for user:', userId)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    console.error('Backend URL attempted:', BACKEND_URL)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { detail: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    
    const response = await fetch(`${BACKEND_URL}/audits/${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (jsonError) {
        const errorText = await response.text()
        console.error('Backend returned non-JSON error:', errorText)
        return NextResponse.json(
          { detail: `Backend error: ${response.status} ${response.statusText}` },
          { status: response.status }
        )
      }
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to fetch audits' },
        { status: response.status }
      )
    }

    let data
    try {
      data = await response.json()
    } catch (jsonError) {
      console.error('Failed to parse backend response as JSON:', jsonError)
      const responseText = await response.text()
      console.error('Backend response text:', responseText)
      return NextResponse.json(
        { detail: 'Backend returned invalid JSON response' },
        { status: 500 }
      )
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { detail: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}
