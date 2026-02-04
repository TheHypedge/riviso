import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  PageCroAnalysis,
  CroScore,
  CroIntelligenceRecommendation,
  AbTestHypothesis,
  TestVariantDesign,
  BenchmarkComparison,
  IndustryBenchmark,
  CompetitorBenchmark,
  BenchmarkGap,
  CroExecutiveReport,
  ExecutiveSummary,
  PerformanceOverview,
  CriticalFinding,
  QuickWin,
  StrategicInitiative,
  ImplementationRoadmap,
  RoadmapPhase,
  ProjectedResults,
  CroCategory,
  NicheAnalysis,
  AudienceAnalysis,
} from '@riviso/shared-types';
import { NicheDetectorService } from './niche-detector.service';
import { PersonaAnalyzerService } from './persona-analyzer.service';
import { UxAnalyzerService } from './ux-analyzer.service';

/**
 * Main CRO Intelligence Platform service
 * Orchestrates all analysis and generates actionable recommendations
 */
@Injectable()
export class CroIntelligenceService {
  private readonly logger = new Logger(CroIntelligenceService.name);

  constructor(
    private readonly nicheDetector: NicheDetectorService,
    private readonly personaAnalyzer: PersonaAnalyzerService,
    private readonly uxAnalyzer: UxAnalyzerService,
  ) {}

  /**
   * Complete page-level CRO analysis
   */
  async analyzePageForCro(url: string, scrapedData: any): Promise<PageCroAnalysis> {
    this.logger.log(`Starting CRO analysis for: ${url}`);

    // Map scraped data to our format
    const content = this.mapScrapedContent(scrapedData);

    // 1. Detect niche and business model
    const nicheAnalysis = this.nicheDetector.analyzeNiche({
      title: content.title,
      description: content.description,
      headings: [...(content.h1 || []), ...(content.headings?.h2 || [])],
      bodyText: content.bodyText,
      schemaTypes: scrapedData?.structuredData?.types,
      productCount: scrapedData?.products?.length,
      hasCart: content.hasCart,
      hasPricing: content.hasPricing,
      hasLogin: content.hasLogin,
    });

    // 2. Analyze audience and personas (AI-powered)
    const audienceAnalysis = await this.personaAnalyzer.analyzeAudience(nicheAnalysis, {
      bodyText: content.bodyText,
      headings: [...(content.h1 || []), ...(content.headings?.h2 || [])],
      ctas: content.ctas?.map((c: any) => c.text),
      pricing: content.pricing,
    });

    // 3. Analyze UX
    const uxAnalysis = this.uxAnalyzer.analyzeUx(content, nicheAnalysis);

    // 4. Analyze UI
    const uiAnalysis = this.uxAnalyzer.analyzeUi(content);

    // 5. Analyze copy
    const copyAnalysis = this.uxAnalyzer.analyzeCopy(content, nicheAnalysis);

    // 6. Analyze CTAs
    const ctaAnalysis = this.uxAnalyzer.analyzeCtas(content);

    // 7. Analyze trust signals
    const trustAnalysis = this.uxAnalyzer.analyzeTrust(content);

    // 8. Analyze navigation
    const navigationAnalysis = this.uxAnalyzer.analyzeNavigation(content);

    // 9. Analyze friction
    const frictionAnalysis = this.uxAnalyzer.analyzeFriction(content, nicheAnalysis);

    // 10. Calculate overall score
    const overallScore = this.calculateOverallScore({
      ux: uxAnalysis.score,
      ui: uiAnalysis.score,
      copy: copyAnalysis.score,
      cta: ctaAnalysis.score,
      trust: trustAnalysis.score,
      navigation: navigationAnalysis.score,
      friction: frictionAnalysis.overallFriction === 'low' ? 90 :
        frictionAnalysis.overallFriction === 'medium' ? 60 : 30,
    });

    // 11. Generate recommendations
    const recommendations = this.generateRecommendations(
      nicheAnalysis,
      audienceAnalysis,
      {
        ux: uxAnalysis,
        ui: uiAnalysis,
        copy: copyAnalysis,
        cta: ctaAnalysis,
        trust: trustAnalysis,
        navigation: navigationAnalysis,
        friction: frictionAnalysis,
      },
    );

    // 12. Generate A/B test hypotheses
    const abTestHypotheses = this.generateAbTestHypotheses(recommendations);

    // 13. Get benchmark comparison
    const benchmarkComparison = this.generateBenchmark(nicheAnalysis, overallScore);

    return {
      url,
      screenshotUrl: undefined, // Would require Puppeteer integration
      analyzedAt: new Date().toISOString(),
      nicheAnalysis,
      audienceAnalysis,
      uxAnalysis,
      uiAnalysis,
      copyAnalysis,
      ctaAnalysis,
      trustAnalysis,
      navigationAnalysis,
      frictionAnalysis,
      overallScore,
      recommendations,
      abTestHypotheses,
      benchmarkComparison,
    };
  }

