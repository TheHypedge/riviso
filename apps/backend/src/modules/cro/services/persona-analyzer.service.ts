import { Injectable, Logger } from '@nestjs/common';
import {
  AudienceAnalysis,
  BuyerPersona,
  TrafficSegment,
  BuyingStageDistribution,
  Psychographics,
  BehavioralTrigger,
  Demographics,
  BuyingBehavior,
  CustomerIntent,
  NicheAnalysis,
} from '@riviso/shared-types';
import { ContentGeneratorService } from '../../ai/services/content-generator.service';

/**
 * Analyzes target audience, creates buyer personas,
 * and identifies customer intent and buying stages
 */
@Injectable()
export class PersonaAnalyzerService {
  private readonly logger = new Logger(PersonaAnalyzerService.name);

  constructor(private readonly contentGenerator: ContentGeneratorService) {}

  private readonly industryPersonaTemplates: Record<string, Partial<BuyerPersona>[]> = {
    'E-commerce / Retail': [
      {
        name: 'Value-Conscious Shopper',
        description: 'Price-sensitive buyer looking for deals and value',
        goals: ['Find best prices', 'Get quality products', 'Save money'],
        painPoints: ['High prices', 'Hidden fees', 'Slow shipping'],
        objections: ['Is this the best price?', 'Will it arrive on time?'],
        decisionFactors: ['Price', 'Reviews', 'Shipping speed', 'Return policy'],
      },
      {
        name: 'Convenience Seeker',
        description: 'Busy professional who values speed and ease',
        goals: ['Quick purchase', 'Hassle-free experience', 'Reliable delivery'],
        painPoints: ['Complicated checkout', 'Slow website', 'Poor mobile experience'],
        objections: ['Is checkout secure?', 'Can I return easily?'],
        decisionFactors: ['Ease of use', 'Fast checkout', 'Mobile experience'],
      },
    ],
    'SaaS / Software': [
      {
        name: 'Decision Maker',
        description: 'C-level or manager evaluating software solutions',
        goals: ['Improve efficiency', 'Reduce costs', 'Scale operations'],
        painPoints: ['Integration challenges', 'Learning curve', 'ROI uncertainty'],
        objections: ['Does it integrate with our stack?', 'What\'s the TCO?'],
        decisionFactors: ['Features', 'Integrations', 'Pricing', 'Support'],
      },
      {
        name: 'Technical Evaluator',
        description: 'Developer or IT professional assessing technical fit',
        goals: ['Solve technical problems', 'Easy implementation', 'Good documentation'],
        painPoints: ['Poor API docs', 'Limited customization', 'Vendor lock-in'],
        objections: ['Is the API robust?', 'Can we self-host?'],
        decisionFactors: ['Technical capabilities', 'Documentation', 'Security'],
      },
    ],
    'Professional Services': [
      {
        name: 'Business Owner',
        description: 'SMB owner looking for expert help',
        goals: ['Grow business', 'Solve specific problem', 'Get expert guidance'],
        painPoints: ['Limited budget', 'Past bad experiences', 'Unclear ROI'],
        objections: ['How do I know you\'re qualified?', 'What results can I expect?'],
        decisionFactors: ['Expertise', 'Case studies', 'Testimonials', 'Price'],
      },
    ],
    'Healthcare': [
      {
        name: 'Concerned Patient',
        description: 'Individual seeking health solutions',
        goals: ['Find treatment', 'Get answers', 'Feel better'],
        painPoints: ['Confusion about options', 'Cost concerns', 'Trust issues'],
        objections: ['Is this safe?', 'Will insurance cover it?'],
        decisionFactors: ['Credentials', 'Reviews', 'Insurance acceptance'],
      },
    ],
    'Education': [
      {
        name: 'Career Advancer',
        description: 'Professional seeking to upskill',
        goals: ['Learn new skills', 'Advance career', 'Get certified'],
        painPoints: ['Time constraints', 'Information overload', 'Credential value'],
        objections: ['Is this certification recognized?', 'Can I fit it into my schedule?'],
        decisionFactors: ['Curriculum quality', 'Flexibility', 'Outcomes', 'Price'],
      },
    ],
  };

