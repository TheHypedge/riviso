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

    // Validate URL
    let fullUrl = url.trim()
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = `https://${fullUrl}`
    }

    try {
      new URL(fullUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Get backend URL from environment
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    // For now, we'll skip on-page data and focus on PageSpeed Insights
    const onPageData = {
      title: 'Website Analysis',
      description: 'Comprehensive website analysis',
      favicon: null,
      finalUrl: fullUrl
    }

    // Fetch comprehensive website analysis from our backend
    const analysisResponse = await fetch(`${backendUrl}/audits/website-analyzer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: fullUrl })
    })

    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.json()
      return NextResponse.json(
        { error: errorData.detail || 'Failed to analyze website' },
        { status: analysisResponse.status }
      )
    }

    const analysisData = await analysisResponse.json()

    return NextResponse.json({
      status: 'success',
      website_info: analysisData.website_info,
      mobile_data: analysisData.mobile_data,
      desktop_data: analysisData.desktop_data,
      analysis_timestamp: analysisData.analysis_timestamp
    })

  } catch (error) {
    console.error('Website Analyzer API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