  /**
   * Generate executive-ready CRO report
   */
  generateExecutiveReport(analysis: PageCroAnalysis): CroExecutiveReport {
    const executiveSummary = this.createExecutiveSummary(analysis);
    const performanceOverview = this.createPerformanceOverview(analysis);
    const criticalFindings = this.identifyCriticalFindings(analysis);
    const quickWins = this.identifyQuickWins(analysis.recommendations);
    const strategicInitiatives = this.identifyStrategicInitiatives(analysis.recommendations);
    const implementationRoadmap = this.createImplementationRoadmap(analysis.recommendations);
    const projectedResults = this.projectResults(analysis);

    return {
      id: `report-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      website: analysis.url,
      executiveSummary,
      nicheAnalysis: analysis.nicheAnalysis,
      audienceInsights: analysis.audienceAnalysis,
      performanceOverview,
      criticalFindings,
      prioritizedRecommendations: analysis.recommendations.slice(0, 10),
      quickWins,
      strategicInitiatives,
      implementationRoadmap,
      projectedResults,
    };
  }

  private mapScrapedContent(scrapedData: any): any {
    // Map from WebScraperService format to our internal format
    const onPage = scrapedData?.onPageSEO || scrapedData?.onPageResult?.onPageSEO;
    const performance = scrapedData?.performance || scrapedData?.onPageResult?.performance;

    return {
      title: onPage?.title?.content,
      description: onPage?.metaDescription?.content,
      h1: onPage?.headings?.h1,
      headings: {
        h2: onPage?.headings?.h2,
        h3: onPage?.headings?.h3,
      },
      bodyText: scrapedData?.rawContent?.slice(0, 10000),
      wordCount: onPage?.content?.wordCount,
      readabilityScore: onPage?.content?.readabilityScore,
      links: {
        internal: onPage?.links?.internal?.length || 0,
        external: onPage?.links?.external?.length || 0,
      },
      images: {
        total: onPage?.images?.total || 0,
        withAlt: onPage?.images?.withAlt || 0,
        withoutAlt: onPage?.images?.withoutAlt?.length || 0,
      },
      ctas: this.extractCtas(scrapedData),
      forms: this.extractForms(scrapedData),
      hasTestimonials: this.detectTestimonials(scrapedData),
      hasReviews: this.detectReviews(scrapedData),
      hasClientLogos: this.detectClientLogos(scrapedData),
      hasPricingPage: scrapedData?.hasPricing,
      hasSSL: scrapedData?.security?.https,
      loadTime: performance?.loadTime,
      mobileOptimized: scrapedData?.mobile?.viewport,
      hasNavigation: true,
      navItems: 6,
      hasBreadcrumbs: false,
      hasSearch: false,
      hasStickyHeader: false,
      hasCart: false,
      hasLogin: false,
      pricing: undefined,
    };
  }

  private extractCtas(data: any): Array<{ text: string; href?: string }> {
    // Extract CTAs from links and buttons
    const ctas: Array<{ text: string; href?: string }> = [];
    const links = data?.onPageSEO?.links?.internal || data?.onPageResult?.onPageSEO?.links?.internal || [];

    // Ensure links is an array
    if (!Array.isArray(links)) {
      return [];
    }

    for (const link of links.slice(0, 20)) {
      if (!link || typeof link !== 'object') continue;

      const text = (link.text || '').toLowerCase();
      if (
        text.includes('start') ||
        text.includes('try') ||
        text.includes('buy') ||
        text.includes('get') ||
        text.includes('sign') ||
        text.includes('contact') ||
        text.includes('demo')
      ) {
        ctas.push({ text: link.text, href: link.url });
      }
    }

    return ctas.slice(0, 5);
  }

  private extractForms(data: any): Array<{ fields: number; hasLabels: boolean }> {
    // Simplified - would need actual form detection
    return [];
  }

  private detectTestimonials(data: any): boolean {
    const text = (data?.rawContent || '').toLowerCase();
    return text.includes('testimonial') || text.includes('what our customers say') ||
      text.includes('customer review') || text.includes('client says');
  }

  private detectReviews(data: any): boolean {
    const text = (data?.rawContent || '').toLowerCase();
    return text.includes('review') || text.includes('rating') || text.includes('stars');
  }

  private detectClientLogos(data: any): boolean {
    const text = (data?.rawContent || '').toLowerCase();
    return text.includes('trusted by') || text.includes('our clients') ||
      text.includes('featured in') || text.includes('as seen in');
  }

  private calculateOverallScore(components: {
    ux: number;
    ui: number;
    copy: number;
    cta: number;
    trust: number;
    navigation: number;
    friction: number;
  }): CroScore {
    const weights = {
      ux: 0.20,
      ui: 0.10,
      copy: 0.20,
      cta: 0.20,
      trust: 0.15,
      navigation: 0.05,
      friction: 0.10,
    };

    const overall = Math.round(
      components.ux * weights.ux +
      components.ui * weights.ui +
      components.copy * weights.copy +
      components.cta * weights.cta +
      components.trust * weights.trust +
      components.navigation * weights.navigation +
      components.friction * weights.friction
    );

    const grade: CroScore['grade'] =
      overall >= 85 ? 'A' :
      overall >= 70 ? 'B' :
      overall >= 55 ? 'C' :
      overall >= 40 ? 'D' : 'F';

    return {
      overall,
      components,
      grade,
      benchmarkComparison: overall >= 65 ? 'above' : overall >= 50 ? 'at' : 'below',
    };
  }

  private generateRecommendations(
    nicheAnalysis: NicheAnalysis,
    audienceAnalysis: AudienceAnalysis,
    analyses: any,
  ): CroIntelligenceRecommendation[] {
    const recommendations: CroIntelligenceRecommendation[] = [];
    let priority = 1;

    // CTA recommendations
    for (const issue of analyses.cta.issues) {
      recommendations.push({
        id: `rec-cta-${priority}`,
        priority: priority++,
        category: CroCategory.CTA_OPTIMIZATION,
        title: `Optimize CTA: ${issue.problem.slice(0, 50)}`,
        description: issue.problem,
        rationale: issue.rationale,
        customerPsychology: `Your ${audienceAnalysis.primaryPersona.name} audience responds to clear, action-oriented language`,
        nicheContext: `In ${nicheAnalysis.primaryIndustry}, high-converting CTAs typically use benefit-driven copy`,
        expectedConversionLift: issue.expectedLift,
        confidence: 75,
        effort: 'low',
        implementation: {
          steps: ['Update CTA text', 'A/B test variations', 'Monitor conversion rate'],
          copyChanges: [{
            location: 'Primary CTA',
            before: issue.currentCta,
            after: issue.suggestedCta,
            rationale: issue.rationale,
          }],
          estimatedTime: '1 hour',
          requiredSkills: ['Copywriting', 'CMS access'],
        },
      });
    }

    // Copy recommendations
    for (const issue of analyses.copy.issues) {
      recommendations.push({
        id: `rec-copy-${priority}`,
        priority: priority++,
        category: CroCategory.COPY_OPTIMIZATION,
        title: `Improve Copy: ${issue.location}`,
        description: issue.problem,
        rationale: issue.rationale,
        customerPsychology: `Address ${audienceAnalysis.primaryPersona.painPoints[0] || 'customer pain points'} directly`,
        nicheContext: `${nicheAnalysis.primaryIndustry} audiences expect clear value propositions`,
        expectedConversionLift: issue.expectedLift,
        confidence: 70,
        effort: 'low',
        implementation: {
          steps: ['Review current copy', 'Apply suggested changes', 'Test with users'],
          copyChanges: [{
            location: issue.location,
            before: issue.currentCopy,
            after: issue.suggestedCopy,
            rationale: issue.rationale,
          }],
          estimatedTime: '2 hours',
          requiredSkills: ['Copywriting'],
        },
      });
    }

    // Trust recommendations
    for (const signal of analyses.trust.missingSignals.slice(0, 3)) {
      recommendations.push({
        id: `rec-trust-${priority}`,
        priority: priority++,
        category: CroCategory.TRUST_SIGNALS,
        title: `Add Trust Signal: ${signal}`,
        description: `Missing ${signal} - a critical trust element`,
        rationale: 'Trust signals can increase conversions by 15-25%',
        customerPsychology: `${audienceAnalysis.primaryPersona.objections[0] || 'Buyer skepticism'} is reduced with social proof`,
        nicheContext: `${nicheAnalysis.primaryIndustry} buyers heavily rely on trust signals`,
        expectedConversionLift: 12,
        confidence: 80,
        effort: 'medium',
        implementation: {
          steps: ['Collect testimonials/reviews', 'Design placement', 'Implement on page'],
          estimatedTime: '1 week',
          requiredSkills: ['Content collection', 'Design', 'Development'],
        },
      });
    }

    // UX recommendations
    for (const issue of analyses.ux.issues.slice(0, 3)) {
      recommendations.push({
        id: `rec-ux-${priority}`,
        priority: priority++,
        category: CroCategory.DESIGN_UX,
        title: `Fix UX Issue: ${issue.type}`,
        description: issue.description,
        rationale: issue.recommendation,
        customerPsychology: 'Poor UX creates cognitive friction that kills conversions',
        nicheContext: `${nicheAnalysis.businessModel} businesses need frictionless experiences`,
        expectedConversionLift: issue.expectedImpact,
        confidence: 72,
        effort: issue.severity === 'critical' ? 'high' : 'medium',
        implementation: {
          steps: ['Identify specific changes', 'Design improvements', 'Develop and deploy'],
          designChanges: [{
            element: issue.location,
            change: issue.recommendation,
            wireframeGuidance: 'Focus on clarity and reduced friction',
          }],
          estimatedTime: issue.severity === 'critical' ? '1-2 weeks' : '3-5 days',
          requiredSkills: ['UX Design', 'Development'],
        },
      });
    }

    // Friction recommendations
    for (const point of analyses.friction.frictionPoints.slice(0, 2)) {
      recommendations.push({
        id: `rec-friction-${priority}`,
        priority: priority++,
        category: point.type === 'form' ? CroCategory.FORM_OPTIMIZATION :
          point.type === 'technical' ? CroCategory.PAGE_SPEED : CroCategory.TECHNICAL,
        title: `Reduce Friction: ${point.description.slice(0, 50)}`,
        description: point.description,
        rationale: point.solution,
        customerPsychology: 'Every friction point loses 10-20% of potential conversions',
        nicheContext: `${nicheAnalysis.businessModel} conversions are highly sensitive to friction`,
        expectedConversionLift: point.expectedImpact,
        confidence: 78,
        effort: point.severity === 'critical' ? 'high' : 'medium',
        implementation: {
          steps: ['Audit current state', 'Implement optimization', 'Measure improvement'],
          technicalChanges: [point.solution],
          estimatedTime: '1 week',
          requiredSkills: ['Development', 'Performance optimization'],
        },
      });
    }

    return recommendations.sort((a, b) => {
      // Sort by expected impact * confidence
      const scoreA = a.expectedConversionLift * (a.confidence / 100);
      const scoreB = b.expectedConversionLift * (b.confidence / 100);
      return scoreB - scoreA;
    }).slice(0, 15);
  }

  private generateAbTestHypotheses(recommendations: CroIntelligenceRecommendation[]): AbTestHypothesis[] {
    return recommendations.slice(0, 5).map((rec, idx) => {
      const variants: TestVariantDesign[] = [
        {
          name: 'Control',
          description: 'Current page design',
          changes: [],
          expectedOutcome: 'Baseline conversion rate',
        },
        {
          name: 'Variation A',
          description: rec.description,
          changes: rec.implementation.steps,
          expectedOutcome: `${rec.expectedConversionLift}% lift`,
        },
      ];

      return {
        id: `hypothesis-${idx + 1}`,
        hypothesis: `If we ${rec.title.toLowerCase()}, then conversion rate will increase by ${rec.expectedConversionLift}% because ${rec.rationale.slice(0, 100)}`,
        metric: 'Conversion Rate',
        expectedLift: rec.expectedConversionLift,
        confidence: rec.confidence,
        priority: idx + 1,
        testType: 'a_b',
        variants,
        sampleSizeRequired: Math.ceil(1000 / (rec.expectedConversionLift / 100)),
        estimatedDuration: '2-4 weeks',
        rationale: rec.customerPsychology,
      };
    });
  }

  private generateBenchmark(nicheAnalysis: NicheAnalysis, score: CroScore): BenchmarkComparison {
    const industryBenchmarks: Record<string, Partial<IndustryBenchmark>> = {
      'E-commerce / Retail': { avgConversionRate: 2.5, avgBounceRate: 45, avgTimeOnPage: 180 },
      'SaaS / Software': { avgConversionRate: 3.0, avgBounceRate: 40, avgTimeOnPage: 240 },
      'Professional Services': { avgConversionRate: 4.5, avgBounceRate: 50, avgTimeOnPage: 120 },
      'Healthcare': { avgConversionRate: 3.2, avgBounceRate: 55, avgTimeOnPage: 150 },
    };

    const benchmark = industryBenchmarks[nicheAnalysis.primaryIndustry] || {
      avgConversionRate: 2.8,
      avgBounceRate: 50,
      avgTimeOnPage: 150,
    };

    const industryAverage: IndustryBenchmark = {
      industry: nicheAnalysis.primaryIndustry,
      avgConversionRate: benchmark.avgConversionRate || 2.8,
      avgBounceRate: benchmark.avgBounceRate || 50,
      avgTimeOnPage: benchmark.avgTimeOnPage || 150,
      avgPageSpeed: 3.0,
      commonPatterns: this.getIndustryPatterns(nicheAnalysis.primaryIndustry),
    };

    const gaps: BenchmarkGap[] = [
      {
        area: 'CRO Score',
        yourScore: score.overall,
        industryAverage: 65,
        topPerformerScore: 85,
        opportunity: score.overall < 65 ? 'Below average - significant improvement potential' : 'At or above average',
        recommendation: score.overall < 65 ? 'Focus on quick wins to close the gap' : 'Optimize for incremental gains',
      },
    ];

    return {
      industryAverage,
      topPerformers: this.getTopPerformerInsights(nicheAnalysis),
      gaps,
      opportunities: this.identifyBenchmarkOpportunities(score, industryAverage),
    };
  }

  private getIndustryPatterns(industry: string): string[] {
    const patterns: Record<string, string[]> = {
      'E-commerce / Retail': ['Free shipping messaging', 'Urgency countdown timers', 'Customer reviews'],
      'SaaS / Software': ['Free trial CTAs', 'Demo videos', 'Feature comparison tables'],
      'Professional Services': ['Client testimonials', 'Case study callouts', 'Consultation forms'],
    };
    return patterns[industry] || ['Clear value propositions', 'Trust signals', 'Strong CTAs'];
  }

  private getTopPerformerInsights(nicheAnalysis: NicheAnalysis): CompetitorBenchmark[] {
    return [
      {
        domain: 'Industry Leader',
        strengths: ['Strong value proposition', 'Excellent social proof', 'Optimized conversion funnel'],
        weaknesses: ['Complex pricing', 'Slow page speed'],
        conversionTactics: ['Exit-intent popups', 'Personalized CTAs', 'Live chat'],
        trustStrategies: ['Video testimonials', 'Industry certifications', 'Money-back guarantees'],
        uniqueApproaches: ['Interactive calculators', 'Comparison tools'],
      },
    ];
  }

  private identifyBenchmarkOpportunities(score: CroScore, benchmark: IndustryBenchmark): string[] {
    const opportunities: string[] = [];

    if (score.components.cta < 70) {
      opportunities.push('CTA optimization offers high-impact improvement potential');
    }
    if (score.components.trust < 70) {
      opportunities.push('Adding trust signals could significantly boost conversions');
    }
    if (score.components.copy < 70) {
      opportunities.push('Copy improvements can increase engagement and conversions');
    }

    return opportunities;
  }

  private createExecutiveSummary(analysis: PageCroAnalysis): ExecutiveSummary {
    const criticalIssues = analysis.recommendations.filter(r => r.effort === 'low' && r.expectedConversionLift > 10);
    const totalPotentialLift = analysis.recommendations.reduce((sum, r) => sum + r.expectedConversionLift, 0);

    return {
      headline: `CRO Analysis: ${analysis.overallScore.grade} Grade with ${Math.min(totalPotentialLift, 50)}% Potential Improvement`,
      currentState: `Your ${analysis.nicheAnalysis.primaryIndustry} website scores ${analysis.overallScore.overall}/100 on conversion optimization, which is ${analysis.overallScore.benchmarkComparison} industry average.`,
      keyOpportunities: analysis.recommendations.slice(0, 3).map(r => r.title),
      projectedImpact: `Implementing top recommendations could increase conversions by ${Math.min(totalPotentialLift * 0.6, 35).toFixed(0)}%`,
      urgentActions: criticalIssues.slice(0, 2).map(r => r.title),
    };
  }

  private createPerformanceOverview(analysis: PageCroAnalysis): PerformanceOverview {
    return {
      currentConversionRate: 2.1, // Would come from analytics
      industryBenchmark: analysis.benchmarkComparison?.industryAverage.avgConversionRate || 2.8,
      performanceGrade: analysis.overallScore.grade,
      trendDirection: 'stable',
      keyMetrics: {
        uxScore: analysis.uxAnalysis.score,
        copyScore: analysis.copyAnalysis.score,
        ctaScore: analysis.ctaAnalysis.score,
        trustScore: analysis.trustAnalysis.score,
      },
    };
  }

  private identifyCriticalFindings(analysis: PageCroAnalysis): CriticalFinding[] {
    const findings: CriticalFinding[] = [];

    if (analysis.ctaAnalysis.ctaCount === 0) {
      findings.push({
        finding: 'No clear call-to-action on the page',
        impact: 'user_drop_off',
        estimatedLoss: '25-40% of potential conversions',
        urgency: 'immediate',
        solution: 'Add prominent, action-oriented CTA button above the fold',
      });
    }

    if (analysis.trustAnalysis.score < 50) {
      findings.push({
        finding: 'Insufficient trust signals',
        impact: 'trust_erosion',
        estimatedLoss: '15-20% of potential conversions',
        urgency: 'this_week',
        solution: 'Add testimonials, reviews, and security badges',
      });
    }

    if (analysis.frictionAnalysis.overallFriction === 'high') {
      findings.push({
        finding: 'High conversion friction detected',
        impact: 'user_drop_off',
        estimatedLoss: '20-30% of potential conversions',
        urgency: 'this_week',
        solution: 'Reduce form fields and optimize page speed',
      });
    }

    return findings;
  }

  private identifyQuickWins(recommendations: CroIntelligenceRecommendation[]): QuickWin[] {
    return recommendations
      .filter(r => r.effort === 'low' && r.expectedConversionLift >= 5)
      .slice(0, 5)
      .map(r => ({
        title: r.title,
        description: r.description,
        expectedLift: r.expectedConversionLift,
        implementation: r.implementation.steps.join('. '),
        timeToImplement: r.implementation.estimatedTime,
      }));
  }

  private identifyStrategicInitiatives(recommendations: CroIntelligenceRecommendation[]): StrategicInitiative[] {
    return recommendations
      .filter(r => r.effort !== 'low' && r.expectedConversionLift >= 10)
      .slice(0, 3)
      .map(r => ({
        title: r.title,
        description: r.description,
        expectedLift: r.expectedConversionLift,
        timeline: r.implementation.estimatedTime,
        resources: r.implementation.requiredSkills,
        dependencies: [],
      }));
  }

  private createImplementationRoadmap(recommendations: CroIntelligenceRecommendation[]): ImplementationRoadmap {
    const quickWins = recommendations.filter(r => r.effort === 'low');
    const mediumEffort = recommendations.filter(r => r.effort === 'medium');
    const highEffort = recommendations.filter(r => r.effort === 'high');

    const phases: RoadmapPhase[] = [
      {
        phase: 1,
        name: 'Quick Wins',
        duration: '1-2 weeks',
        objectives: ['Implement low-effort, high-impact changes'],
        deliverables: quickWins.slice(0, 3).map(r => r.title),
        expectedResults: `${quickWins.slice(0, 3).reduce((sum, r) => sum + r.expectedConversionLift, 0) * 0.7}% conversion improvement`,
      },
      {
        phase: 2,
        name: 'Foundation Building',
        duration: '3-4 weeks',
        objectives: ['Address medium-effort optimizations', 'Build testing framework'],
        deliverables: mediumEffort.slice(0, 3).map(r => r.title),
        expectedResults: `Additional ${mediumEffort.slice(0, 3).reduce((sum, r) => sum + r.expectedConversionLift, 0) * 0.6}% improvement`,
      },
      {
        phase: 3,
        name: 'Strategic Optimization',
        duration: '4-6 weeks',
        objectives: ['Implement strategic changes', 'Run A/B tests'],
        deliverables: highEffort.slice(0, 2).map(r => r.title),
        expectedResults: 'Long-term conversion optimization and testing culture',
      },
    ];

    return {
      phases,
      totalTimeline: '8-12 weeks',
      resourceRequirements: ['UX Designer', 'Copywriter', 'Developer', 'Analytics'],
    };
  }

  private projectResults(analysis: PageCroAnalysis): ProjectedResults {
    const totalPotentialLift = analysis.recommendations.reduce((sum, r) => sum + r.expectedConversionLift, 0);
    const realisticLift = Math.min(totalPotentialLift * 0.5, 40); // Conservative estimate

    return {
      conversionRateTarget: 2.1 * (1 + realisticLift / 100),
      revenueIncrease: `${realisticLift}% increase in conversions`,
      timeline: '3 months',
      assumptions: [
        'Full implementation of recommendations',
        'Adequate traffic for statistical significance',
        'No major external factors',
      ],
      riskFactors: [
        'Implementation delays',
        'Insufficient testing traffic',
        'Market changes',
      ],
    };
  }
}