  private readonly behavioralTriggers: BehavioralTrigger[] = [
    {
      trigger: 'Limited time offer',
      type: 'urgency',
      effectiveness: 75,
      recommendation: 'Add countdown timers and deadline messaging',
    },
    {
      trigger: 'Only X left in stock',
      type: 'scarcity',
      effectiveness: 70,
      recommendation: 'Show inventory levels and sold counts',
    },
    {
      trigger: 'Join 10,000+ customers',
      type: 'social_proof',
      effectiveness: 80,
      recommendation: 'Display customer counts, reviews, and testimonials prominently',
    },
    {
      trigger: 'Featured in Forbes, TechCrunch',
      type: 'authority',
      effectiveness: 72,
      recommendation: 'Add media logos and expert endorsements',
    },
    {
      trigger: 'Free trial, no credit card',
      type: 'reciprocity',
      effectiveness: 78,
      recommendation: 'Offer free value upfront to create reciprocity',
    },
    {
      trigger: 'Start with step 1',
      type: 'commitment',
      effectiveness: 65,
      recommendation: 'Break process into small commitments',
    },
  ];

  /**
   * Analyze audience and generate personas based on website content and niche
   */
  async analyzeAudience(
    nicheAnalysis: NicheAnalysis,
    content: {
      bodyText?: string;
      headings?: string[];
      ctas?: string[];
      pricing?: { type: string; lowest?: number; highest?: number };
    },
  ): Promise<AudienceAnalysis> {
    // Get industry-specific persona templates
    const templatePersonas = this.getPersonaTemplates(nicheAnalysis.primaryIndustry);

    // Enhance personas with content analysis
    const primaryPersona = this.buildPrimaryPersona(templatePersonas[0], nicheAnalysis, content);
    const secondaryPersonas = templatePersonas.slice(1).map(template =>
      this.buildSecondaryPersona(template, nicheAnalysis),
    );

    // Analyze traffic segments
    const trafficSegments = this.analyzeTrafficSegments(nicheAnalysis, content);

    // Determine buying stage distribution
    const buyingStages = this.analyzeBuyingStages(content);

    // Build psychographics with AI-powered behavioral triggers
    const psychographics = await this.buildPsychographics(nicheAnalysis, content);

    return {
      primaryPersona,
      secondaryPersonas,
      trafficSegments,
      buyingStages,
      psychographics,
    };
  }

  private getPersonaTemplates(industry: string): Partial<BuyerPersona>[] {
    // Try exact match first
    if (this.industryPersonaTemplates[industry]) {
      return this.industryPersonaTemplates[industry];
    }

    // Try partial match
    for (const [key, templates] of Object.entries(this.industryPersonaTemplates)) {
      if (industry.toLowerCase().includes(key.toLowerCase().split(' ')[0])) {
        return templates;
      }
    }

    // Default templates
    return [
      {
        name: 'Primary Buyer',
        description: 'Main target customer',
        goals: ['Solve problem', 'Get value', 'Make informed decision'],
        painPoints: ['Uncertainty', 'Budget constraints', 'Time pressure'],
        objections: ['Is this worth it?', 'Can I trust this?'],
        decisionFactors: ['Value', 'Trust', 'Ease of use'],
      },
      {
        name: 'Secondary Buyer',
        description: 'Alternative customer segment',
        goals: ['Find solution', 'Compare options'],
        painPoints: ['Too many choices', 'Unclear benefits'],
        objections: ['Why this over alternatives?'],
        decisionFactors: ['Differentiation', 'Price', 'Support'],
      },
    ];
  }

