import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { titleCheck } from '../../src/lib/onpage/analyzers/title';

describe('Title Check', () => {
  it('should pass with optimal title length', () => {
    const html = '<html><head><title>Perfect Title Length for SEO Optimization</title></head></html>';
    const $ = cheerio.load(html);
    const result = titleCheck({ $, html, finalUrl: new URL('https://example.com'), headers: {} });
    
    expect(result.status).toBe('pass');
    expect(result.evidence.length).toBe(42);
  });

  it('should warn with short title', () => {
    const html = '<html><head><title>Short</title></head></html>';
    const $ = cheerio.load(html);
    const result = titleCheck({ $, html, finalUrl: new URL('https://example.com'), headers: {} });
    
    expect(result.status).toBe('warn');
    expect(result.evidence.length).toBe(5);
  });

  it('should fail with missing title', () => {
    const html = '<html><head></head></html>';
    const $ = cheerio.load(html);
    const result = titleCheck({ $, html, finalUrl: new URL('https://example.com'), headers: {} });
    
    expect(result.status).toBe('fail');
    expect(result.evidence.present).toBe(false);
  });

  it('should fail with very long title', () => {
    const html = '<html><head><title>This is a very long title that exceeds the recommended length for SEO optimization and should trigger a failure because it is too long</title></head></html>';
    const $ = cheerio.load(html);
    const result = titleCheck({ $, html, finalUrl: new URL('https://example.com'), headers: {} });
    
    expect(result.status).toBe('fail');
    expect(result.evidence.length).toBeGreaterThan(70);
  });
});
