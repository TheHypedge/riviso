import * as cheerio from 'cheerio';
import { fetchHtml } from './fetch';
import { Analyzer, CheckResult, OnPageAnalysisResult } from './types';
import { titleCheck } from './analyzers/title';
import { metaDescriptionCheck } from './analyzers/metaDescription';
import { metaRobotsCheck } from './analyzers/metaRobots';
import { canonicalCheck } from './analyzers/canonical';
import { h1Check, headingsCheck } from './analyzers/headings';
import { openGraphCheck } from './analyzers/openGraph';
import { twitterCheck } from './analyzers/twitter';
import { imagesCheck } from './analyzers/images';
import { linksCheck } from './analyzers/links';
import { hreflangCheck } from './analyzers/hreflang';
import { structuredDataCheck } from './analyzers/structuredData';
import { faviconCheck } from './analyzers/favicon';
import { languageCheck, charsetCheck } from './analyzers/langCharset';

const WEIGHTS: Record<string, number> = {
  title: 8,
  metaDescription: 8,
  metaRobots: 10,
  canonical: 8,
  h1: 6,
  headings: 4,
  openGraph: 6,
  twitter: 2,
  images: 8,
  links: 10,
  hreflang: 4,
  structuredData: 6,
  favicon: 2,
  language: 4,
  charset: 4
};

export async function analyzeOnPage(inputUrl: string): Promise<OnPageAnalysisResult> {
  const fetched = await fetchHtml(inputUrl);
  const $ = cheerio.load(fetched.html || '');
  const finalUrl = new URL(fetched.finalUrl || inputUrl);
  const ctx = { 
    $, 
    html: fetched.html, 
    finalUrl, 
    headers: fetched.headers 
  };

  const analyzers: Analyzer[] = [
    titleCheck,
    metaDescriptionCheck,
    metaRobotsCheck,
    canonicalCheck,
    h1Check,
    headingsCheck,
    openGraphCheck,
    twitterCheck,
    imagesCheck,
    linksCheck,
    hreflangCheck,
    structuredDataCheck,
    faviconCheck,
    languageCheck,
    charsetCheck
  ];

  const checks: CheckResult[] = [];
  for (const fn of analyzers) {
    checks.push(await fn(ctx));
  }

  const totalWeight = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  let gained = 0;
  
  for (const c of checks) {
    const w = WEIGHTS[c.id] ?? 0;
    if (c.status === 'pass') {
      gained += w;
    } else if (c.status === 'warn') {
      gained += w * 0.6;
    }
  }
  
  const score = Math.round((gained / totalWeight) * 100);

  return {
    url: inputUrl,
    finalUrl: fetched.finalUrl,
    http: { 
      status: fetched.status, 
      redirects: fetched.redirects 
    },
    onPage: toContract(checks),
    score: { 
      value: score, 
      weights: WEIGHTS 
    },
    version: 'onpage-1.0.0'
  };
}

function toContract(checks: CheckResult[]) {
  const out: any = {};
  for (const c of checks) {
    out[c.id] = { 
      ...(c.evidence || {}), 
      status: c.status, 
      recommendation: c.recommendation 
    };
  }
  return out;
}
