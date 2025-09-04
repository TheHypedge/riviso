import { NextRequest, NextResponse } from 'next/server';
import { analyzeKeywords } from '@/lib/keywords/extractor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;
    
    // Validate input
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required and must be a string' },
        { status: 400 }
      );
    }
    
    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }
    
    // Analyze keywords
    const result = await analyzeKeywords(url);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Keywords analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
