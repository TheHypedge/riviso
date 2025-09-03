import { NextRequest, NextResponse } from 'next/server'

// Try multiple backend URLs in order of preference
const BACKEND_URLS = [
  process.env.BACKEND_URL,
  process.env.RAILWAY_BACKEND_URL,
  'https://riviso.onrender.com', // Render backend URL
  'https://riviso-production.up.railway.app', // Common Railway URL pattern
  'http://localhost:8000' // Fallback for local development
].filter(Boolean)

const BACKEND_URL = BACKEND_URLS[0] || 'https://riviso.onrender.com'

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
        { detail: errorData.detail || 'Failed to fetch audit' },
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
