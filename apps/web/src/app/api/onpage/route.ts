import { NextRequest, NextResponse } from 'next/server';
import { analyzeOnPage } from '../../../lib/onpage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url') || '';
    
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
    
    try {
      const data = await analyzeOnPage(url);
      
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 's-maxage=900, stale-while-revalidate=86400'
        }
      });
    } catch (error: any) {
      console.error('On-page analysis error:', error);
      return NextResponse.json(
        { 
          error: error?.message || 'On-page analyzer error',
          details: 'Failed to analyze the provided URL. Please check if the URL is accessible and try again.'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
