import { PromptTemplate } from '@riviso/shared-types';

/**
 * Pre-built prompt templates for common operations
 */

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'keyword-opportunity',
    name: 'Keyword Opportunity Analysis',
    category: 'seo',
    template: `Analyze the keyword "{{keyword}}" for the website {{domain}}.
Current rank: {{currentRank}}
Search volume: {{searchVolume}}
Competitor ranks: {{competitorRanks}}

Provide:
1. Opportunity score (1-10)
2. Recommended actions to improve ranking
3. Content suggestions
4. Expected timeline`,
    variables: ['keyword', 'domain', 'currentRank', 'searchVolume', 'competitorRanks'],
    description: 'Analyzes keyword opportunities and provides actionable recommendations',
  },
  {
    id: 'competitor-gap-analysis',
    name: 'Competitor Content Gap Analysis',
    category: 'competitor',
    template: `Analyze content gaps between {{domain}} and competitor {{competitorDomain}}.

Your keywords: {{yourKeywords}}
Competitor keywords: {{competitorKeywords}}
Common keywords: {{commonKeywords}}

Identify:
1. High-value keywords you're missing
2. Content topics to target
3. Competitive advantages to leverage
4. Priority actions`,
    variables: ['domain', 'competitorDomain', 'yourKeywords', 'competitorKeywords', 'commonKeywords'],
    description: 'Identifies content gaps and opportunities vs competitors',
  },
  {
    id: 'cro-recommendation',
    name: 'CRO Recommendation Generator',
    category: 'cro',
    template: `Analyze the page: {{pageUrl}}

Metrics:
- Page views: {{pageViews}}
- Bounce rate: {{bounceRate}}%
- Avg time on page: {{avgTime}}s
- Conversion rate: {{conversionRate}}%

Page type: {{pageType}}
Industry: {{industry}}

Generate 5 specific CRO recommendations with:
1. What to change
2. Why it matters
3. Expected impact
4. Implementation effort`,
    variables: ['pageUrl', 'pageViews', 'bounceRate', 'avgTime', 'conversionRate', 'pageType', 'industry'],
    description: 'Generates conversion optimization recommendations',
  },
  {
    id: 'seo-audit-summary',
    name: 'SEO Audit Summary',
    category: 'seo',
    template: `Summarize this SEO audit for {{domain}}:

Technical Issues: {{technicalIssues}}
On-page Issues: {{onPageIssues}}
Content Issues: {{contentIssues}}
Performance Score: {{performanceScore}}
Mobile Score: {{mobileScore}}

Provide:
1. Executive summary
2. Top 3 critical issues
3. Quick wins
4. Long-term strategy`,
    variables: ['domain', 'technicalIssues', 'onPageIssues', 'contentIssues', 'performanceScore', 'mobileScore'],
    description: 'Summarizes SEO audit findings for executives',
  },
  {
    id: 'content-strategy',
    name: 'Content Strategy Generator',
    category: 'content',
    template: `Create a content strategy for {{domain}} targeting {{industry}}.

Current top pages: {{topPages}}
Target keywords: {{targetKeywords}}
Competitor analysis: {{competitorInsights}}

Deliver:
1. Content pillars (3-5 themes)
2. Specific content ideas (10+)
3. Keyword mapping
4. Publishing calendar outline`,
    variables: ['domain', 'industry', 'topPages', 'targetKeywords', 'competitorInsights'],
    description: 'Generates comprehensive content strategy',
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES.find(t => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter(t => t.category === category);
}

/**
 * Fill template with variables
 */
export function fillTemplate(template: PromptTemplate, variables: Record<string, string>): string {
  let result = template.template;

  template.variables.forEach(varName => {
    const value = variables[varName] || `[${varName} not provided]`;
    result = result.replace(new RegExp(`{{${varName}}}`, 'g'), value);
  });

  return result;
}
