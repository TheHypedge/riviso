import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Get the backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://riviso-api-production.up.railway.app'
    
    // Call the backend API to get tool detection
    const response = await fetch(`${backendUrl}/audits/detect-tools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.detail || 'Failed to analyze website' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // If the test endpoint returns mock data, we need to create a real analysis
    // For now, we'll return the test data, but in production this should call a real tool detection endpoint
    return NextResponse.json({
      status: 'success',
      tools_detected: data.tools_detected || 0,
      tools: data.tools || []
    })
    
  } catch (error) {
    console.error('Error in resources checker:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
