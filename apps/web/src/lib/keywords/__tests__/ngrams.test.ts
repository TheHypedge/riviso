import { generateKeywordFindings, categorizeKeywords } from '../ngrams';
import { TokenizedContent, KeywordFinding } from '../types';

describe('N-grams', () => {
  const mockTokenized: TokenizedContent = {
    title: ['seo', 'tools', 'guide'],
    metaDescription: ['best', 'seo', 'tools', '2024'],
    h1: [['seo', 'analysis', 'tools']],
    h2: [['free', 'tools'], ['premium', 'tools']],
    h3: [['keyword', 'research'], ['backlink', 'analysis']],
    altTexts: [['seo', 'dashboard'], ['analytics', 'chart']],
    mainContent: ['comprehensive', 'guide', 'seo', 'tools', 'keyword', 'research', 'backlink', 'analysis', 'technical', 'seo', 'website', 'ranking', 'organic', 'traffic'],
    urlSlug: ['seo', 'tools', 'guide']
  };

  test('should generate keyword findings', () => {
    const findings = generateKeywordFindings(mockTokenized, mockTokenized.mainContent.length);
    
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]).toHaveProperty('rank');
    expect(findings[0]).toHaveProperty('keyword');
    expect(findings[0]).toHaveProperty('tokens');
    expect(findings[0]).toHaveProperty('frequency');
    expect(findings[0]).toHaveProperty('density');
    expect(findings[0]).toHaveProperty('score');
    expect(findings[0]).toHaveProperty('positions');
  });

  test('should rank keywords by score', () => {
    const findings = generateKeywordFindings(mockTokenized, mockTokenized.mainContent.length);
    
    for (let i = 1; i < findings.length; i++) {
      expect(findings[i - 1].score).toBeGreaterThanOrEqual(findings[i].score);
    }
  });

  test('should detect positions correctly', () => {
    const findings = generateKeywordFindings(mockTokenized, mockTokenized.mainContent.length);
    
    const seoToolsFinding = findings.find(f => f.keyword === 'seo tools');
    if (seoToolsFinding) {
      expect(seoToolsFinding.positions).toContain('title');
      expect(seoToolsFinding.positions).toContain('content');
    }
  });

  test('should categorize keywords correctly', () => {
    const findings = generateKeywordFindings(mockTokenized, mockTokenized.mainContent.length);
    const categorized = categorizeKeywords(findings);
    
    expect(categorized.all).toEqual(findings);
    expect(categorized.shortTail.every(f => f.tokens <= 2)).toBe(true);
    expect(categorized.longTail.every(f => f.tokens >= 3)).toBe(true);
    expect(categorized.shortTail.length + categorized.longTail.length).toBe(findings.length);
  });

  test('should calculate density correctly', () => {
    const findings = generateKeywordFindings(mockTokenized, mockTokenized.mainContent.length);
    
    findings.forEach(finding => {
      expect(finding.density).toBeGreaterThanOrEqual(0);
      expect(finding.density).toBeLessThanOrEqual(100);
      expect(finding.frequency).toBeGreaterThan(0);
    });
  });

  test('should assign labels based on density', () => {
    const findings = generateKeywordFindings(mockTokenized, mockTokenized.mainContent.length);
    
    findings.forEach(finding => {
      if (finding.labels) {
        expect(finding.labels).toContain('high');
        expect(finding.labels).toContain('medium');
        expect(finding.labels).toContain('low');
        expect(finding.labels).toContain('good');
      }
    });
  });
});
