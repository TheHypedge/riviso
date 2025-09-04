import { ExtractedContent } from './types';

// HTML entity decoder
function decodeEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&nbsp;': ' ',
    '&ndash;': '–',
    '&mdash;': '—',
    '&hellip;': '…',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
  };

  let decoded = text;
  
  // Decode named entities
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'gi'), char);
  }
  
  // Decode numeric entities &#NNN; and &#xHH;
  decoded = decoded.replace(/&#(\d+);/g, (_, num) => {
    const code = parseInt(num, 10);
    return code >= 0 && code <= 0x10FFFF ? String.fromCharCode(code) : _;
  });
  
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    const code = parseInt(hex, 16);
    return code >= 0 && code <= 0x10FFFF ? String.fromCharCode(code) : _;
  });
  
  return decoded;
}

// Collapse whitespace and normalize
function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')  // Collapse multiple whitespace
    .trim();
}

// Extract text content from HTML, removing specified tags completely
function extractTextFromHtml(html: string): string {
  // Remove entire blocks of noisy tags (non-greedy, dotall)
  const noisyTags = [
    'script', 'style', 'noscript', 'template', 'svg', 'canvas',
    'nav', 'header', 'footer', 'aside', 'iframe', 'object', 'form'
  ];
  
  let cleaned = html;
  
  for (const tag of noisyTags) {
    const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi');
    cleaned = cleaned.replace(regex, '');
  }
  
  // Remove remaining HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  return cleaned;
}

// Extract specific sections from HTML
function extractSections(html: string): ExtractedContent {
  const result: ExtractedContent = {
    title: '',
    metaDescription: '',
    h1: [],
    h2: [],
    h3: [],
    altTexts: [],
    mainContent: '',
    urlSlug: ''
  };
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    result.title = normalizeText(decodeEntities(titleMatch[1]));
  }
  
  // Extract meta description
  const metaMatch = html.match(/<meta[^>]*(?:name|property)=["'](?:description|og:description)["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (metaMatch) {
    result.metaDescription = normalizeText(decodeEntities(metaMatch[1]));
  }
  
  // Extract headings
  const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
  if (h1Matches) {
    result.h1 = h1Matches.map(match => {
      const content = match.replace(/<[^>]*>/g, '');
      return normalizeText(decodeEntities(content));
    });
  }
  
  const h2Matches = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi);
  if (h2Matches) {
    result.h2 = h2Matches.map(match => {
      const content = match.replace(/<[^>]*>/g, '');
      return normalizeText(decodeEntities(content));
    });
  }
  
  const h3Matches = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/gi);
  if (h3Matches) {
    result.h3 = h3Matches.map(match => {
      const content = match.replace(/<[^>]*>/g, '');
      return normalizeText(decodeEntities(content));
    });
  }
  
  // Extract alt texts
  const altMatches = html.match(/<img[^>]*alt=["']([^"']*)["'][^>]*>/gi);
  if (altMatches) {
    result.altTexts = altMatches.map(match => {
      const altMatch = match.match(/alt=["']([^"']*)["']/i);
      return altMatch ? normalizeText(decodeEntities(altMatch[1])) : '';
    }).filter(alt => alt.length > 0);
  }
  
  // Extract main content - prefer <main> tag, fallback to <body>
  let mainContent = '';
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) {
    mainContent = mainMatch[1];
  } else {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      mainContent = bodyMatch[1];
    }
  }
  
  if (mainContent) {
    // Remove noisy tags from main content
    const cleanedMain = extractTextFromHtml(mainContent);
    result.mainContent = normalizeText(decodeEntities(cleanedMain));
  }
  
  return result;
}

// Extract URL slug from URL
function extractUrlSlug(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Extract the last segment as slug
    const segments = pathname.split('/').filter(segment => segment.length > 0);
    const slug = segments[segments.length - 1] || '';
    
    // Remove file extensions
    return slug.replace(/\.[^.]*$/, '');
  } catch {
    return '';
  }
}

export function extractContent(html: string, url: string): ExtractedContent {
  const sections = extractSections(html);
  sections.urlSlug = extractUrlSlug(url);
  
  return sections;
}

export function countStrippedTags(originalHtml: string, cleanedHtml: string): number {
  const originalTags = (originalHtml.match(/<[^>]*>/g) || []).length;
  const cleanedTags = (cleanedHtml.match(/<[^>]*>/g) || []).length;
  return originalTags - cleanedTags;
}