import { NextRequest, NextResponse } from 'next/server'

// Try multiple backend URLs in order of preference
const BACKEND_URLS = [
  process.env.BACKEND_URL,
  process.env.RAILWAY_BACKEND_URL,
  'https://riviso-production.up.railway.app', // Common Railway URL pattern
  'http://localhost:8000' // Fallback for local development
].filter(Boolean)

const BACKEND_URL = BACKEND_URLS[0] || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const response = await fetch(`${BACKEND_URL}/audits/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to fetch audit' },
        { status: response.status }
      )
    }

    const data = await response.json()
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
