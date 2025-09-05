import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'success', 
    message: 'Website Analyzer API is working - Updated',
    methods: ['POST'],
    timestamp: new Date().toISOString(),
    version: '1.0.1'
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
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Website Analyzer API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

