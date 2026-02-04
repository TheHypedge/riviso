import { Injectable, Logger } from '@nestjs/common';
import {
  UxAnalysis,
  UxIssue,
  UiAnalysis,
  UiIssue,
  CopyAnalysis,
  CopyIssue,
  ValuePropositionAnalysis,
  HeadlineAnalysis,
  BodyContentAnalysis,
  CtaAnalysis,
  CtaElement,
  CtaIssue,
  TrustAnalysis,
  TrustSignal,
  SocialProofAnalysis,
  SecurityIndicator,
  NavigationAnalysis,
  NavigationIssue,
  FrictionAnalysis,
  FrictionPoint,
  DropOffRisk,
  NicheAnalysis,
} from '@riviso/shared-types';

interface ScrapedContent {
  title?: string;
  description?: string;
  h1?: string[];
  headings?: { h2?: string[]; h3?: string[] };
  bodyText?: string;
  wordCount?: number;
  readabilityScore?: number;
  links?: { internal: number; external: number };
  images?: { total: number; withAlt: number; withoutAlt: number };
  ctas?: Array<{ text: string; href?: string }>;
  forms?: Array<{ fields: number; hasLabels: boolean }>;
  hasTestimonials?: boolean;
  hasReviews?: boolean;
  hasClientLogos?: boolean;
  hasPricingPage?: boolean;
  hasSSL?: boolean;
  loadTime?: number;
  mobileOptimized?: boolean;
  hasNavigation?: boolean;
  navItems?: number;
  hasBreadcrumbs?: boolean;
  hasSearch?: boolean;
  hasStickyHeader?: boolean;
}

/**
 * Comprehensive UX, UI, Copy, CTA, Trust, and Navigation analyzer
 */
@Injectable()
export class UxAnalyzerService {
  private readonly logger = new Logger(UxAnalyzerService.name);

  private readonly powerWords = [
    'free', 'new', 'now', 'instantly', 'guaranteed', 'proven', 'exclusive',
    'limited', 'save', 'easy', 'discover', 'secret', 'results', 'fast',
    'simple', 'amazing', 'breakthrough', 'unlock', 'transform', 'boost',
  ];

  private readonly emotionalTriggers = [
    'imagine', 'because', 'you', 'your', 'finally', 'introducing', 'announcing',
    'revolutionary', 'ultimate', 'complete', 'essential', 'powerful',
  ];

  /**
   * Analyze UX/usability of the page
   */
  analyzeUx(content: ScrapedContent, nicheAnalysis: NicheAnalysis): UxAnalysis {
    const issues: UxIssue[] = [];
    let score = 100;

    // Analyze page flow
    const pageFlow = this.assessPageFlow(content, issues);
    if (pageFlow !== 'clear') score -= 15;

    // Analyze cognitive load
    const cognitiveLoad = this.assessCognitiveLoad(content, issues);
    if (cognitiveLoad === 'high') score -= 20;

    // Analyze visual hierarchy
    const visualHierarchy = this.assessVisualHierarchy(content, issues);
    if (visualHierarchy === 'weak') score -= 15;

    // Analyze whitespace
    const whitespaceUsage = this.assessWhitespace(content, issues);
    if (whitespaceUsage !== 'good') score -= 10;

    // Analyze mobile experience
    const mobileExperience = this.assessMobileExperience(content, issues);
    if (mobileExperience === 'poor') score -= 25;

    return {
      score: Math.max(0, score),
      pageFlow,
      cognitiveLoad,
      visualHierarchy,
      whitespaceUsage,
      mobileExperience,
      issues,
    };
  }

  /**
   * Analyze UI/visual design
   */
  analyzeUi(content: ScrapedContent): UiAnalysis {
    const issues: UiIssue[] = [];
    let score = 100;

    // Check image quality issues
    if (content.images?.withoutAlt && content.images.withoutAlt > 0) {
      issues.push({
        type: 'Accessibility',
        element: 'Images',
        currentState: `${content.images.withoutAlt} images without alt text`,
        recommendedState: 'All images should have descriptive alt text',
        priority: 'medium',
      });
      score -= 10;
    }

    // Check for typography readability
    const typography = content.readabilityScore && content.readabilityScore < 50 ? 'poor' :
      content.readabilityScore && content.readabilityScore < 70 ? 'acceptable' : 'readable';
    if (typography === 'poor') {
      issues.push({
        type: 'Typography',
        element: 'Body text',
        currentState: 'Readability score below optimal',
        recommendedState: 'Simplify sentences and use clearer language',
        priority: 'high',
      });
      score -= 15;
    }

    return {
      score: Math.max(0, score),
      colorContrast: 'good', // Would need actual color analysis
      typography,
      imageQuality: content.images?.total && content.images.total > 0 ? 'medium' : 'low',
      consistency: 'consistent', // Would need deeper analysis
      brandAlignment: 75,
      accessibilityScore: content.images?.withoutAlt === 0 ? 85 : 65,
      issues,
    };
  }

