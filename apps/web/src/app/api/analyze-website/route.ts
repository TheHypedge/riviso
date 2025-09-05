import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'success', 
    message: 'Website Analysis API is working',
    methods: ['POST'],
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Simple test response for now
    return NextResponse.json({
      status: 'success',
      message: 'POST method is working',
      receivedUrl: url,
      timestamp: new Date().toISOString(),
      test: true
    })

  } catch (error) {
    console.error('Website Analysis API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
