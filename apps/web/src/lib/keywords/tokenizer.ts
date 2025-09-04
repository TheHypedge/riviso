import { ExtractedContent, TokenizedContent } from './types';

// English stopwords list (concise)
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'i', 'you', 'we', 'they', 'she', 'him',
  'her', 'his', 'our', 'their', 'this', 'these', 'those', 'or', 'but',
  'if', 'when', 'where', 'why', 'how', 'what', 'who', 'which', 'can',
  'could', 'should', 'would', 'may', 'might', 'must', 'shall', 'do',
  'does', 'did', 'have', 'had', 'been', 'being', 'am', 'are', 'is',
  'was', 'were', 'been', 'being', 'have', 'has', 'had', 'having',
  'do', 'does', 'did', 'doing', 'will', 'would', 'could', 'should',
  'may', 'might', 'must', 'can', 'shall', 'not', 'no', 'nor', 'so',
  'yet', 'because', 'although', 'though', 'unless', 'until', 'while',
  'before', 'after', 'during', 'through', 'above', 'below', 'up',
  'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
  'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
  'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
  'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should',
  'now'
]);

// Token regex with basic Unicode support
const TOKEN_REGEX = /[a-zA-Z0-9][a-zA-Z0-9''-]*/g;

function isStopword(token: string): boolean {
  return STOPWORDS.has(token.toLowerCase());
}

function isDigitHeavy(token: string): boolean {
  const digitCount = (token.match(/\d/g) || []).length;
  return digitCount / token.length >= 0.7;
}

function isCSSNoise(token: string): boolean {
  const lower = token.toLowerCase();
  return lower.includes('px') || 
         lower.includes('em') || 
         lower.includes('rem') ||
         lower.includes('vh') ||
         lower.includes('vw') ||
         lower.includes('rgb') ||
         lower.includes('rgba') ||
         lower.includes('hsl') ||
         lower.includes('hsla') ||
         lower.match(/^#?[0-9a-f]{3,6}$/) !== null ||
         lower.match(/^x[0-9a-f]+$/) !== null ||
         lower.match(/^0x[0-9a-f]+$/) !== null;
}

function isValidToken(token: string): boolean {
  // Length check
  if (token.length === 1) {
    return token.toLowerCase() === 'ai' || token.toLowerCase() === 'seo';
  }
  
  // Stopword check
  if (isStopword(token)) {
    return false;
  }
  
  // Digit-heavy check
  if (isDigitHeavy(token)) {
    return false;
  }
  
  // CSS/tech noise check
  if (isCSSNoise(token)) {
    return false;
  }
  
  return true;
}

function tokenizeText(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }
  
  const matches = text.match(TOKEN_REGEX) || [];
  return matches
    .map(token => token.toLowerCase())
    .filter(isValidToken);
}

export function tokenizeContent(content: ExtractedContent): TokenizedContent {
  return {
    title: tokenizeText(content.title),
    metaDescription: tokenizeText(content.metaDescription),
    h1: content.h1.map(text => tokenizeText(text)),
    h2: content.h2.map(text => tokenizeText(text)),
    h3: content.h3.map(text => tokenizeText(text)),
    altTexts: content.altTexts.map(text => tokenizeText(text)),
    mainContent: tokenizeText(content.mainContent),
    urlSlug: tokenizeText(content.urlSlug)
  };
}

export function getMainContentTokens(tokenized: TokenizedContent): string[] {
  return tokenized.mainContent;
}

export function getTotalTokenCount(tokenized: TokenizedContent): number {
  return tokenized.mainContent.length;
}
