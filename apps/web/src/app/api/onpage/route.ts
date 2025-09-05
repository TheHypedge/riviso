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
      
      // Transform the data to match frontend expectations
      const transformedData = {
        status: 'success',
        url: data.url,
        finalUrl: data.finalUrl,
        title: data.onPage.title?.text || '',
        description: data.onPage.metaDescription?.text || '',
        favicon: data.onPage.favicon?.present ? `${new URL(data.finalUrl).origin}/favicon.ico` : undefined,
        score: data.score.value,
        checks: {
          title: {
            status: data.onPage.title?.status || 'fail',
            message: data.onPage.title?.recommendation || 'Title not found',
            value: data.onPage.title?.text || ''
          },
          description: {
            status: data.onPage.metaDescription?.status || 'fail',
            message: data.onPage.metaDescription?.recommendation || 'Meta description not found',
            value: data.onPage.metaDescription?.text || ''
          },
          metaRobots: {
            status: data.onPage.metaRobots?.status || 'fail',
            message: data.onPage.metaRobots?.recommendation || 'Meta robots not found',
            value: data.onPage.metaRobots?.content || ''
          },
          canonical: {
            status: data.onPage.canonical?.status || 'fail',
            message: data.onPage.canonical?.recommendation || 'Canonical URL not found',
            value: data.onPage.canonical?.href || ''
          },
          headings: {
            status: data.onPage.headings?.status || 'fail',
            message: data.onPage.headings?.recommendation || 'Heading structure issues',
            value: `H2 count: ${data.onPage.headings?.h2Count || 0}`
          },
          openGraph: {
            status: data.onPage.openGraph?.status || 'fail',
            message: data.onPage.openGraph?.recommendation || 'Open Graph tags not found',
            value: data.onPage.openGraph?.present ? 'Present' : 'Missing'
          },
          twitter: {
            status: data.onPage.twitterCards?.status || 'fail',
            message: data.onPage.twitterCards?.recommendation || 'Twitter Cards not found',
            value: data.onPage.twitterCards?.present ? 'Present' : 'Missing'
          },
          images: {
            status: data.onPage.images?.status || 'fail',
            message: data.onPage.images?.recommendation || 'Image optimization issues',
            value: `Total: ${data.onPage.images?.total || 0}, Missing alt: ${data.onPage.images?.missingAlt || 0}`
          },
          links: {
            status: data.onPage.links?.status || 'fail',
            message: data.onPage.links?.recommendation || 'Link optimization issues',
            value: `Total: ${data.onPage.links?.total || 0}, Internal: ${data.onPage.links?.internal || 0}, External: ${data.onPage.links?.external || 0}`
          },
          hreflang: {
            status: data.onPage.hreflang?.status || 'fail',
            message: data.onPage.hreflang?.recommendation || 'Hreflang issues',
            value: `Count: ${data.onPage.hreflang?.count || 0}`
          },
          structuredData: {
            status: data.onPage.structuredData?.status || 'fail',
            message: data.onPage.structuredData?.recommendation || 'Structured data not found',
            value: data.onPage.structuredData?.types?.join(', ') || 'None'
          },
          favicon: {
            status: data.onPage.favicon?.status || 'fail',
            message: data.onPage.favicon?.recommendation || 'Favicon not found',
            value: data.onPage.favicon?.present ? 'Present' : 'Missing'
          },
          language: {
            status: data.onPage.language?.status || 'fail',
            message: data.onPage.language?.recommendation || 'Language not declared',
            value: data.onPage.language?.htmlLang || 'Not set'
          },
          charset: {
            status: data.onPage.charset?.status || 'fail',
            message: data.onPage.charset?.recommendation || 'Charset not declared',
            value: data.onPage.charset?.declared || 'Not set'
          }
        }
      };
      
      return NextResponse.json(transformedData, {
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