  /**
   * Analyze copy/content effectiveness
   */
  analyzeCopy(content: ScrapedContent, nicheAnalysis: NicheAnalysis): CopyAnalysis {
    const issues: CopyIssue[] = [];
    const text = content.bodyText?.toLowerCase() || '';

    // Analyze value proposition
    const valueProposition = this.analyzeValueProposition(content);

    // Analyze headlines
    const headlines = this.analyzeHeadlines(content);

    // Analyze body content
    const bodyContent = this.analyzeBodyContent(content);

    // Calculate scores
    const clarity = this.calculateClarity(content);
    const persuasiveness = this.calculatePersuasiveness(text);
    const emotionalAppeal = this.calculateEmotionalAppeal(text);
    const benefitFocus = this.calculateBenefitFocus(text);

    // Detect copy issues
    this.detectCopyIssues(content, nicheAnalysis, issues);

    // Determine tone
    const tone = this.detectTone(text);

    // Determine reading level
    const readingLevel = content.readabilityScore
      ? (content.readabilityScore > 70 ? 'Easy' : content.readabilityScore > 50 ? 'Moderate' : 'Difficult')
      : 'Unknown';

    const score = Math.round((clarity + persuasiveness + emotionalAppeal + benefitFocus) / 4);

    return {
      score,
      clarity,
      persuasiveness,
      emotionalAppeal,
      benefitFocus,
      valueProposition,
      headlines,
      bodyContent,
      tone,
      readingLevel,
      issues,
    };
  }

  /**
   * Analyze CTAs
   */
  analyzeCtas(content: ScrapedContent): CtaAnalysis {
    const issues: CtaIssue[] = [];
    const ctas = content.ctas || [];

    // Find primary CTA
    const primaryCta = ctas.length > 0 ? this.analyzeCtaElement(ctas[0]) : undefined;
    const secondaryCtas = ctas.slice(1).map(cta => this.analyzeCtaElement(cta));

    // Assess CTA issues
    if (ctas.length === 0) {
      issues.push({
        currentCta: 'None',
        problem: 'No clear call-to-action found',
        suggestedCta: 'Add a prominent, action-oriented CTA button',
        rationale: 'Pages without CTAs have significantly lower conversion rates',
        expectedLift: 25,
      });
    } else {
      const ctaText = ctas[0]?.text?.toLowerCase() || '';

      // Check for weak CTA language
      if (ctaText.includes('submit') || ctaText.includes('click here')) {
        issues.push({
          currentCta: ctas[0].text,
          problem: 'Generic, low-conversion CTA text',
          suggestedCta: this.generateBetterCta(ctaText),
          rationale: 'Action-oriented CTAs with value proposition convert 90% better',
          expectedLift: 15,
        });
      }

      // Check for missing urgency
      if (!this.hasUrgencyElement(ctaText)) {
        issues.push({
          currentCta: ctas[0].text,
          problem: 'CTA lacks urgency or incentive',
          suggestedCta: `${ctas[0].text} - Limited Time`,
          rationale: 'Urgency increases click-through rates by 14%',
          expectedLift: 8,
        });
      }
    }

    // Determine overall CTA metrics
    const placement = ctas.length > 0 ? 'optimal' : 'missing';
    const visibility = ctas.length > 0 ? 'medium' : 'low';
    const urgency = ctas.some(c => this.hasUrgencyElement(c.text)) ? 'moderate' : 'weak';

    const score = ctas.length === 0 ? 20 :
      (issues.length === 0 ? 90 : 65);

    return {
      score,
      primaryCta,
      secondaryCtas,
      ctaCount: ctas.length,
      placement,
      visibility,
      urgency,
      issues,
    };
  }

