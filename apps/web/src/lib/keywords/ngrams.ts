import { TokenizedContent, NGram, KeywordFinding } from './types';

function normalizePhrase(tokens: string[]): string {
  return tokens
    .join(' ')
    .replace(/[^a-zA-Z0-9\s'-]/g, '') // Remove punctuation except apostrophes and dashes
    .replace(/[''-]+/g, ' ') // Replace multiple apostrophes/dashes with space
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim()
    .toLowerCase();
}

function generateNGrams(tokens: string[], maxN: number = 4): NGram[] {
  const ngrams: NGram[] = [];
  const frequencyMap = new Map<string, { tokens: number; frequency: number; positions: Set<string> }>();
  
  // Extended stopwords list
  const stopwords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall', 'this',
    'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
    'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine',
    'yours', 'hers', 'ours', 'theirs', 'am', 'is', 'are', 'was', 'were', 'being',
    'been', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'will',
    'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall', 'not', 'no',
    'nor', 'so', 'yet', 'because', 'although', 'though', 'unless', 'until', 'while',
    'before', 'after', 'during', 'through', 'above', 'below', 'up', 'down', 'out',
    'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there',
    'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
    'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should',
    'now', 'every', 'into', 'your', 'just', 'from', 'about', 'through', 'during',
    'before', 'after', 'above', 'below', 'up', 'down', 'in', 'out', 'on', 'off',
    'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
    'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
    'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'
  ]);
  
  // Generate meaningful n-grams
  for (let n = 1; n <= maxN; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      const ngramTokens = tokens.slice(i, i + n);
      
      // Skip if empty
      if (ngramTokens.length === 0) continue;
      
      // For single words, only include meaningful ones
      if (n === 1) {
        const word = ngramTokens[0].toLowerCase();
        // Skip very short words, numbers, and stopwords
        if (word.length < 3) continue;
        if (word.match(/^\d+$/)) continue;
        if (stopwords.has(word)) continue;
        // Skip words that are mostly punctuation
        if (word.replace(/[a-zA-Z]/g, '').length > word.length * 0.5) continue;
      }
      
      // For multi-word phrases, ensure they make sense
      if (n > 1) {
        // Skip if first or last word is a stopword
        const firstWord = ngramTokens[0].toLowerCase();
        const lastWord = ngramTokens[ngramTokens.length - 1].toLowerCase();
        if (stopwords.has(firstWord) || stopwords.has(lastWord)) continue;
        
        // Skip if more than 50% of words are stopwords
        const stopwordCount = ngramTokens.filter(token => stopwords.has(token.toLowerCase())).length;
        if (stopwordCount > ngramTokens.length * 0.5) continue;
      }
      
      // Create phrase from tokens
      const phrase = ngramTokens.join(' ').toLowerCase().trim();
      
      // Skip very short phrases
      if (phrase.length < 3) continue;
      
      // Skip phrases that are mostly punctuation or numbers
      if (phrase.match(/^[^a-zA-Z]*$/)) continue;
      
      // Skip phrases with too many consecutive numbers
      if (phrase.match(/\d{3,}/)) continue;
      
      // Normalize the phrase
      const normalizedPhrase = normalizePhrase(ngramTokens);
      
      if (normalizedPhrase.length > 0) {
        const existing = frequencyMap.get(normalizedPhrase);
        if (existing) {
          existing.frequency++;
        } else {
          frequencyMap.set(normalizedPhrase, {
            tokens: n,
            frequency: 1,
            positions: new Set()
          });
        }
      }
    }
  }
  
  // Convert to NGram array and filter out low-quality phrases
  frequencyMap.forEach((data, phrase) => {
    // Filter out single character phrases (except important ones)
    if (phrase.length === 1 && !['ai', 'seo'].includes(phrase)) return;
    
    // Filter out phrases that are mostly numbers
    const wordCount = phrase.split(' ').length;
    const letterCount = phrase.replace(/[^a-zA-Z]/g, '').length;
    if (letterCount < wordCount * 0.5) return;
    
    // For multi-word phrases, ensure they have meaningful content
    if (wordCount > 1) {
      const words = phrase.split(' ');
      const meaningfulWords = words.filter(word => 
        word.length >= 3 && 
        !word.match(/^\d+$/) && 
        !stopwords.has(word.toLowerCase())
      );
      if (meaningfulWords.length < Math.ceil(wordCount * 0.6)) return;
    }
    
    // Skip phrases that are too repetitive
    const words = phrase.split(' ');
    const uniqueWords = new Set(words);
    if (words.length > 2 && uniqueWords.size < words.length * 0.7) return;
    
    ngrams.push({
      phrase,
      tokens: data.tokens,
      frequency: data.frequency,
      positions: data.positions
    });
  });
  
  return ngrams;
}

