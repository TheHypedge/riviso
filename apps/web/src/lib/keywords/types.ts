export type KeywordFinding = {
  rank: number;
  keyword: string;            // normalized phrase
  tokens: number;             // 1..4
  frequency: number;          // occurrences in main content
  density: number;            // 0..100 (% of main-content tokens)
  score: number;              // ranking score
  positions: Array<'title'|'h1'|'h2'|'h3'|'meta'|'alt'|'url'|'content'>;
  labels?: Array<'high'|'medium'|'low'|'good'>; // density banding for UI
};

export type KeywordsResponse = {
  sourceUrl: string;
  contentTokens: number;
  all: KeywordFinding[];
  shortTail: KeywordFinding[]; // 1–2 tokens
  longTail: KeywordFinding[];  // 3–4 tokens
  diagnostics: {
    httpStatus?: number;
    bytes?: number;
    robotsTxt?: number;  // 200/404/…
    sitemapXml?: number; // 200/404/…
    strippedTagsCount: number;
    warnings: string[];
  };
};

export type ExtractedContent = {
  title: string;
  metaDescription: string;
  h1: string[];
  h2: string[];
  h3: string[];
  altTexts: string[];
  mainContent: string;
  urlSlug: string;
};

export type TokenizedContent = {
  title: string[];
  metaDescription: string[];
  h1: string[][];
  h2: string[][];
  h3: string[][];
  altTexts: string[][];
  mainContent: string[];
  urlSlug: string[];
};

export type NGram = {
  phrase: string;
  tokens: number;
  frequency: number;
  positions: Set<string>;
};
