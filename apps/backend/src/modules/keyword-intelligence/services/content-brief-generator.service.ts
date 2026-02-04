import { Injectable, Logger } from '@nestjs/common';
import {
  ContentBrief,
  ContentOutlineItem,
  CompetitorContentInsight,
  FAQCollection,
  FAQItem,
  EditorialPlan,
  EditorialItem,
  TopicCoverageMap,
  KeywordProjectedImpact,
  IntentStage,
} from '@riviso/shared-types';
import { ContentGeneratorService } from '../../ai/services/content-generator.service';

/**
 * Generates content briefs, FAQs, and editorial plans
 * Now powered by AI for natural, contextual content
 */
@Injectable()
export class ContentBriefGeneratorService {
  private readonly logger = new Logger(ContentBriefGeneratorService.name);

  constructor(private readonly contentGenerator: ContentGeneratorService) {}
  /**
   * Generate a comprehensive content brief for a keyword
   */
  async generateContentBrief(keyword: string, angle?: string): Promise<ContentBrief> {
    const intent = this.determineIntent(keyword);
    const wordCountTarget = this.calculateWordCount(intent, keyword);

    // Generate title and outline in parallel using AI
    const [title, outline, questions, competitorInsights] = await Promise.all([
      this.generateTitle(keyword, intent, angle),
      this.generateOutline(keyword, intent, wordCountTarget.min),
      this.generateQuestionsToAnswer(keyword),
      Promise.resolve(this.analyzeCompetitorContent(keyword)),
    ]);

    return {
      id: `brief-${Date.now()}`,
      targetKeyword: keyword,
      title,
      intent,
      wordCountTarget,
      outline,
      questionsToAnswer: questions,
      keywordsToInclude: this.extractRelatedKeywords(keyword),
      competitorInsights,
      callToAction: this.generateCTA(intent),
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Generate FAQ collection with schema markup (AI-powered)
   */
  async generateFAQCollection(topic: string, maxItems: number = 10): Promise<FAQCollection> {
    const items = await this.generateFAQItems(topic, maxItems);
    const schemaMarkup = this.generateFAQSchema(items);

    return {
      topic,
      items,
      schemaMarkup,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Generate editorial plan for content strategy
   */
  generateEditorialPlan(topic: string, itemCount: number = 10, weeks: number = 4): EditorialPlan {
    const contentItems = this.planContentItems(topic, itemCount);
    const topicCoverage = this.calculateTopicCoverage(contentItems);
    const projectedImpact = this.projectImpact(contentItems);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + weeks * 7);

    return {
      id: `plan-${Date.now()}`,
      name: `${topic} Content Strategy`,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      contentItems,
      topicCoverage,
      projectedImpact,
    };
  }

  private determineIntent(keyword: string): IntentStage {
    const lower = keyword.toLowerCase();

    if (lower.includes('buy') || lower.includes('price') || lower.includes('deal') || lower.includes('discount')) {
      return IntentStage.TRANSACTIONAL;
    }
    if (lower.includes('vs') || lower.includes('compare') || lower.includes('best') || lower.includes('top')) {
      return IntentStage.COMPARATIVE;
    }
    if (lower.includes('how to') || lower.includes('fix') || lower.includes('solve') || lower.includes('guide')) {
      return IntentStage.PROBLEM_SOLUTION;
    }
    if (lower.includes('review') || lower.includes('reliable') || lower.includes('worth')) {
      return IntentStage.TRUST_DRIVEN;
    }
    return IntentStage.INFORMATIONAL;
  }

  private async generateTitle(keyword: string, intent: IntentStage, angle?: string): Promise<string> {
    try {
      // Try AI generation first
      return await this.contentGenerator.generateContentTitle(keyword, intent, angle);
    } catch (error) {
      this.logger.warn(`AI title generation failed, using fallback: ${error.message}`);

      // Fallback to static templates
      const titleTemplates: Record<IntentStage, string[]> = {
        [IntentStage.INFORMATIONAL]: [
          `The Complete Guide to ${this.capitalize(keyword)} (${new Date().getFullYear()} Edition)`,
          `Everything You Need to Know About ${this.capitalize(keyword)}`,
          `${this.capitalize(keyword)}: A Comprehensive Overview`,
        ],
        [IntentStage.COMPARATIVE]: [
          `Best ${this.capitalize(keyword)}: Top Solutions Compared`,
          `${this.capitalize(keyword)} Comparison: Find Your Perfect Match`,
          `Top 10 ${this.capitalize(keyword)} Solutions Reviewed`,
        ],
        [IntentStage.TRANSACTIONAL]: [
          `${this.capitalize(keyword)}: Pricing, Features & How to Get Started`,
          `Get the Best ${this.capitalize(keyword)} for Your Business`,
          `${this.capitalize(keyword)}: Ultimate Buying Guide`,
        ],
        [IntentStage.PROBLEM_SOLUTION]: [
          `How to Master ${this.capitalize(keyword)}: Step-by-Step Guide`,
          `${this.capitalize(keyword)} Made Easy: Practical Solutions`,
          `Solving ${this.capitalize(keyword)} Challenges: Expert Tips`,
        ],
        [IntentStage.TRUST_DRIVEN]: [
          `${this.capitalize(keyword)} Review: Honest Assessment & Results`,
          `Is ${this.capitalize(keyword)} Worth It? Real User Insights`,
          `${this.capitalize(keyword)}: What Experts Say`,
        ],
      };

      const templates = titleTemplates[intent] || titleTemplates[IntentStage.INFORMATIONAL];
      let title = templates[Math.floor(Math.random() * templates.length)];

      if (angle) {
        title = title.replace(`${new Date().getFullYear()} Edition`, angle).replace('A Comprehensive Overview', angle);
      }

      return title;
    }
  }

  private calculateWordCount(intent: IntentStage, keyword: string): { min: number; max: number } {
    const wordCountByIntent: Record<IntentStage, { min: number; max: number }> = {
      [IntentStage.INFORMATIONAL]: { min: 2000, max: 3500 },
      [IntentStage.COMPARATIVE]: { min: 2500, max: 4000 },
      [IntentStage.TRANSACTIONAL]: { min: 1500, max: 2500 },
      [IntentStage.PROBLEM_SOLUTION]: { min: 1800, max: 3000 },
      [IntentStage.TRUST_DRIVEN]: { min: 2000, max: 3000 },
    };
    return wordCountByIntent[intent] || { min: 1500, max: 2500 };
  }

  private async generateOutline(keyword: string, intent: IntentStage, targetWordCount: number): Promise<ContentOutlineItem[]> {
    try {
      // Try AI generation first
      const aiOutline = await this.contentGenerator.generateContentOutline(keyword, intent, targetWordCount);

      // Convert AI outline to our format
      const outline: ContentOutlineItem[] = [
        {
          heading: aiOutline.introduction.heading,
          level: 'h1',
          keyPoints: aiOutline.introduction.keyPoints,
          suggestedWordCount: 200,
        },
      ];

      for (const section of aiOutline.sections) {
        outline.push({
          heading: section.heading,
          level: 'h2',
          keyPoints: section.keyPoints,
          suggestedWordCount: Math.floor(targetWordCount / aiOutline.sections.length),
        });

        if (section.subsections) {
          for (const subsection of section.subsections) {
            outline.push({
              heading: subsection.heading,
              level: 'h3',
              keyPoints: subsection.keyPoints,
              suggestedWordCount: 200,
            });
          }
        }
      }

      outline.push({
        heading: aiOutline.conclusion.heading,
        level: 'h2',
        keyPoints: aiOutline.conclusion.keyPoints,
        suggestedWordCount: 200,
      });

      return outline;
    } catch (error) {
      this.logger.warn(`AI outline generation failed, using fallback: ${error.message}`);
      return this.generateFallbackOutline(keyword, intent);
    }
  }

  private generateFallbackOutline(keyword: string, intent: IntentStage): ContentOutlineItem[] {
    const baseOutline: ContentOutlineItem[] = [
      {
        heading: `Complete Guide to ${this.capitalize(keyword)}`,
        level: 'h1',
        keyPoints: ['Main topic introduction', 'Why this matters', 'What reader will learn'],
        suggestedWordCount: 200,
      },
      {
        heading: `What is ${this.capitalize(keyword)}?`,
        level: 'h2',
        keyPoints: ['Clear definition', 'Historical context', 'Current relevance'],
        suggestedWordCount: 350,
      },
    ];

    // Add intent-specific sections
    if (intent === IntentStage.INFORMATIONAL) {
      baseOutline.push(
        {
          heading: `Key Benefits of ${this.capitalize(keyword)}`,
          level: 'h2',
          keyPoints: ['Primary benefits', 'Secondary advantages', 'Long-term value'],
          suggestedWordCount: 400,
        },
        {
          heading: `How ${this.capitalize(keyword)} Works`,
          level: 'h2',
          keyPoints: ['Core mechanics', 'Step-by-step process', 'Real-world examples'],
          suggestedWordCount: 500,
        },
        {
          heading: 'Common Challenges and Solutions',
          level: 'h2',
          keyPoints: ['Challenge 1 + solution', 'Challenge 2 + solution', 'Expert tips'],
          suggestedWordCount: 400,
        },
      );
    } else if (intent === IntentStage.COMPARATIVE) {
      baseOutline.push(
        {
          heading: 'Top Solutions Compared',
          level: 'h2',
          keyPoints: ['Comparison criteria', 'Side-by-side features', 'Pricing overview'],
          suggestedWordCount: 600,
        },
        {
          heading: 'Detailed Reviews',
          level: 'h2',
          keyPoints: ['Solution 1 deep-dive', 'Solution 2 deep-dive', 'Solution 3 deep-dive'],
          suggestedWordCount: 800,
        },
        {
          heading: 'How to Choose the Right Option',
          level: 'h2',
          keyPoints: ['Decision factors', 'Use case matching', 'Budget considerations'],
          suggestedWordCount: 350,
        },
      );
    } else if (intent === IntentStage.PROBLEM_SOLUTION) {
      baseOutline.push(
        {
          heading: 'Understanding the Problem',
          level: 'h2',
          keyPoints: ['Problem identification', 'Impact assessment', 'Root causes'],
          suggestedWordCount: 300,
        },
        {
          heading: 'Step-by-Step Solution Guide',
          level: 'h2',
          keyPoints: ['Step 1', 'Step 2', 'Step 3', 'Step 4'],
          suggestedWordCount: 700,
        },
        {
          heading: 'Advanced Tips and Tricks',
          level: 'h2',
          keyPoints: ['Pro techniques', 'Time-saving shortcuts', 'Common mistakes to avoid'],
          suggestedWordCount: 400,
        },
      );
    }

    // Add conclusion
    baseOutline.push({
      heading: 'Conclusion and Next Steps',
      level: 'h2',
      keyPoints: ['Key takeaways', 'Actionable next steps', 'CTA'],
      suggestedWordCount: 250,
    });

    return baseOutline;
  }

  private generateQuestionsToAnswer(keyword: string): string[] {
    return [
      `What is ${keyword} and why is it important?`,
      `How can ${keyword} benefit my business/life?`,
      `What are the key features to look for in ${keyword}?`,
      `How do I get started with ${keyword}?`,
      `What are common mistakes to avoid with ${keyword}?`,
      `How much does ${keyword} typically cost?`,
      `What are the alternatives to ${keyword}?`,
      `How do I measure success with ${keyword}?`,
    ];
  }

  private extractRelatedKeywords(keyword: string): string[] {
    const words = keyword.split(' ');
    const related: string[] = [
      keyword,
      `best ${keyword}`,
      `${keyword} tips`,
      `${keyword} guide`,
      `${keyword} for beginners`,
      `${keyword} examples`,
      `how to ${keyword}`,
      `${keyword} tools`,
      `${keyword} software`,
      `${keyword} strategy`,
    ];
    return related;
  }

  private analyzeCompetitorContent(keyword: string): CompetitorContentInsight[] {
    // Simulated competitor analysis
    const competitors = [
      {
        competitorDomain: 'competitor1.com',
        contentTitle: `Ultimate Guide to ${this.capitalize(keyword)}`,
        wordCount: 3200,
        headings: ['Introduction', 'What is it', 'Benefits', 'How to', 'Tools', 'Conclusion'],
        uniqueAngles: ['Case study included', 'Expert interviews', 'Video walkthrough'],
      },
      {
        competitorDomain: 'competitor2.com',
        contentTitle: `${this.capitalize(keyword)} Complete Tutorial`,
        wordCount: 2800,
        headings: ['Overview', 'Step-by-step guide', 'Best practices', 'FAQ'],
        uniqueAngles: ['Interactive examples', 'Downloadable templates'],
      },
      {
        competitorDomain: 'competitor3.com',
        contentTitle: `Everything About ${this.capitalize(keyword)}`,
        wordCount: 4100,
        headings: ['Basics', 'Advanced techniques', 'Industry trends', 'Future outlook'],
        uniqueAngles: ['Original research', 'Industry benchmarks'],
      },
    ];
    return competitors;
  }

  private generateCTA(intent: IntentStage): string {
    const ctas: Record<IntentStage, string> = {
      [IntentStage.INFORMATIONAL]: 'Subscribe for more in-depth guides and updates.',
      [IntentStage.COMPARATIVE]: 'Start your free trial today and see the difference.',
      [IntentStage.TRANSACTIONAL]: 'Get started now with our special offer.',
      [IntentStage.PROBLEM_SOLUTION]: 'Download our free toolkit to implement these solutions.',
      [IntentStage.TRUST_DRIVEN]: 'Join thousands of satisfied customers today.',
    };
    return ctas[intent] || ctas[IntentStage.INFORMATIONAL];
  }

  private async generateFAQItems(topic: string, maxItems: number): Promise<FAQItem[]> {
    try {
      // Try AI generation first
      const aiFAQs = await this.contentGenerator.generateFAQ(topic, maxItems);

      return aiFAQs.map((faq, idx) => ({
        question: faq.question,
        answer: faq.answer,
        keywords: [topic, ...this.extractKeywordsFromQuestion(faq.question, topic)],
        intent: this.determineIntent(faq.question),
        schemaReady: true,
        priority: maxItems - idx,
      }));
    } catch (error) {
      this.logger.warn(`AI FAQ generation failed, using fallback: ${error.message}`);

      // Fallback to static templates
      const questionTemplates = [
        { q: `What is ${topic}?`, intent: IntentStage.INFORMATIONAL },
        { q: `How does ${topic} work?`, intent: IntentStage.INFORMATIONAL },
        { q: `Why is ${topic} important?`, intent: IntentStage.INFORMATIONAL },
        { q: `What are the benefits of ${topic}?`, intent: IntentStage.INFORMATIONAL },
        { q: `How much does ${topic} cost?`, intent: IntentStage.TRANSACTIONAL },
        { q: `How do I get started with ${topic}?`, intent: IntentStage.PROBLEM_SOLUTION },
        { q: `What are the best ${topic} tools?`, intent: IntentStage.COMPARATIVE },
        { q: `Is ${topic} worth the investment?`, intent: IntentStage.TRUST_DRIVEN },
        { q: `How long does it take to see results from ${topic}?`, intent: IntentStage.INFORMATIONAL },
        { q: `What are common ${topic} mistakes to avoid?`, intent: IntentStage.PROBLEM_SOLUTION },
        { q: `Can ${topic} be automated?`, intent: IntentStage.PROBLEM_SOLUTION },
        { q: `What skills are needed for ${topic}?`, intent: IntentStage.INFORMATIONAL },
      ];

      return questionTemplates.slice(0, maxItems).map((template, idx) => ({
        question: template.q,
        answer: this.generateAnswer(template.q, topic),
        keywords: [topic, ...this.extractKeywordsFromQuestion(template.q, topic)],
        intent: template.intent,
        schemaReady: true,
        priority: maxItems - idx,
      }));
    }
  }

  private generateAnswer(question: string, topic: string): string {
    const lower = question.toLowerCase();

    if (lower.includes('what is')) {
      return `${this.capitalize(topic)} is a strategic approach that helps businesses and individuals achieve their goals more effectively. It encompasses a range of practices, tools, and methodologies designed to optimize outcomes and drive measurable results.`;
    }
    if (lower.includes('how does') || lower.includes('how do')) {
      return `${this.capitalize(topic)} works by systematically analyzing your current situation, identifying opportunities for improvement, and implementing targeted strategies. The process typically involves assessment, planning, execution, and continuous optimization.`;
    }
    if (lower.includes('cost')) {
      return `The cost of ${topic} varies depending on your specific needs and chosen approach. Basic implementations may start at minimal investment, while comprehensive solutions can range significantly. Consider the potential ROI when evaluating costs.`;
    }
    if (lower.includes('benefit')) {
      return `The key benefits of ${topic} include improved efficiency, better outcomes, cost savings, competitive advantage, and enhanced decision-making capabilities. Organizations typically see measurable improvements within the first few months of implementation.`;
    }
    if (lower.includes('worth')) {
      return `${this.capitalize(topic)} is generally considered a worthwhile investment for organizations committed to growth and optimization. The key is to align your approach with your specific goals and measure results consistently.`;
    }

    return `Understanding ${topic} requires considering multiple factors specific to your situation. We recommend starting with a thorough assessment of your current state and goals, then developing a tailored approach that addresses your unique needs.`;
  }

  private extractKeywordsFromQuestion(question: string, topic: string): string[] {
    const words = question.toLowerCase()
      .replace(/[?.,!]/g, '')
      .split(' ')
      .filter(w => w.length > 3 && !['what', 'how', 'does', 'work', 'the', 'are', 'with'].includes(w));
    return [...new Set([...words, topic])].slice(0, 5);
  }

  private generateFAQSchema(items: FAQItem[]): string {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    };
    return JSON.stringify(faqSchema, null, 2);
  }

  private planContentItems(topic: string, itemCount: number): EditorialItem[] {
    const contentTypes: Array<EditorialItem['contentType']> = [
      'blog', 'guide', 'comparison', 'tutorial', 'faq', 'case_study',
    ];
    const intents = Object.values(IntentStage);
    const items: EditorialItem[] = [];

    const topicVariations = [
      `${topic} basics`,
      `advanced ${topic}`,
      `${topic} for beginners`,
      `${topic} best practices`,
      `${topic} tools review`,
      `how to ${topic}`,
      `${topic} strategy`,
      `${topic} case study`,
      `${topic} trends`,
      `${topic} mistakes to avoid`,
      `${topic} vs alternatives`,
      `${topic} automation`,
    ];

    for (let i = 0; i < itemCount; i++) {
      const contentType = contentTypes[i % contentTypes.length];
      const intent = intents[i % intents.length];
      const keyword = topicVariations[i % topicVariations.length];

      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + Math.floor(i * 3.5));

      items.push({
        id: `item-${Date.now()}-${i}`,
        title: `${this.capitalize(keyword)}: ${contentType}`,
        targetKeyword: keyword,
        contentType,
        intent,
        priority: itemCount - i,
        scheduledDate: scheduledDate.toISOString().split('T')[0],
        status: 'planned',
        projectedTraffic: Math.floor(500 + Math.random() * 2000),
      });
    }

    return items;
  }

  private calculateTopicCoverage(items: EditorialItem[]): TopicCoverageMap {
    const clusterMap = new Map<string, { current: number; planned: number; count: number }>();

    items.forEach(item => {
      const cluster = item.targetKeyword.split(' ')[0];
      const existing = clusterMap.get(cluster) || { current: 0, planned: 0, count: 0 };
      existing.planned += 25;
      existing.count++;
      clusterMap.set(cluster, existing);
    });

    return {
      clusters: Array.from(clusterMap.entries()).map(([topic, data]) => ({
        topic,
        currentCoverage: data.current,
        plannedCoverage: Math.min(100, data.planned),
        contentCount: data.count,
      })),
    };
  }

  private projectImpact(items: EditorialItem[]): KeywordProjectedImpact {
    const intentDistribution = items.reduce((acc, item) => {
      acc[item.intent] = (acc[item.intent] || 0) + 1;
      return acc;
    }, {} as Record<IntentStage, number>);

    return {
      estimatedTraffic: items.reduce((sum, item) => sum + item.projectedTraffic, 0),
      keywordsCovered: items.length * 3,
      intentDistribution,
      topicAuthority: Math.min(100, 40 + items.length * 5),
    };
  }

  private capitalize(str: string): string {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
}
