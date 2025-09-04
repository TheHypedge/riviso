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
  
  for (let n = 1; n <= maxN; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      const ngramTokens = tokens.slice(i, i + n);
      
      // Only emit n-gram if first and last tokens are not stopwords
      if (ngramTokens.length > 0) {
        const phrase = normalizePhrase(ngramTokens);
        
        if (phrase.length > 0) {
          const existing = frequencyMap.get(phrase);
          if (existing) {
            existing.frequency++;
          } else {
            frequencyMap.set(phrase, {
              tokens: n,
              frequency: 1,
              positions: new Set()
            });
          }
        }
      }
    }
  }
  
  // Convert to NGram array
  frequencyMap.forEach((data, phrase) => {
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
  const phrase = ngram.phrase;
  
  // Check title
  if (tokenized.title.join(' ').includes(phrase)) {
    positions.add('title');
  }
  
  // Check meta description
  if (tokenized.metaDescription.join(' ').includes(phrase)) {
    positions.add('meta');
  }
  
  // Check headings
  const allH1 = tokenized.h1.flat().join(' ');
  if (allH1.includes(phrase)) {
    positions.add('h1');
  }
  
  const allH2 = tokenized.h2.flat().join(' ');
  if (allH2.includes(phrase)) {
    positions.add('h2');
  }
  
  const allH3 = tokenized.h3.flat().join(' ');
  if (allH3.includes(phrase)) {
    positions.add('h3');
  }
  
  // Check alt texts
  const allAlt = tokenized.altTexts.flat().join(' ');
  if (allAlt.includes(phrase)) {
    positions.add('alt');
  }
  
  // Check URL slug
  if (tokenized.urlSlug.join(' ').includes(phrase)) {
    positions.add('url');
  }
  
  // Check main content
  if (tokenized.mainContent.join(' ').includes(phrase)) {
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
