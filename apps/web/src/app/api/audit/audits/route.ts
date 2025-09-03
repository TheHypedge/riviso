import { NextRequest, NextResponse } from 'next/server'

// Try multiple backend URLs in order of preference
const BACKEND_URLS = [
  process.env.BACKEND_URL,
  process.env.RAILWAY_BACKEND_URL,
  'https://riviso-production.up.railway.app', // Common Railway URL pattern
  'http://localhost:8000' // Fallback for local development
].filter(Boolean)

const BACKEND_URL = BACKEND_URLS[0] || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log(`Attempting to connect to backend: ${BACKEND_URL}`)
    
    const response = await fetch(`${BACKEND_URL}/audits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log(`Backend response status: ${response.status}`)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Backend error:', errorData)
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to start audit' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    console.error('Backend URL attempted:', BACKEND_URL)
    return NextResponse.json(
      { detail: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    
    const response = await fetch(`${BACKEND_URL}/audits${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to fetch audits' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
