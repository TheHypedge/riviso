import { tokenizeContent, getTotalTokenCount } from '../tokenizer';
import { ExtractedContent } from '../types';

describe('Tokenizer', () => {
  const mockContent: ExtractedContent = {
    title: 'Best SEO Tools for 2024',
    metaDescription: 'Discover the top SEO tools to improve your website ranking',
    h1: ['SEO Analysis Tools'],
    h2: ['Free Tools', 'Premium Tools'],
    h3: ['Keyword Research', 'Backlink Analysis'],
    altTexts: ['SEO dashboard screenshot', 'Analytics chart'],
    mainContent: 'This is a comprehensive guide to SEO tools. We cover keyword research, backlink analysis, and technical SEO. The best tools help you improve your website ranking and increase organic traffic.',
    urlSlug: 'seo-tools-guide'
  };

  test('should tokenize content correctly', () => {
    const tokenized = tokenizeContent(mockContent);
    
    expect(tokenized.title).toContain('seo');
    expect(tokenized.title).toContain('tools');
    expect(tokenized.title).toContain('2024');
    expect(tokenized.mainContent).toContain('comprehensive');
    expect(tokenized.mainContent).toContain('keyword');
    expect(tokenized.mainContent).toContain('research');
  });

  test('should filter out stopwords', () => {
    const tokenized = tokenizeContent(mockContent);
    
    expect(tokenized.mainContent).not.toContain('the');
    expect(tokenized.mainContent).not.toContain('a');
    expect(tokenized.mainContent).not.toContain('and');
    expect(tokenized.mainContent).not.toContain('to');
  });

  test('should filter out CSS noise', () => {
    const contentWithCSS: ExtractedContent = {
      ...mockContent,
      mainContent: 'This is 16px text with #ffffff color and 100vh height'
    };
    
    const tokenized = tokenizeContent(contentWithCSS);
    
    expect(tokenized.mainContent).not.toContain('16px');
    expect(tokenized.mainContent).not.toContain('#ffffff');
    expect(tokenized.mainContent).not.toContain('100vh');
  });

  test('should count total tokens correctly', () => {
    const tokenized = tokenizeContent(mockContent);
    const totalTokens = getTotalTokenCount(tokenized);
    
    expect(totalTokens).toBeGreaterThan(0);
    expect(totalTokens).toBe(tokenized.mainContent.length);
  });

  test('should handle empty content', () => {
    const emptyContent: ExtractedContent = {
      title: '',
      metaDescription: '',
      h1: [],
      h2: [],
      h3: [],
      altTexts: [],
      mainContent: '',
      urlSlug: ''
    };
    
    const tokenized = tokenizeContent(emptyContent);
    const totalTokens = getTotalTokenCount(tokenized);
    
    expect(totalTokens).toBe(0);
    expect(tokenized.mainContent).toEqual([]);
  });
});
