import { NextRequest, NextResponse } from 'next/server'
import { auditQueries } from '@/lib/database'

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
    console.log('🔍 API called - analyze-website')
    const { url, userId } = await request.json()
    console.log('📊 Request data:', { url, userId })

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Create audit record
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    console.log('🆔 Generated audit ID:', auditId)
    
    try {
      console.log('💾 Attempting to create audit record...')
      if (!auditQueries || !auditQueries.create) {
        console.error('❌ Audit queries not available')
      } else {
        auditQueries.create.run(
          auditId,
          userId || '1', // Default to user 1 if no userId provided
          url,
          'pending', // status
          now, // createdAt
          null, // completedAt
          'mobile', // device
          'website_analyzer' // tool_type
        )
        console.log('✅ Audit record created:', auditId)
      }
    } catch (auditError) {
      console.error('❌ Failed to create audit record:', auditError)
      // Continue with analysis even if audit tracking fails
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
      // Update audit record with completion status and scores for mock data
      try {
        const completedAt = new Date().toISOString()
        const avgPerformanceScore = Math.round((82 + 88) / 2) // mobile + desktop performance
        const avgSeoScore = Math.round((88 + 90) / 2) // mobile + desktop seo
        const avgAccessibilityScore = Math.round((95 + 98) / 2) // mobile + desktop accessibility
        const avgBestPracticesScore = Math.round((90 + 92) / 2) // mobile + desktop best practices
        
        auditQueries.updateWithScores.run(
          avgPerformanceScore, // performance_score
          avgSeoScore, // seo_score
          avgAccessibilityScore, // accessibility_score
          avgBestPracticesScore, // best_practices_score
          'completed',
          completedAt,
          auditId
        )
        console.log('✅ Mock audit record updated with scores:', auditId)
      } catch (auditError) {
        console.error('❌ Failed to update mock audit record:', auditError)
      }

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
          accessibility_score: 95,
          best_practices_score: 90,
          seo_score: 88,
          first_contentful_paint: 1.2,
          largest_contentful_paint: 2.1,
          cumulative_layout_shift: 0.05,
          first_input_delay: 50,
          time_to_interactive: 3.2,
          total_blocking_time: 150,
          speed_index: 2.8,
          first_meaningful_paint: 1.5,
          lcp_score: 0.8,
          fcp_score: 0.9,
          cls_score: 0.95,
          fid_score: 0.85,
          display_values: {
            first_contentful_paint: '1.2 s',
            largest_contentful_paint: '2.1 s',
            cumulative_layout_shift: '0.05',
            first_input_delay: '50 ms',
            total_blocking_time: '150 ms',
            speed_index: '2.8 s',
            time_to_interactive: '3.2 s',
            first_meaningful_paint: '1.5 s'
          },
          resource_metrics: {
            total_byte_weight: 1024000,
            unused_css_rules: 15,
            unused_javascript: 8,
            render_blocking_resources: 3,
            efficient_animated_content: 2
          },
          opportunities: [
            {
              id: 'unused-css-rules',
              title: 'Remove unused CSS',
              description: 'Remove unused CSS rules to reduce file size',
              score: 0.8,
              numericValue: 15000,
              displayValue: '15 kB',
              wastedMs: 200
            }
          ],
          diagnostics: [
            {
              id: 'render-blocking-resources',
              title: 'Eliminate render-blocking resources',
              description: 'Resources are blocking the first paint of your page',
              score: 0.7,
              displayValue: '3 resources'
            }
          ],
          strategy: 'mobile',
          data_source: 'Mock Data',
          fetch_time: new Date().toISOString(),
          final_url: fullUrl,
          requested_url: fullUrl
        },
        desktop_data: {
          status: 'success',
          url: fullUrl,
          performance_score: 88,
          accessibility_score: 98,
          best_practices_score: 92,
          seo_score: 90,
          first_contentful_paint: 0.8,
          largest_contentful_paint: 1.5,
          cumulative_layout_shift: 0.02,
          first_input_delay: 30,
          time_to_interactive: 2.1,
          total_blocking_time: 80,
          speed_index: 1.8,
          first_meaningful_paint: 1.0,
          lcp_score: 0.95,
          fcp_score: 0.98,
          cls_score: 0.98,
          fid_score: 0.92,
          display_values: {
            first_contentful_paint: '0.8 s',
            largest_contentful_paint: '1.5 s',
            cumulative_layout_shift: '0.02',
            first_input_delay: '30 ms',
            total_blocking_time: '80 ms',
            speed_index: '1.8 s',
            time_to_interactive: '2.1 s',
            first_meaningful_paint: '1.0 s'
          },
          resource_metrics: {
            total_byte_weight: 850000,
            unused_css_rules: 8,
            unused_javascript: 5,
            render_blocking_resources: 2,
            efficient_animated_content: 1
          },
          opportunities: [
            {
              id: 'unused-css-rules',
              title: 'Remove unused CSS',
              description: 'Remove unused CSS rules to reduce file size',
              score: 0.9,
              numericValue: 8000,
              displayValue: '8 kB',
              wastedMs: 100
            }
          ],
          diagnostics: [
            {
              id: 'render-blocking-resources',
              title: 'Eliminate render-blocking resources',
              description: 'Resources are blocking the first paint of your page',
              score: 0.8,
              displayValue: '2 resources'
            }
          ],
          strategy: 'desktop',
          data_source: 'Mock Data',
          fetch_time: new Date().toISOString(),
          final_url: fullUrl,
          requested_url: fullUrl
        },
        analysis_timestamp: new Date().toISOString(),
        note: 'Mock data - PageSpeed API key not configured - Updated'
      })
    }

    // Call Google PageSpeed Insights API directly
    const mobileResponse = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fullUrl)}&strategy=mobile&key=${apiKey}&_t=${Date.now()}`
    )
    
    const desktopResponse = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fullUrl)}&strategy=desktop&key=${apiKey}&_t=${Date.now()}`
    )

    if (!mobileResponse.ok || !desktopResponse.ok) {
      const mobileError = !mobileResponse.ok ? `Mobile: ${mobileResponse.status} ${mobileResponse.statusText}` : ''
      const desktopError = !desktopResponse.ok ? `Desktop: ${desktopResponse.status} ${desktopResponse.statusText}` : ''
      const errorMessage = `Failed to fetch PageSpeed Insights data. ${mobileError} ${desktopError}`.trim()
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }

    const mobileData = await mobileResponse.json()
    const desktopData = await desktopResponse.json()

    // Extract performance scores
    const mobileScore = mobileData.lighthouseResult?.categories?.performance?.score * 100 || 0
    const desktopScore = desktopData.lighthouseResult?.categories?.performance?.score * 100 || 0
    const overallScore = Math.round((mobileScore + desktopScore) / 2)

    // Extract all category scores
    const mobileCategories = mobileData.lighthouseResult?.categories || {}
    const desktopCategories = desktopData.lighthouseResult?.categories || {}

    const mobileAccessibilityScore = mobileCategories.accessibility?.score * 100 || 0
    const mobileBestPracticesScore = mobileCategories['best-practices']?.score * 100 || 0
    const mobileSeoScore = mobileCategories.seo?.score * 100 || 0

    const desktopAccessibilityScore = desktopCategories.accessibility?.score * 100 || 0
    const desktopBestPracticesScore = desktopCategories['best-practices']?.score * 100 || 0
    const desktopSeoScore = desktopCategories.seo?.score * 100 || 0

    // Extract Core Web Vitals and other metrics
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

    // Mobile metrics
    const mobileLCP = extractMetric(mobileAudits, 'largest-contentful-paint')
    const mobileFCP = extractMetric(mobileAudits, 'first-contentful-paint')
    const mobileCLS = extractMetric(mobileAudits, 'cumulative-layout-shift')
    const mobileFID = extractMetric(mobileAudits, 'max-potential-fid')
    const mobileTTI = extractMetric(mobileAudits, 'interactive')
    const mobileTBT = extractMetric(mobileAudits, 'total-blocking-time')
    const mobileSpeedIndex = extractMetric(mobileAudits, 'speed-index')
    const mobileFMP = extractMetric(mobileAudits, 'first-meaningful-paint')

    // Desktop metrics
    const desktopLCP = extractMetric(desktopAudits, 'largest-contentful-paint')
    const desktopFCP = extractMetric(desktopAudits, 'first-contentful-paint')
    const desktopCLS = extractMetric(desktopAudits, 'cumulative-layout-shift')
    const desktopFID = extractMetric(desktopAudits, 'max-potential-fid')
    const desktopTTI = extractMetric(desktopAudits, 'interactive')
    const desktopTBT = extractMetric(desktopAudits, 'total-blocking-time')
    const desktopSpeedIndex = extractMetric(desktopAudits, 'speed-index')
    const desktopFMP = extractMetric(desktopAudits, 'first-meaningful-paint')

    // Extract resource metrics
    const mobileResourceMetrics = {
      total_byte_weight: mobileAudits['total-byte-weight']?.numericValue || 0,
      unused_css_rules: mobileAudits['unused-css-rules']?.numericValue || 0,
      unused_javascript: mobileAudits['unused-javascript']?.numericValue || 0,
      render_blocking_resources: mobileAudits['render-blocking-resources']?.numericValue || 0,
      efficient_animated_content: mobileAudits['efficient-animated-content']?.numericValue || 0
    }

    const desktopResourceMetrics = {
      total_byte_weight: desktopAudits['total-byte-weight']?.numericValue || 0,
      unused_css_rules: desktopAudits['unused-css-rules']?.numericValue || 0,
      unused_javascript: desktopAudits['unused-javascript']?.numericValue || 0,
      render_blocking_resources: desktopAudits['render-blocking-resources']?.numericValue || 0,
      efficient_animated_content: desktopAudits['efficient-animated-content']?.numericValue || 0
    }

    // Extract opportunities and diagnostics
    const extractOpportunities = (audits: any) => {
      const opportunities: Array<{
        id: string
        title: string
        description: string
        score: number
        numericValue: number
        displayValue: string
        wastedMs: number
      }> = []
      const opportunityKeys = [
        'unused-css-rules', 'unused-javascript', 'render-blocking-resources',
        'unused-javascript', 'efficient-animated-content', 'uses-optimized-images',
        'uses-webp-images', 'uses-text-compression', 'uses-responsive-images'
      ]
      
      opportunityKeys.forEach(key => {
        const audit = audits[key]
        if (audit && audit.score < 1 && audit.numericValue > 0) {
          opportunities.push({
            id: key,
            title: audit.title,
            description: audit.description,
            score: audit.score,
            numericValue: audit.numericValue,
            displayValue: audit.displayValue,
            wastedMs: audit.details?.overallSavingsMs || 0
          })
        }
      })
      
      return opportunities.slice(0, 10)
    }

    const extractDiagnostics = (audits: any) => {
      const diagnostics: Array<{
        id: string
        title: string
        description: string
        score: number
        displayValue: string
      }> = []
      const diagnosticKeys = [
        'render-blocking-resources', 'uses-optimized-images', 'uses-text-compression',
        'uses-webp-images', 'uses-responsive-images', 'efficient-animated-content'
      ]
      
      diagnosticKeys.forEach(key => {
        const audit = audits[key]
        if (audit) {
          diagnostics.push({
            id: key,
            title: audit.title,
            description: audit.description,
            score: audit.score,
            displayValue: audit.displayValue
          })
        }
      })
      
      return diagnostics.slice(0, 10)
    }

    const mobileOpportunities = extractOpportunities(mobileAudits)
    const mobileDiagnostics = extractDiagnostics(mobileAudits)
    const desktopOpportunities = extractOpportunities(desktopAudits)
    const desktopDiagnostics = extractDiagnostics(desktopAudits)

    const response = NextResponse.json({
      status: 'success',
      website_info: {
        url: fullUrl,
        final_url: mobileData.lighthouseResult?.finalUrl || fullUrl,
        title: `Website Analysis - ${fullUrl}`,
        description: `Comprehensive performance analysis for ${fullUrl}`,
        favicon: `https://www.google.com/s2/favicons?domain=${new URL(fullUrl).hostname}`,
        score: overallScore
      },
      mobile_data: {
        status: 'success',
        url: fullUrl,
        performance_score: Math.round(mobileScore),
        accessibility_score: Math.round(mobileAccessibilityScore),
        best_practices_score: Math.round(mobileBestPracticesScore),
        seo_score: Math.round(mobileSeoScore),
        first_contentful_paint: mobileFCP.value,
        largest_contentful_paint: mobileLCP.value,
        cumulative_layout_shift: mobileCLS.value,
        first_input_delay: mobileFID.value,
        time_to_interactive: mobileTTI.value,
        total_blocking_time: mobileTBT.value,
        speed_index: mobileSpeedIndex.value,
        first_meaningful_paint: mobileFMP.value,
        lcp_score: mobileLCP.score,
        fcp_score: mobileFCP.score,
        cls_score: mobileCLS.score,
        fid_score: mobileFID.score,
        display_values: {
          first_contentful_paint: mobileFCP.displayValue,
          largest_contentful_paint: mobileLCP.displayValue,
          cumulative_layout_shift: mobileCLS.displayValue,
          first_input_delay: mobileFID.displayValue,
          total_blocking_time: mobileTBT.displayValue,
          speed_index: mobileSpeedIndex.displayValue,
          time_to_interactive: mobileTTI.displayValue,
          first_meaningful_paint: mobileFMP.displayValue
        },
        resource_metrics: mobileResourceMetrics,
        opportunities: mobileOpportunities,
        diagnostics: mobileDiagnostics,
        strategy: 'mobile',
        data_source: 'Google PageSpeed Insights API',
        fetch_time: mobileData.lighthouseResult?.fetchTime || new Date().toISOString(),
        final_url: mobileData.lighthouseResult?.finalUrl || fullUrl,
        requested_url: mobileData.lighthouseResult?.requestedUrl || fullUrl
      },
      desktop_data: {
        status: 'success',
        url: fullUrl,
        performance_score: Math.round(desktopScore),
        accessibility_score: Math.round(desktopAccessibilityScore),
        best_practices_score: Math.round(desktopBestPracticesScore),
        seo_score: Math.round(desktopSeoScore),
        first_contentful_paint: desktopFCP.value,
        largest_contentful_paint: desktopLCP.value,
        cumulative_layout_shift: desktopCLS.value,
        first_input_delay: desktopFID.value,
        time_to_interactive: desktopTTI.value,
        total_blocking_time: desktopTBT.value,
        speed_index: desktopSpeedIndex.value,
        first_meaningful_paint: desktopFMP.value,
        lcp_score: desktopLCP.score,
        fcp_score: desktopFCP.score,
        cls_score: desktopCLS.score,
        fid_score: desktopFID.score,
        display_values: {
          first_contentful_paint: desktopFCP.displayValue,
          largest_contentful_paint: desktopLCP.displayValue,
          cumulative_layout_shift: desktopCLS.displayValue,
          first_input_delay: desktopFID.displayValue,
          total_blocking_time: desktopTBT.displayValue,
          speed_index: desktopSpeedIndex.displayValue,
          time_to_interactive: desktopTTI.displayValue,
          first_meaningful_paint: desktopFMP.displayValue
        },
        resource_metrics: desktopResourceMetrics,
        opportunities: desktopOpportunities,
        diagnostics: desktopDiagnostics,
        strategy: 'desktop',
        data_source: 'Google PageSpeed Insights API',
        fetch_time: desktopData.lighthouseResult?.fetchTime || new Date().toISOString(),
        final_url: desktopData.lighthouseResult?.finalUrl || fullUrl,
        requested_url: desktopData.lighthouseResult?.requestedUrl || fullUrl
      },
      analysis_timestamp: new Date().toISOString()
    })

    // Update audit record with completion status and scores
    try {
      const completedAt = new Date().toISOString()
      const avgPerformanceScore = Math.round((mobileScore + desktopScore) / 2)
      const avgSeoScore = Math.round((mobileSeoScore + desktopSeoScore) / 2)
      const avgAccessibilityScore = Math.round((mobileAccessibilityScore + desktopAccessibilityScore) / 2)
      const avgBestPracticesScore = Math.round((mobileBestPracticesScore + desktopBestPracticesScore) / 2)
      
      auditQueries.updateWithScores.run(
        avgPerformanceScore, // performance_score
        avgSeoScore, // seo_score
        avgAccessibilityScore, // accessibility_score
        avgBestPracticesScore, // best_practices_score
        'completed',
        completedAt,
        auditId
      )
      console.log('✅ Audit record updated with scores:', auditId)
    } catch (auditError) {
      console.error('❌ Failed to update audit record:', auditError)
    }

    // Add cache-busting headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response

  } catch (error) {
    console.error('Website Analysis API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
