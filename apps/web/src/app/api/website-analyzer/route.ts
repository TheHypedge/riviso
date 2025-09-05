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
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'

    // For now, we'll skip on-page data and focus on PageSpeed Insights
    const onPageData = {
      title: 'Website Analysis',
      description: 'Comprehensive website analysis',
      favicon: null,
      finalUrl: fullUrl
    }

    // Fetch PageSpeed Insights data from our backend
    const pagespeedResponse = await fetch(`${backendUrl}/audits/pagespeed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: fullUrl })
    })

    let pagespeedData = null
    if (pagespeedResponse.ok) {
      pagespeedData = await pagespeedResponse.json()
    }

    // Calculate overall score
    let overallScore = 0
    if (pagespeedData?.performance) {
      const performance = pagespeedData.performance
      overallScore = Math.round((performance.performance_score + performance.accessibility_score + performance.best_practices_score + performance.seo_score) / 4)
    }

    return NextResponse.json({
      status: 'success',
      url: fullUrl,
      finalUrl: onPageData.finalUrl,
      title: onPageData.title,
      description: onPageData.description,
      favicon: onPageData.favicon,
      score: overallScore,
      onPageData,
      pagespeedData
    })

  } catch (error) {
    console.error('Website Analyzer API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