  private buildPrimaryPersona(
    template: Partial<BuyerPersona>,
    nicheAnalysis: NicheAnalysis,
    content: {
      pricing?: { type: string; lowest?: number; highest?: number };
    },
  ): BuyerPersona {
    const demographics = this.inferDemographics(nicheAnalysis, content);
    const buyingBehavior = this.inferBuyingBehavior(nicheAnalysis);

    return {
      id: `persona-${Date.now()}`,
      name: template.name || 'Primary Customer',
      description: template.description || 'Main target audience',
      demographics,
      goals: template.goals || [],
      painPoints: template.painPoints || [],
      objections: template.objections || [],
      decisionFactors: template.decisionFactors || [],
      preferredChannels: this.getPreferredChannels(nicheAnalysis),
      contentPreferences: this.getContentPreferences(nicheAnalysis),
      buyingBehavior,
    };
  }

  private buildSecondaryPersona(
    template: Partial<BuyerPersona>,
    nicheAnalysis: NicheAnalysis,
  ): BuyerPersona {
    return {
      id: `persona-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: template.name || 'Secondary Customer',
      description: template.description || 'Alternative target segment',
      demographics: {},
      goals: template.goals || [],
      painPoints: template.painPoints || [],
      objections: template.objections || [],
      decisionFactors: template.decisionFactors || [],
      preferredChannels: this.getPreferredChannels(nicheAnalysis),
      contentPreferences: [],
      buyingBehavior: this.inferBuyingBehavior(nicheAnalysis),
    };
  }

  private inferDemographics(
    nicheAnalysis: NicheAnalysis,
    content: {
      pricing?: { type: string; lowest?: number; highest?: number };
    },
  ): Demographics {
    const demographics: Demographics = {};

    // Infer income level from pricing
    if (content.pricing?.highest) {
      if (content.pricing.highest > 1000) {
        demographics.incomeLevel = 'premium';
      } else if (content.pricing.highest > 100) {
        demographics.incomeLevel = 'high';
      } else {
        demographics.incomeLevel = 'medium';
      }
    }

    // Infer from industry
    const industryDemographics: Record<string, Partial<Demographics>> = {
      'SaaS / Software': { occupation: 'Business Professional', education: 'College+' },
      'E-commerce / Retail': { ageRange: '25-54', gender: 'all' },
      'Healthcare': { ageRange: '35-65' },
      'Education': { ageRange: '22-45', education: 'High School+' },
      'Finance / Banking': { incomeLevel: 'high', occupation: 'Professional' },
      'Professional Services': { occupation: 'Business Owner/Manager' },
    };

    const industryDemo = industryDemographics[nicheAnalysis.primaryIndustry];
    if (industryDemo) {
      Object.assign(demographics, industryDemo);
    }

    return demographics;
  }

  private inferBuyingBehavior(nicheAnalysis: NicheAnalysis): BuyingBehavior {
    const modelBehaviors: Record<string, Partial<BuyingBehavior>> = {
      'ecommerce': { decisionSpeed: 'impulsive', priceSensitivity: 'high', researchDepth: 'minimal' },
      'saas': { decisionSpeed: 'extended', priceSensitivity: 'medium', researchDepth: 'extensive' },
      'lead_generation': { decisionSpeed: 'considered', researchDepth: 'moderate' },
      'subscription': { decisionSpeed: 'considered', priceSensitivity: 'medium' },
      'service_business': { decisionSpeed: 'extended', researchDepth: 'extensive' },
    };

    const behavior = modelBehaviors[nicheAnalysis.businessModel] || {};

    return {
      decisionSpeed: behavior.decisionSpeed || 'considered',
      priceSensitivity: behavior.priceSensitivity || 'medium',
      researchDepth: behavior.researchDepth || 'moderate',
      socialInfluence: 'medium',
    };
  }

  private getPreferredChannels(nicheAnalysis: NicheAnalysis): string[] {
    const channelsByModel: Record<string, string[]> = {
      'ecommerce': ['Google Search', 'Social Media', 'Email', 'Retargeting Ads'],
      'saas': ['Google Search', 'LinkedIn', 'Content Marketing', 'Webinars'],
      'lead_generation': ['Google Search', 'LinkedIn', 'Referrals', 'Content'],
      'content_publisher': ['Social Media', 'Email Newsletter', 'Search'],
      'service_business': ['Google Search', 'Referrals', 'LinkedIn', 'Local SEO'],
    };

    return channelsByModel[nicheAnalysis.businessModel] || ['Google Search', 'Social Media', 'Email'];
  }

  private getContentPreferences(nicheAnalysis: NicheAnalysis): string[] {
    const preferencesByModel: Record<string, string[]> = {
      'ecommerce': ['Product images', 'Reviews', 'Comparison tables', 'Video demos'],
      'saas': ['Feature comparisons', 'Case studies', 'ROI calculators', 'Demo videos'],
      'lead_generation': ['Case studies', 'Whitepapers', 'Testimonials', 'FAQ'],
      'service_business': ['Portfolio', 'Case studies', 'Team bios', 'Process explanations'],
      'education': ['Curriculum details', 'Success stories', 'Sample content', 'Instructor bios'],
    };

    return preferencesByModel[nicheAnalysis.businessModel] || ['Testimonials', 'Case studies', 'FAQ'];
  }

  private analyzeTrafficSegments(
    nicheAnalysis: NicheAnalysis,
    content: { ctas?: string[] },
  ): TrafficSegment[] {
    const segments: TrafficSegment[] = [];

    // Analyze CTAs to understand conversion potential
    const hasStrongCta = content.ctas?.some(cta =>
      /buy|purchase|start|try|get started|sign up/i.test(cta),
    );

    if (nicheAnalysis.businessModel === 'ecommerce') {
      segments.push(
        { name: 'Ready to Buy', percentage: 25, intent: 'decision', conversionPotential: 85 },
        { name: 'Comparison Shopping', percentage: 35, intent: 'consideration', conversionPotential: 45 },
        { name: 'Just Browsing', percentage: 40, intent: 'awareness', conversionPotential: 15 },
      );
    } else if (nicheAnalysis.businessModel === 'saas') {
      segments.push(
        { name: 'Ready for Trial', percentage: 15, intent: 'decision', conversionPotential: 70 },
        { name: 'Evaluating Options', percentage: 40, intent: 'consideration', conversionPotential: 35 },
        { name: 'Research Phase', percentage: 35, intent: 'awareness', conversionPotential: 10 },
        { name: 'Existing Users', percentage: 10, intent: 'retention', conversionPotential: 50 },
      );
    } else if (nicheAnalysis.businessModel === 'lead_generation') {
      segments.push(
        { name: 'Ready to Contact', percentage: 20, intent: 'decision', conversionPotential: 60 },
        { name: 'Gathering Information', percentage: 50, intent: 'consideration', conversionPotential: 25 },
        { name: 'Problem Aware', percentage: 30, intent: 'awareness', conversionPotential: 8 },
      );
    } else {
      segments.push(
        { name: 'High Intent', percentage: 20, intent: 'decision', conversionPotential: 55 },
        { name: 'Medium Intent', percentage: 45, intent: 'consideration', conversionPotential: 25 },
        { name: 'Low Intent', percentage: 35, intent: 'awareness', conversionPotential: 10 },
      );
    }

    return segments;
  }

  private analyzeBuyingStages(content: {
    bodyText?: string;
    ctas?: string[];
  }): BuyingStageDistribution {
    // Analyze content to estimate stage distribution
    const text = (content.bodyText || '').toLowerCase();
    const ctas = (content.ctas || []).join(' ').toLowerCase();

    // Default distribution
    const distribution: BuyingStageDistribution = {
      awareness: 30,
      consideration: 40,
      decision: 20,
      retention: 10,
    };

    // Adjust based on content signals
    if (text.includes('learn') || text.includes('what is') || text.includes('guide')) {
      distribution.awareness += 10;
      distribution.decision -= 5;
      distribution.consideration -= 5;
    }

    if (text.includes('compare') || text.includes('vs') || text.includes('alternative')) {
      distribution.consideration += 10;
      distribution.awareness -= 5;
      distribution.decision -= 5;
    }

    if (ctas.includes('buy') || ctas.includes('start') || ctas.includes('get')) {
      distribution.decision += 15;
      distribution.awareness -= 10;
      distribution.consideration -= 5;
    }

    return distribution;
  }

  private async buildPsychographics(
    nicheAnalysis: NicheAnalysis,
    content: { bodyText?: string; ctas?: string[] },
  ): Promise<Psychographics> {
    const text = (content.bodyText || '').toLowerCase();

    // Extract motivations from content
    const motivations: string[] = [];
    if (text.includes('save time')) motivations.push('Time savings');
    if (text.includes('save money')) motivations.push('Cost reduction');
    if (text.includes('grow')) motivations.push('Growth & success');
    if (text.includes('secure') || text.includes('safe')) motivations.push('Security & safety');
    if (text.includes('easy') || text.includes('simple')) motivations.push('Simplicity');
    if (motivations.length === 0) {
      motivations.push('Solve a problem', 'Get value', 'Make life easier');
    }

    // Extract fears/concerns
    const fears: string[] = [];
    if (nicheAnalysis.businessModel === 'saas') {
      fears.push('Wasted investment', 'Implementation complexity', 'Vendor lock-in');
    } else if (nicheAnalysis.businessModel === 'ecommerce') {
      fears.push('Product not as described', 'Shipping issues', 'Difficult returns');
    } else {
      fears.push('Making wrong choice', 'Wasting money', 'Poor service');
    }

    // Extract values
    const values = ['Quality', 'Reliability', 'Value for money'];
    if (text.includes('sustainable') || text.includes('eco')) values.push('Sustainability');
    if (text.includes('innovative')) values.push('Innovation');

    // Select relevant behavioral triggers using AI
    const relevantTriggers = await this.selectRelevantTriggers(nicheAnalysis, content);

    return {
      motivations,
      fears,
      values,
      triggers: relevantTriggers,
    };
  }

  private async selectRelevantTriggers(
    nicheAnalysis: NicheAnalysis,
    content: { ctas?: string[] }
  ): Promise<BehavioralTrigger[]> {
    try {
      // Try AI generation first
      const aiTriggers = await this.contentGenerator.generateBehavioralTriggers({
        industry: nicheAnalysis.primaryIndustry,
        businessModel: nicheAnalysis.businessModel,
        currentCtas: content.ctas || [],
      });

      // Convert to expected format
      return aiTriggers.map(t => ({
        trigger: t.name,
        type: this.mapTriggerType(t.name),
        effectiveness: t.effectiveness,
        recommendation: t.implementation,
      }));
    } catch (error) {
      this.logger.warn(`AI trigger generation failed, using fallback: ${error.message}`);

      // Fallback to static triggers
      const allTriggers = [...this.behavioralTriggers];

      // Prioritize triggers based on business model
      if (nicheAnalysis.businessModel === 'ecommerce') {
        return allTriggers.filter(t => ['urgency', 'scarcity', 'social_proof'].includes(t.type));
      }
      if (nicheAnalysis.businessModel === 'saas') {
        return allTriggers.filter(t => ['social_proof', 'authority', 'reciprocity'].includes(t.type));
      }
      if (nicheAnalysis.businessModel === 'lead_generation') {
        return allTriggers.filter(t => ['authority', 'social_proof', 'reciprocity'].includes(t.type));
      }

      return allTriggers.slice(0, 4);
    }
  }

  private mapTriggerType(triggerName: string): 'urgency' | 'scarcity' | 'social_proof' | 'authority' | 'reciprocity' | 'commitment' {
    const lowerName = triggerName.toLowerCase();
    if (lowerName.includes('scarcity')) return 'scarcity';
    if (lowerName.includes('urgency') || lowerName.includes('time')) return 'urgency';
    if (lowerName.includes('social') || lowerName.includes('proof')) return 'social_proof';
    if (lowerName.includes('authority')) return 'authority';
    if (lowerName.includes('reciprocity') || lowerName.includes('free')) return 'reciprocity';
    if (lowerName.includes('commitment')) return 'commitment';
    return 'social_proof';
  }
}