  /**
   * Analyze trust signals
   */
  analyzeTrust(content: ScrapedContent): TrustAnalysis {
    const trustSignals: TrustSignal[] = [];
    const missingSignals: string[] = [];

    // Check for testimonials
    trustSignals.push({
      type: 'testimonial',
      present: content.hasTestimonials || false,
      effectiveness: content.hasTestimonials ? 75 : 0,
    });
    if (!content.hasTestimonials) missingSignals.push('Customer testimonials');

    // Check for reviews
    trustSignals.push({
      type: 'review',
      present: content.hasReviews || false,
      effectiveness: content.hasReviews ? 80 : 0,
    });
    if (!content.hasReviews) missingSignals.push('Customer reviews');

    // Check for client logos
    trustSignals.push({
      type: 'client_logo',
      present: content.hasClientLogos || false,
      effectiveness: content.hasClientLogos ? 70 : 0,
    });
    if (!content.hasClientLogos) missingSignals.push('Client/partner logos');

    // Social proof analysis
    const socialProof = this.analyzeSocialProof(content);

    // Security indicators
    const securityIndicators: SecurityIndicator[] = [
      { type: 'ssl', present: content.hasSSL || false, visible: true },
      { type: 'privacy_policy', present: true, visible: false }, // Assumed
    ];

    // Calculate scores
    const presentSignals = trustSignals.filter(s => s.present).length;
    const score = Math.min(100, 30 + presentSignals * 15);
    const credibilityScore = presentSignals >= 3 ? 80 : presentSignals >= 2 ? 60 : 40;

    return {
      score,
      trustSignals,
      missingSignals,
      socialProof,
      securityIndicators,
      credibilityScore,
    };
  }

  /**
   * Analyze navigation
   */
  analyzeNavigation(content: ScrapedContent): NavigationAnalysis {
    const issues: NavigationIssue[] = [];
    let score = 100;

    // Check navigation presence
    if (!content.hasNavigation) {
      issues.push({
        type: 'Missing Navigation',
        description: 'No clear navigation menu detected',
        recommendation: 'Add a clear navigation header',
      });
      score -= 25;
    }

    // Check navigation complexity
    const navItems = content.navItems || 0;
    let clarity: 'clear' | 'confusing' | 'overwhelming' = 'clear';
    if (navItems > 10) {
      clarity = 'overwhelming';
      issues.push({
        type: 'Too Many Items',
        description: `Navigation has ${navItems} items, which may overwhelm users`,
        recommendation: 'Consolidate navigation to 5-7 main items',
      });
      score -= 15;
    } else if (navItems < 3) {
      clarity = 'confusing';
      issues.push({
        type: 'Limited Navigation',
        description: 'Navigation may be too sparse',
        recommendation: 'Add key pages to help users explore',
      });
      score -= 10;
    }

    // Check for breadcrumbs
    if (!content.hasBreadcrumbs) {
      issues.push({
        type: 'No Breadcrumbs',
        description: 'Missing breadcrumb navigation',
        recommendation: 'Add breadcrumbs for better user orientation',
      });
      score -= 5;
    }

    // Check for search
    if (!content.hasSearch) {
      issues.push({
        type: 'No Search',
        description: 'No search functionality detected',
        recommendation: 'Add search for faster content discovery',
      });
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      clarity,
      depth: Math.min(5, Math.ceil(navItems / 5)),
      mobileOptimized: content.mobileOptimized || false,
      searchPresent: content.hasSearch || false,
      breadcrumbs: content.hasBreadcrumbs || false,
      stickyHeader: content.hasStickyHeader || false,
      issues,
    };
  }

