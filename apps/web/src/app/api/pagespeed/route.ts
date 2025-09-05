import { NextRequest, NextResponse } from 'next/server';

interface PageSpeedResponse {
  lighthouseResult: {
    categories: {
      performance: { score: number }
      accessibility: { score: number }
      'best-practices': { score: number }
      seo: { score: number }
    }
    audits: {
      'first-contentful-paint': { displayValue: string; numericValue: number }
      'largest-contentful-paint': { displayValue: string; numericValue: number }
      'cumulative-layout-shift': { displayValue: string; numericValue: number }
      'first-input-delay': { displayValue: string; numericValue: number }
      'total-blocking-time': { displayValue: string; numericValue: number }
      'speed-index': { displayValue: string; numericValue: number }
      'interactive': { displayValue: string; numericValue: number }
    }
    configSettings: {
      formFactor: 'mobile' | 'desktop'
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url') || '';
    const strategy = searchParams.get('strategy') || 'mobile'; // mobile or desktop
    
    if (!url) {
      return NextResponse.json(
        { error: 'Provide ?url=https://example.com' },
        { status: 400 }
      );
    }
    
    if (!/^https?:\/\//i.test(url)) {
      return NextResponse.json(
        { error: 'URL must start with http:// or https://' },
        { status: 400 }
      );
    }

    // Google PageSpeed Insights API endpoint
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google PageSpeed Insights API key not configured' },
        { status: 500 }
      );
    }

    const pageSpeedUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;
    
    const response = await fetch(pageSpeedUrl);
    
    if (!response.ok) {
      throw new Error(`PageSpeed API error: ${response.status}`);
    }
    
    const data: PageSpeedResponse = await response.json();
    
    // Extract and format the data
    const categories = data.lighthouseResult.categories;
    const audits = data.lighthouseResult.audits;
    
    const result = {
      status: 'success',
      url: url,
      strategy: strategy,
      scores: {
        performance: Math.round((categories.performance.score || 0) * 100),
        accessibility: Math.round((categories.accessibility.score || 0) * 100),
        bestPractices: Math.round((categories['best-practices'].score || 0) * 100),
        seo: Math.round((categories.seo.score || 0) * 100)
      },
      metrics: {
        firstContentfulPaint: audits['first-contentful-paint']?.numericValue || 0,
        largestContentfulPaint: audits['largest-contentful-paint']?.numericValue || 0,
        cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue || 0,
        firstInputDelay: audits['first-input-delay']?.numericValue || 0,
        totalBlockingTime: audits['total-blocking-time']?.numericValue || 0,
        speedIndex: audits['speed-index']?.numericValue || 0,
        interactive: audits['interactive']?.numericValue || 0
      },
      displayValues: {
        firstContentfulPaint: audits['first-contentful-paint']?.displayValue || 'N/A',
        largestContentfulPaint: audits['largest-contentful-paint']?.displayValue || 'N/A',
        cumulativeLayoutShift: audits['cumulative-layout-shift']?.displayValue || 'N/A',
        firstInputDelay: audits['first-input-delay']?.displayValue || 'N/A',
        totalBlockingTime: audits['total-blocking-time']?.displayValue || 'N/A',
        speedIndex: audits['speed-index']?.displayValue || 'N/A',
        interactive: audits['interactive']?.displayValue || 'N/A'
      }
    };
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600'
      }
    });
    
  } catch (error: any) {
    console.error('PageSpeed API error:', error);
    return NextResponse.json(
      { 
        error: error?.message || 'Failed to analyze website performance',
        details: 'Unable to fetch PageSpeed Insights data. Please check if the URL is accessible and try again.'
      },
      { status: 500 }
    );
  }
}