function detectPositions(ngram: NGram, tokenized: TokenizedContent): Set<string> {
  const positions = new Set<string>();
  const phrase = ngram.phrase.toLowerCase();
  
  // Check title
  const titleText = tokenized.title.join(' ').toLowerCase();
  if (titleText.includes(phrase)) {
    positions.add('title');
  }
  
  // Check meta description
  const metaText = tokenized.metaDescription.join(' ').toLowerCase();
  if (metaText.includes(phrase)) {
    positions.add('meta');
  }
  
  // Check headings
  const allH1 = tokenized.h1.flat().join(' ').toLowerCase();
  if (allH1.includes(phrase)) {
    positions.add('h1');
  }
  
  const allH2 = tokenized.h2.flat().join(' ').toLowerCase();
  if (allH2.includes(phrase)) {
    positions.add('h2');
  }
  
  const allH3 = tokenized.h3.flat().join(' ').toLowerCase();
  if (allH3.includes(phrase)) {
    positions.add('h3');
  }
  
  // Check alt texts
  const allAlt = tokenized.altTexts.flat().join(' ').toLowerCase();
  if (allAlt.includes(phrase)) {
    positions.add('alt');
  }
  
  // Check URL slug
  const urlText = tokenized.urlSlug.join(' ').toLowerCase();
  if (urlText.includes(phrase)) {
    positions.add('url');
  }
  
  // Check main content
  const contentText = tokenized.mainContent.join(' ').toLowerCase();
  if (contentText.includes(phrase)) {
    positions.add('content');
  }
  
  return positions;
}

function calculateScore(ngram: NGram, totalTokens: number): number {
  const frequency = ngram.frequency;
  const density = (frequency / totalTokens) * 100;
  const positionBonus = ngram.positions.size * 0.1;
  const lengthBonus = ngram.tokens === 1 ? 0.5 : ngram.tokens * 0.2;
  
  // Base score from frequency and density
  let score = Math.log(frequency + 1) * density;
  
  // Position bonus
  score += positionBonus;
  
  // Length bonus (prefer longer phrases)
  score += lengthBonus;
  
  // Penalty for very high density (keyword stuffing)
  if (density > 5) {
    score *= 0.5;
  }
  
  return Math.round(score * 100) / 100;
}

function getDensityLabels(density: number): Array<'high'|'medium'|'low'|'good'> {
  const labels: Array<'high'|'medium'|'low'|'good'> = [];
  
  if (density >= 3) {
    labels.push('high');
  } else if (density >= 1) {
    labels.push('medium');
  } else if (density >= 0.1) {
    labels.push('low');
  }
  
  if (density >= 0.5 && density <= 2) {
    labels.push('good');
  }
  
  return labels;
}

export function generateKeywordFindings(
  tokenized: TokenizedContent,
  totalTokens: number
): KeywordFinding[] {
  const mainTokens = tokenized.mainContent;
  const ngrams = generateNGrams(mainTokens, 4);
  
  // Detect positions for each n-gram
  for (const ngram of ngrams) {
    ngram.positions = detectPositions(ngram, tokenized);
  }
  
  // Convert to KeywordFinding format
  const findings: KeywordFinding[] = ngrams.map(ngram => {
    const density = (ngram.frequency / totalTokens) * 100;
    const score = calculateScore(ngram, totalTokens);
    const labels = getDensityLabels(density);
    
    return {
      rank: 0, // Will be set after sorting
      keyword: ngram.phrase,
      tokens: ngram.tokens,
      frequency: ngram.frequency,
      density: Math.round(density * 100) / 100,
      score,
      positions: Array.from(ngram.positions) as Array<'title'|'h1'|'h2'|'h3'|'meta'|'alt'|'url'|'content'>,
      labels: labels.length > 0 ? labels : undefined
    };
  });
  
  // Sort by score (descending) and assign ranks
  findings.sort((a, b) => b.score - a.score);
  findings.forEach((finding, index) => {
    finding.rank = index + 1;
  });
  
  return findings;
}

export function categorizeKeywords(findings: KeywordFinding[]): {
  all: KeywordFinding[];
  shortTail: KeywordFinding[];
  longTail: KeywordFinding[];
} {
  const shortTail = findings.filter(f => f.tokens <= 2);
  const longTail = findings.filter(f => f.tokens >= 3);
  
  return {
    all: findings,
    shortTail,
    longTail
  };
}