  /**
   * Analyze conversion friction
   */
  analyzeFriction(content: ScrapedContent, nicheAnalysis: NicheAnalysis): FrictionAnalysis {
    const frictionPoints: FrictionPoint[] = [];
    const conversionKillers: string[] = [];
    const dropOffRisks: DropOffRisk[] = [];

    // Check form friction
    if (content.forms && content.forms.length > 0) {
      const form = content.forms[0];
      if (form.fields > 5) {
        frictionPoints.push({
          type: 'form',
          location: 'Main form',
          severity: form.fields > 8 ? 'critical' : 'high',
          description: `Form has ${form.fields} fields, which reduces completion`,
          solution: 'Reduce to essential fields only (3-5)',
          expectedImpact: 25,
        });
        conversionKillers.push(`Long form with ${form.fields} fields`);
      }
    }

    // Check page speed friction
    if (content.loadTime && content.loadTime > 3) {
      frictionPoints.push({
        type: 'technical',
        location: 'Page load',
        severity: content.loadTime > 5 ? 'critical' : 'high',
        description: `Page takes ${content.loadTime.toFixed(1)}s to load`,
        solution: 'Optimize images, enable caching, minimize code',
        expectedImpact: 20,
      });
      conversionKillers.push('Slow page load time');
    }

    // Check trust friction
    if (!content.hasTestimonials && !content.hasReviews) {
      frictionPoints.push({
        type: 'trust',
        location: 'Above the fold',
        severity: 'medium',
        description: 'No visible social proof',
        solution: 'Add testimonials or reviews near CTA',
        expectedImpact: 15,
      });
    }

    // Determine overall friction level
    const criticalPoints = frictionPoints.filter(f => f.severity === 'critical').length;
    const highPoints = frictionPoints.filter(f => f.severity === 'high').length;
    const overallFriction: 'low' | 'medium' | 'high' =
      criticalPoints > 0 ? 'high' : highPoints > 1 ? 'medium' : 'low';

    // Assess drop-off risks
    dropOffRisks.push({
      stage: 'Landing',
      risk: content.loadTime && content.loadTime > 3 ? 70 : 30,
      causes: content.loadTime && content.loadTime > 3 ? ['Slow load time'] : [],
      mitigations: ['Optimize page speed'],
    });

    if (content.forms && content.forms.length > 0) {
      dropOffRisks.push({
        stage: 'Form submission',
        risk: content.forms[0].fields > 5 ? 60 : 25,
        causes: content.forms[0].fields > 5 ? ['Too many form fields'] : [],
        mitigations: ['Reduce form fields', 'Add progress indicator'],
      });
    }

    return {
      overallFriction,
      frictionPoints,
      conversionKillers,
      dropOffRisks,
    };
  }

  // Helper methods
  private assessPageFlow(content: ScrapedContent, issues: UxIssue[]): 'clear' | 'confusing' | 'broken' {
    const hasH1 = content.h1 && content.h1.length > 0;
    const hasCtas = content.ctas && content.ctas.length > 0;
    const hasLogicalStructure = content.headings?.h2 && content.headings.h2.length > 0;

    if (!hasH1) {
      issues.push({
        type: 'Missing H1',
        severity: 'high',
        location: 'Page header',
        description: 'No H1 heading found - unclear page purpose',
        recommendation: 'Add a clear H1 that states the page purpose',
        expectedImpact: 15,
      });
    }

    if (!hasCtas) {
      issues.push({
        type: 'Missing CTA',
        severity: 'critical',
        location: 'Above the fold',
        description: 'No clear call-to-action visible',
        recommendation: 'Add a prominent CTA button',
        expectedImpact: 25,
      });
    }

    if (!hasH1 && !hasCtas) return 'broken';
    if (!hasH1 || !hasCtas || !hasLogicalStructure) return 'confusing';
    return 'clear';
  }

  private assessCognitiveLoad(content: ScrapedContent, issues: UxIssue[]): 'low' | 'optimal' | 'high' {
    const wordCount = content.wordCount || 0;
    const hasImages = content.images?.total && content.images.total > 0;

    if (wordCount > 2000 && !hasImages) {
      issues.push({
        type: 'Content Overload',
        severity: 'medium',
        location: 'Body content',
        description: 'Dense text without visual breaks',
        recommendation: 'Add images, bullet points, and shorter paragraphs',
        expectedImpact: 10,
      });
      return 'high';
    }

    if (wordCount < 200) return 'low';
    return 'optimal';
  }

  private assessVisualHierarchy(content: ScrapedContent, issues: UxIssue[]): 'strong' | 'moderate' | 'weak' {
    const hasH1 = content.h1 && content.h1.length > 0;
    const hasH2s = content.headings?.h2 && content.headings.h2.length >= 2;
    const hasCtas = content.ctas && content.ctas.length > 0;

    if (hasH1 && hasH2s && hasCtas) return 'strong';
    if (hasH1 || hasH2s) return 'moderate';

    issues.push({
      type: 'Weak Hierarchy',
      severity: 'medium',
      location: 'Page structure',
      description: 'Unclear visual hierarchy',
      recommendation: 'Use clear heading levels and visual emphasis',
      expectedImpact: 12,
    });
    return 'weak';
  }

