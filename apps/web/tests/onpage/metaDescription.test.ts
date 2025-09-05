import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { metaDescriptionCheck } from '../../src/lib/onpage/analyzers/metaDescription';

describe('Meta Description Check', () => {
  it('should pass with optimal description', () => {
    const html = '<html><head><title>Page Title</title><meta name="description" content="This is a perfect meta description that is between 70 and 160 characters long and provides good information about the page content."></head></html>';
    const $ = cheerio.load(html);
    const result = metaDescriptionCheck({ $, html, finalUrl: new URL('https://example.com'), headers: {} });
    
    expect(result.status).toBe('pass');
    expect(result.evidence.length).toBeGreaterThan(70);
    expect(result.evidence.length).toBeLessThan(161);
  });

  it('should fail with missing description', () => {
    const html = '<html><head><title>Page Title</title></head></html>';
    const $ = cheerio.load(html);
    const result = metaDescriptionCheck({ $, html, finalUrl: new URL('https://example.com'), headers: {} });
    
    expect(result.status).toBe('fail');
    expect(result.evidence.present).toBe(false);
  });

  it('should fail when description matches title', () => {
    const html = '<html><head><title>Page Title</title><meta name="description" content="Page Title"></head></html>';
    const $ = cheerio.load(html);
    const result = metaDescriptionCheck({ $, html, finalUrl: new URL('https://example.com'), headers: {} });
    
    expect(result.status).toBe('fail');
  });

  it('should fail with short description', () => {
    const html = '<html><head><title>Page Title</title><meta name="description" content="Short description"></head></html>';
    const $ = cheerio.load(html);
    const result = metaDescriptionCheck({ $, html, finalUrl: new URL('https://example.com'), headers: {} });
    
    expect(result.status).toBe('fail');
    expect(result.evidence.length).toBeLessThan(70);
  });
});
