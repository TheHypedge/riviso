import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { metaRobotsCheck } from '../../src/lib/onpage/analyzers/metaRobots';

describe('Meta Robots Check', () => {
  it('should pass with no robots meta tag', () => {
    const html = '<html><head><title>Page Title</title></head></html>';
    const $ = cheerio.load(html);
    const result = metaRobotsCheck({ $, html, finalUrl: new URL('https://example.com'), headers: {} });
    
    expect(result.status).toBe('pass');
    expect(result.evidence.indexable).toBe(true);
    expect(result.evidence.followable).toBe(true);
  });

  it('should pass with index,follow', () => {
    const html = '<html><head><meta name="robots" content="index,follow"></head></html>';
    const $ = cheerio.load(html);
    const result = metaRobotsCheck({ $, html, finalUrl: new URL('https://example.com'), headers: {} });
    
    expect(result.status).toBe('pass');
    expect(result.evidence.indexable).toBe(true);
    expect(result.evidence.followable).toBe(true);
  });

  it('should fail with noindex', () => {
    const html = '<html><head><meta name="robots" content="noindex,follow"></head></html>';
    const $ = cheerio.load(html);
    const result = metaRobotsCheck({ $, html, finalUrl: new URL('https://example.com'), headers: {} });
    
    expect(result.status).toBe('fail');
    expect(result.evidence.indexable).toBe(false);
    expect(result.evidence.followable).toBe(true);
  });

  it('should fail with nofollow', () => {
    const html = '<html><head><meta name="robots" content="index,nofollow"></head></html>';
    const $ = cheerio.load(html);
    const result = metaRobotsCheck({ $, html, finalUrl: new URL('https://example.com'), headers: {} });
    
    expect(result.status).toBe('fail');
    expect(result.evidence.indexable).toBe(true);
    expect(result.evidence.followable).toBe(false);
  });

  it('should check X-Robots-Tag header', () => {
    const html = '<html><head></head></html>';
    const $ = cheerio.load(html);
    const result = metaRobotsCheck({ 
      $, 
      html, 
      finalUrl: new URL('https://example.com'), 
      headers: { 'x-robots-tag': 'noindex' } 
    });
    
    expect(result.status).toBe('fail');
    expect(result.evidence.indexable).toBe(false);
  });
});