  private assessWhitespace(content: ScrapedContent, issues: UxIssue[]): 'good' | 'cramped' | 'sparse' {
    // Simplified assessment - would need CSS analysis for real implementation
    const wordCount = content.wordCount || 0;
    const hasImages = content.images?.total && content.images.total > 0;

    if (wordCount > 1500 && !hasImages) return 'cramped';
    if (wordCount < 100) return 'sparse';
    return 'good';
  }

  private assessMobileExperience(content: ScrapedContent, issues: UxIssue[]): 'optimized' | 'acceptable' | 'poor' {
    if (!content.mobileOptimized) {
      issues.push({
        type: 'Mobile Issues',
        severity: 'critical',
        location: 'Entire page',
        description: 'Page is not mobile-optimized',
        recommendation: 'Implement responsive design',
        expectedImpact: 30,
      });
      return 'poor';
    }
    return 'optimized';
  }

  private analyzeValueProposition(content: ScrapedContent): ValuePropositionAnalysis {
    const h1 = content.h1?.[0] || '';
    const description = content.description || '';

    const exists = h1.length > 10 || description.length > 50;
    const clarity = exists ? 70 : 30;
    const uniqueness = 50; // Would need competitor analysis

    return {
      exists,
      clarity,
      uniqueness,
      placement: exists ? 'above_fold' : 'missing',
      suggestion: exists ? undefined : 'Add a clear value proposition headline',
    };
  }

  private analyzeHeadlines(content: ScrapedContent): HeadlineAnalysis {
    const headline = content.h1?.[0] || '';
    const headlineLower = headline.toLowerCase();

    // Check for power words
    const powerWordsFound = this.powerWords.filter(w => headlineLower.includes(w));
    const emotionalTriggersFound = this.emotionalTriggers.filter(w => headlineLower.includes(w));

    // Score calculation
    let score = 50;
    if (headline.length >= 40 && headline.length <= 70) score += 15;
    if (powerWordsFound.length > 0) score += 15;
    if (emotionalTriggersFound.length > 0) score += 10;
    if (headline.includes('you') || headline.includes('your')) score += 10;

    const improvements: string[] = [];
    if (powerWordsFound.length === 0) improvements.push('Add power words like "free", "new", or "proven"');
    if (!headline.includes('you')) improvements.push('Make it more personal with "you" or "your"');
    if (headline.length < 40) improvements.push('Make headline more specific and compelling');

    return {
      mainHeadline: headline || undefined,
      score: Math.min(100, score),
      emotionalTriggers: emotionalTriggersFound,
      powerWords: powerWordsFound,
      improvements,
    };
  }

  private analyzeBodyContent(content: ScrapedContent): BodyContentAnalysis {
    const wordCount = content.wordCount || 0;
    const text = content.bodyText || '';

    // Check for scanability indicators
    const hasBullets = text.includes('•') || text.includes('-');
    const hasSubheadings = (content.headings?.h2?.length || 0) >= 2;
    const hasShortParagraphs = true; // Would need paragraph analysis

    const issues: string[] = [];
    if (wordCount < 300) issues.push('Content may be too thin for SEO');
    if (wordCount > 2000 && !hasSubheadings) issues.push('Long content needs more subheadings');
    if (!hasBullets) issues.push('Add bullet points for scanability');

    return {
      wordCount,
      scanability: hasBullets && hasSubheadings ? 80 : 50,
      bulletPoints: hasBullets,
      subheadings: hasSubheadings,
      shortParagraphs: hasShortParagraphs,
      issues,
    };
  }

  private calculateClarity(content: ScrapedContent): number {
    let score = 60;
    if (content.readabilityScore && content.readabilityScore > 60) score += 20;
    if (content.h1 && content.h1.length > 0) score += 10;
    if (content.headings?.h2 && content.headings.h2.length >= 2) score += 10;
    return Math.min(100, score);
  }

  private calculatePersuasiveness(text: string): number {
    let score = 50;
    const powerWordsFound = this.powerWords.filter(w => text.includes(w)).length;
    score += Math.min(30, powerWordsFound * 6);
    if (text.includes('guarantee') || text.includes('risk-free')) score += 10;
    if (text.includes('results') || text.includes('proven')) score += 10;
    return Math.min(100, score);
  }

