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

    // Get PageSpeed Insights API key
    const apiKey = process.env.PAGESPEED_API_KEY
    
    // If no API key, return mock data for testing
    if (!apiKey) {
      return NextResponse.json({
        status: 'success',
        website_info: {
          url: fullUrl,
          final_url: fullUrl,
          title: `Website Analysis - ${fullUrl}`,
          description: `Comprehensive performance analysis for ${fullUrl}`,
          favicon: `https://www.google.com/s2/favicons?domain=${new URL(fullUrl).hostname}`,
          score: 85
        },
        mobile_data: {
          status: 'success',
          url: fullUrl,
          performance_score: 82,
          first_contentful_paint: 1.2,
          largest_contentful_paint: 2.1,
          cumulative_layout_shift: 0.05,
          first_input_delay: 50,
          display_values: {
            first_contentful_paint: '1.2 s',
            largest_contentful_paint: '2.1 s',
            cumulative_layout_shift: '0.05',
            first_input_delay: '50 ms'
          },
          strategy: 'mobile'
        },
        desktop_data: {
          status: 'success',
          url: fullUrl,
          performance_score: 88,
          first_contentful_paint: 0.8,
          largest_contentful_paint: 1.5,
          cumulative_layout_shift: 0.02,
          first_input_delay: 30,
          display_values: {
            first_contentful_paint: '0.8 s',
            largest_contentful_paint: '1.5 s',
            cumulative_layout_shift: '0.02',
            first_input_delay: '30 ms'
          },
          strategy: 'desktop'
        },
        analysis_timestamp: new Date().toISOString(),
        note: 'Mock data - PageSpeed API key not configured'
      })
    }

    // Call Google PageSpeed Insights API directly
    const mobileResponse = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fullUrl)}&strategy=mobile&key=${apiKey}`
    )
    
    const desktopResponse = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fullUrl)}&strategy=desktop&key=${apiKey}`
    )

    if (!mobileResponse.ok || !desktopResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch PageSpeed Insights data' },
        { status: 500 }
      )
    }

    const mobileData = await mobileResponse.json()
    const desktopData = await desktopResponse.json()

    // Extract performance scores
    const mobileScore = mobileData.lighthouseResult?.categories?.performance?.score * 100 || 0
    const desktopScore = desktopData.lighthouseResult?.categories?.performance?.score * 100 || 0
    const overallScore = Math.round((mobileScore + desktopScore) / 2)

    // Extract Core Web Vitals
    const mobileAudits = mobileData.lighthouseResult?.audits || {}
    const desktopAudits = desktopData.lighthouseResult?.audits || {}

    const extractMetric = (audits: any, metric: string) => {
      const audit = audits[metric]
      return {
        value: audit?.numericValue || 0,
        displayValue: audit?.displayValue || 'N/A',
        score: audit?.score || 0
      }
    }

    const mobileLCP = extractMetric(mobileAudits, 'largest-contentful-paint')
    const mobileFCP = extractMetric(mobileAudits, 'first-contentful-paint')
    const mobileCLS = extractMetric(mobileAudits, 'cumulative-layout-shift')
    const mobileFID = extractMetric(mobileAudits, 'max-potential-fid')

    const desktopLCP = extractMetric(desktopAudits, 'largest-contentful-paint')
    const desktopFCP = extractMetric(desktopAudits, 'first-contentful-paint')
    const desktopCLS = extractMetric(desktopAudits, 'cumulative-layout-shift')
    const desktopFID = extractMetric(desktopAudits, 'max-potential-fid')

    return NextResponse.json({
      status: 'success',
      website_info: {
        url: fullUrl,
        final_url: fullUrl,
        title: `Website Analysis - ${fullUrl}`,
        description: `Comprehensive performance analysis for ${fullUrl}`,
        favicon: `https://www.google.com/s2/favicons?domain=${new URL(fullUrl).hostname}`,
        score: overallScore
      },
      mobile_data: {
        status: 'success',
        url: fullUrl,
        performance_score: Math.round(mobileScore),
        first_contentful_paint: mobileFCP.value,
        largest_contentful_paint: mobileLCP.value,
        cumulative_layout_shift: mobileCLS.value,
        first_input_delay: mobileFID.value,
        display_values: {
          first_contentful_paint: mobileFCP.displayValue,
          largest_contentful_paint: mobileLCP.displayValue,
          cumulative_layout_shift: mobileCLS.displayValue,
          first_input_delay: mobileFID.displayValue
        },
        strategy: 'mobile'
      },
      desktop_data: {
        status: 'success',
        url: fullUrl,
        performance_score: Math.round(desktopScore),
        first_contentful_paint: desktopFCP.value,
        largest_contentful_paint: desktopLCP.value,
        cumulative_layout_shift: desktopCLS.value,
        first_input_delay: desktopFID.value,
        display_values: {
          first_contentful_paint: desktopFCP.displayValue,
          largest_contentful_paint: desktopLCP.displayValue,
          cumulative_layout_shift: desktopCLS.displayValue,
          first_input_delay: desktopFID.displayValue
        },
        strategy: 'desktop'
      },
      analysis_timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Website Analysis API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
