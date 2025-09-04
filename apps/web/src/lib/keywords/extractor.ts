import { safeFetch } from './fetcher';
import { extractContent, countStrippedTags } from './html-extractor';
import { tokenizeContent, getTotalTokenCount } from './tokenizer';
import { generateKeywordFindings, categorizeKeywords } from './ngrams';
import { KeywordsResponse } from './types';

export async function analyzeKeywords(url: string): Promise<KeywordsResponse> {
  const warnings: string[] = [];
  
  try {
    // Fetch HTML content
    const fetchResult = await safeFetch(url);
    warnings.push(...fetchResult.warnings);
    
    // Extract content sections
    const extracted = extractContent(fetchResult.html, url);
    
    // Count stripped tags for diagnostics
    const cleanedHtml = fetchResult.html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<noscript[^>]*>.*?<\/noscript>/gi, '')
      .replace(/<template[^>]*>.*?<\/template>/gi, '')
      .replace(/<svg[^>]*>.*?<\/svg>/gi, '')
      .replace(/<canvas[^>]*>.*?<\/canvas>/gi, '')
      .replace(/<nav[^>]*>.*?<\/nav>/gi, '')
      .replace(/<header[^>]*>.*?<\/header>/gi, '')
      .replace(/<footer[^>]*>.*?<\/footer>/gi, '')
      .replace(/<aside[^>]*>.*?<\/aside>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>.*?<\/object>/gi, '')
      .replace(/<form[^>]*>.*?<\/form>/gi, '');
    
    const strippedTagsCount = countStrippedTags(fetchResult.html, cleanedHtml);
    
    // Tokenize content
    const tokenized = tokenizeContent(extracted);
    const totalTokens = getTotalTokenCount(tokenized);
    
    // Generate keyword findings
    const findings = generateKeywordFindings(tokenized, totalTokens);
    
    // Categorize keywords
    const categorized = categorizeKeywords(findings);
    
    // Check for robots.txt and sitemap.xml
    let robotsTxtStatus: number | undefined;
    let sitemapXmlStatus: number | undefined;
    
    try {
      const robotsUrl = new URL('/robots.txt', url).toString();
      const robotsResponse = await fetch(robotsUrl, { method: 'HEAD' });
      robotsTxtStatus = robotsResponse.status;
    } catch {
      robotsTxtStatus = 404;
    }
    
    try {
      const sitemapUrl = new URL('/sitemap.xml', url).toString();
      const sitemapResponse = await fetch(sitemapUrl, { method: 'HEAD' });
      sitemapXmlStatus = sitemapResponse.status;
    } catch {
      sitemapXmlStatus = 404;
    }
    
    return {
      sourceUrl: url,
      contentTokens: totalTokens,
      all: categorized.all,
      shortTail: categorized.shortTail,
      longTail: categorized.longTail,
      diagnostics: {
        httpStatus: fetchResult.status,
        bytes: fetchResult.bytes,
        robotsTxt: robotsTxtStatus,
        sitemapXml: sitemapXmlStatus,
        strippedTagsCount,
        warnings
      }
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    warnings.push(`Analysis failed: ${errorMessage}`);
    
    return {
      sourceUrl: url,
      contentTokens: 0,
      all: [],
      shortTail: [],
      longTail: [],
      diagnostics: {
        strippedTagsCount: 0,
        warnings
      }
    };
  }
}