  private calculateEmotionalAppeal(text: string): number {
    let score = 40;
    const triggersFound = this.emotionalTriggers.filter(w => text.includes(w)).length;
    score += Math.min(40, triggersFound * 8);
    if (text.includes('you') || text.includes('your')) score += 10;
    if (text.includes('imagine') || text.includes('feel')) score += 10;
    return Math.min(100, score);
  }

  private calculateBenefitFocus(text: string): number {
    let score = 50;
    const benefitWords = ['save', 'get', 'achieve', 'improve', 'increase', 'reduce', 'grow'];
    const found = benefitWords.filter(w => text.includes(w)).length;
    score += Math.min(30, found * 6);
    if (text.includes('benefit') || text.includes('advantage')) score += 10;
    return Math.min(100, score);
  }

  private detectCopyIssues(
    content: ScrapedContent,
    nicheAnalysis: NicheAnalysis,
    issues: CopyIssue[],
  ): void {
    const h1 = content.h1?.[0] || '';

    if (h1.length < 20) {
      issues.push({
        location: 'H1 Headline',
        currentCopy: h1 || '[None]',
        problem: 'Headline is too short or missing',
        suggestedCopy: `Discover How [Your Solution] Helps ${nicheAnalysis.primaryIndustry} Businesses Grow`,
        rationale: 'Specific, benefit-driven headlines convert 30% better',
        expectedLift: 15,
      });
    }

    if (!content.description || content.description.length < 100) {
      issues.push({
        location: 'Meta Description',
        currentCopy: content.description || '[None]',
        problem: 'Meta description is too short or missing',
        suggestedCopy: 'Add a compelling 150-160 character description with key benefits and CTA',
        rationale: 'Good meta descriptions improve CTR by 5-10%',
        expectedLift: 8,
      });
    }
  }

  private detectTone(text: string): string {
    if (text.includes('we believe') || text.includes('our mission')) return 'Corporate';
    if (text.includes('hey') || text.includes('awesome') || text.includes('!')) return 'Casual';
    if (text.includes('research shows') || text.includes('studies')) return 'Authoritative';
    return 'Professional';
  }

  private analyzeCtaElement(cta: { text: string; href?: string }): CtaElement {
    const text = cta.text;
    const actionWords = ['get', 'start', 'try', 'buy', 'join', 'download', 'book'];
    const hasActionWord = actionWords.some(w => text.toLowerCase().includes(w));

    return {
      text,
      location: 'Page',
      color: 'unknown',
      size: text.length > 20 ? 'large' : text.length > 10 ? 'medium' : 'small',
      contrast: 'medium',
      actionOriented: hasActionWord,
      valueProposition: text.toLowerCase().includes('free') || text.toLowerCase().includes('save'),
    };
  }

  private generateBetterCta(currentCta: string): string {
    if (currentCta.includes('submit')) return 'Get My Free Quote';
    if (currentCta.includes('click')) return 'Start Free Trial';
    if (currentCta.includes('learn more')) return 'See How It Works';
    return 'Get Started Free';
  }

  private hasUrgencyElement(text: string): boolean {
    const urgencyWords = ['now', 'today', 'limited', 'hurry', 'instant', 'immediately', 'fast'];
    return urgencyWords.some(w => text.toLowerCase().includes(w));
  }

  private analyzeSocialProof(content: ScrapedContent): SocialProofAnalysis {
    return {
      hasTestimonials: content.hasTestimonials || false,
      testimonialCount: content.hasTestimonials ? 3 : 0,
      hasReviews: content.hasReviews || false,
      reviewScore: content.hasReviews ? 4.5 : undefined,
      hasClientLogos: content.hasClientLogos || false,
      hasCaseStudies: false,
      hasSocialCounts: false,
      recommendations: this.getSocialProofRecommendations(content),
    };
  }

  private getSocialProofRecommendations(content: ScrapedContent): string[] {
    const recs: string[] = [];
    if (!content.hasTestimonials) recs.push('Add 3-5 customer testimonials with photos');
    if (!content.hasReviews) recs.push('Display customer reviews and ratings');
    if (!content.hasClientLogos) recs.push('Show logos of notable clients or partners');
    if (recs.length === 0) recs.push('Consider adding case studies with specific results');
    return recs;
  }
}
