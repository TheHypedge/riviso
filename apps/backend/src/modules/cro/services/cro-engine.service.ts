import { Injectable } from '@nestjs/common';

/**
 * CRO Intelligence Engine
 * 
 * Analyzes pages and identifies conversion optimization opportunities using:
 * 1. High-traffic, low-conversion detection
 * 2. Intent mismatch analysis
 * 3. Funnel drop-off identification
 * 4. Rule-based scoring
 */

export interface PageAnalytics {
  url: string;
  pageViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number; // seconds
  bounceRate: number; // percentage
  exitRate: number; // percentage
  conversions: number;
  conversionRate: number; // percentage
  trafficSource?: 'organic' | 'paid' | 'direct' | 'referral' | 'social';
  userIntent?: 'informational' | 'navigational' | 'transactional' | 'commercial';
  pageType?: 'landing' | 'product' | 'checkout' | 'content' | 'homepage';
}

export interface FunnelStep {
  stepName: string;
  url: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  dropOffRate: number;
  avgTimeOnStep: number;
}

export interface CroIssue {
  type: 'high_traffic_low_conversion' | 'intent_mismatch' | 'funnel_drop_off' | 'poor_engagement' | 'exit_page';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metrics: {
    current: number;
    expected: number;
    gap: number;
    percentile: number; // 0-100 (industry benchmark)
  };
  rootCauses: string[];
  priorityScore: number; // 0-100
}

export interface CroRecommendationDetail {
  id: string;
  category: 'cta' | 'trust' | 'copy' | 'design' | 'ux' | 'technical' | 'form';
  title: string;
  description: string;
  reasoning: string; // AI-generated explanation
  actionItems: Array<{
    task: string;
    priority: 'high' | 'medium' | 'low';
    estimatedTime: string;
  }>;
  effort: 'low' | 'medium' | 'high';
  expectedImpact: 'low' | 'medium' | 'high';
  expectedLift: number; // percentage
  confidence: number; // 0-100
  examples?: Array<{
    before: string;
    after: string;
    result: string;
  }>;
}

export interface CroAnalysisResult {
  pageUrl: string;
  analysisDate: string;
  issues: CroIssue[];
  recommendations: CroRecommendationDetail[];
  overallScore: number; // 0-100
  projectedImpact: {
    additionalConversions: number;
    conversionRateIncrease: number; // percentage
    estimatedRevenue: number;
    confidence: number; // 0-100
  };
}

@Injectable()
export class CroEngineService {
  /**
   * Analyze a single page for CRO opportunities
   */
  async analyzePage(pageData: PageAnalytics): Promise<CroAnalysisResult> {
    const issues: CroIssue[] = [];

    // Rule 1: High Traffic, Low Conversion
    const trafficConversionIssue = this.detectHighTrafficLowConversion(pageData);
    if (trafficConversionIssue) issues.push(trafficConversionIssue);

    // Rule 2: Intent Mismatch
    const intentIssue = this.detectIntentMismatch(pageData);
    if (intentIssue) issues.push(intentIssue);

    // Rule 3: Poor Engagement
    const engagementIssue = this.detectPoorEngagement(pageData);
    if (engagementIssue) issues.push(engagementIssue);

    // Rule 4: High Exit Rate
    const exitIssue = this.detectHighExitRate(pageData);
    if (exitIssue) issues.push(exitIssue);

    // Generate recommendations based on identified issues
    const recommendations = this.generateRecommendations(pageData, issues);

    // Calculate overall score and projected impact
    const overallScore = this.calculateOverallScore(pageData, issues);
    const projectedImpact = this.calculateProjectedImpact(pageData, recommendations);

    return {
      pageUrl: pageData.url,
      analysisDate: new Date().toISOString(),
      issues,
      recommendations,
      overallScore,
      projectedImpact,
    };
  }

  /**
   * Analyze conversion funnel for drop-off points
   */
  async analyzeFunnel(funnelSteps: FunnelStep[]): Promise<{
    dropOffPoints: Array<{
      step: string;
      dropOffRate: number;
      issue: CroIssue;
      recommendations: CroRecommendationDetail[];
    }>;
    overallFunnelHealth: number;
  }> {
    const dropOffPoints = [];

    for (let i = 0; i < funnelSteps.length - 1; i++) {
      const currentStep = funnelSteps[i];
      const nextStep = funnelSteps[i + 1];
      
      const dropOff = ((currentStep.visitors - nextStep.visitors) / currentStep.visitors) * 100;

      // Detect abnormal drop-offs (>40% is considered high)
      if (dropOff > 40) {
        const issue: CroIssue = {
          type: 'funnel_drop_off',
          severity: dropOff > 60 ? 'critical' : dropOff > 50 ? 'high' : 'medium',
          title: `High Drop-Off at ${currentStep.stepName}`,
          description: `${dropOff.toFixed(1)}% of users abandon the funnel at this step`,
          metrics: {
            current: dropOff,
            expected: 25, // Industry benchmark
            gap: dropOff - 25,
            percentile: 85, // High drop-off is in 85th percentile (bad)
          },
          rootCauses: this.identifyFunnelDropOffCauses(currentStep),
          priorityScore: this.calculatePriorityScore(dropOff, currentStep.visitors),
        };

        const recommendations = this.generateFunnelRecommendations(currentStep, issue);

        dropOffPoints.push({
          step: currentStep.stepName,
          dropOffRate: dropOff,
          issue,
          recommendations,
        });
      }
    }

    // Calculate overall funnel health (0-100)
    const totalDropOff = funnelSteps.reduce((sum, step) => sum + step.dropOffRate, 0) / funnelSteps.length;
    const overallFunnelHealth = Math.max(0, 100 - totalDropOff);

    return {
      dropOffPoints,
      overallFunnelHealth,
    };
  }

  /**
   * Rule 1: Detect high traffic but low conversion
   */
  private detectHighTrafficLowConversion(pageData: PageAnalytics): CroIssue | null {
    const isHighTraffic = pageData.pageViews > 1000; // Threshold: 1000+ views/month
    const isLowConversion = pageData.conversionRate < 2.5; // Below industry avg (2.5%)

    if (isHighTraffic && isLowConversion) {
      const expectedConversion = 3.5; // Industry benchmark for this traffic level
      const gap = expectedConversion - pageData.conversionRate;

      return {
        type: 'high_traffic_low_conversion',
        severity: pageData.conversionRate < 1.5 ? 'critical' : 'high',
        title: 'High Traffic, Low Conversion Rate',
        description: `This page receives ${pageData.pageViews.toLocaleString()} monthly visits but only converts at ${pageData.conversionRate}%`,
        metrics: {
          current: pageData.conversionRate,
          expected: expectedConversion,
          gap,
          percentile: this.getPercentile(pageData.conversionRate, 3.5), // Compare to 3.5% avg
        },
        rootCauses: [
          'Weak or unclear call-to-action',
          'Value proposition not immediately clear',
          'Lack of trust signals (testimonials, badges)',
          'Slow page load time affecting conversions',
          'Form friction or too many required fields',
        ],
        priorityScore: this.calculatePriorityScore(gap, pageData.pageViews),
      };
    }

    return null;
  }

  /**
   * Rule 2: Detect intent mismatch (traffic source vs page type)
   */
  private detectIntentMismatch(pageData: PageAnalytics): CroIssue | null {
    // Example: Transactional intent but landing on informational page
    const hasMismatch = 
      (pageData.userIntent === 'transactional' && pageData.pageType === 'content') ||
      (pageData.userIntent === 'informational' && pageData.pageType === 'checkout') ||
      (pageData.trafficSource === 'paid' && pageData.bounceRate > 60);

    if (hasMismatch) {
      return {
        type: 'intent_mismatch',
        severity: pageData.bounceRate > 70 ? 'high' : 'medium',
        title: 'User Intent Mismatch Detected',
        description: `Users arriving with ${pageData.userIntent} intent on a ${pageData.pageType} page (${pageData.bounceRate}% bounce rate)`,
        metrics: {
          current: pageData.bounceRate,
          expected: 45, // Expected bounce for matched intent
          gap: pageData.bounceRate - 45,
          percentile: this.getPercentile(pageData.bounceRate, 50),
        },
        rootCauses: [
          'Landing page content doesn\'t match ad copy or search intent',
          'Page design doesn\'t align with user expectations',
          'Missing clear next steps for user\'s intent',
          'Irrelevant content or misleading meta description',
        ],
        priorityScore: this.calculatePriorityScore(pageData.bounceRate - 45, pageData.pageViews),
      };
    }

    return null;
  }

  /**
   * Rule 3: Detect poor engagement (low time on page, high bounce)
   */
  private detectPoorEngagement(pageData: PageAnalytics): CroIssue | null {
    const hasLowEngagement = 
      pageData.avgTimeOnPage < 30 && // Less than 30 seconds
      pageData.bounceRate > 55; // High bounce rate

    if (hasLowEngagement) {
      return {
        type: 'poor_engagement',
        severity: pageData.avgTimeOnPage < 15 ? 'high' : 'medium',
        title: 'Poor User Engagement',
        description: `Average time on page is only ${pageData.avgTimeOnPage}s with ${pageData.bounceRate}% bounce rate`,
        metrics: {
          current: pageData.avgTimeOnPage,
          expected: 90, // Industry average
          gap: 90 - pageData.avgTimeOnPage,
          percentile: this.getPercentile(pageData.avgTimeOnPage, 90),
        },
        rootCauses: [
          'Page content doesn\'t immediately capture attention',
          'Poor readability (font size, spacing, contrast)',
          'Slow page load time causing users to leave',
          'No engaging visuals or interactive elements',
          'Mobile experience is poor',
        ],
        priorityScore: this.calculatePriorityScore(90 - pageData.avgTimeOnPage, pageData.pageViews * 0.5),
      };
    }

    return null;
  }

  /**
   * Rule 4: Detect high exit rate (users leaving site from this page)
   */
  private detectHighExitRate(pageData: PageAnalytics): CroIssue | null {
    const isExitPage = pageData.exitRate > 60; // More than 60% exit

    if (isExitPage && pageData.pageType !== 'checkout') {
      return {
        type: 'exit_page',
        severity: pageData.exitRate > 75 ? 'high' : 'medium',
        title: 'High Exit Rate',
        description: `${pageData.exitRate}% of users leave the site from this page`,
        metrics: {
          current: pageData.exitRate,
          expected: 40, // Industry average for non-checkout pages
          gap: pageData.exitRate - 40,
          percentile: this.getPercentile(pageData.exitRate, 50),
        },
        rootCauses: [
          'Missing clear next steps or navigation',
          'No compelling CTA to continue journey',
          'Technical errors causing frustration',
          'Content dead-end with no related pages',
        ],
        priorityScore: this.calculatePriorityScore(pageData.exitRate - 40, pageData.pageViews * 0.6),
      };
    }

    return null;
  }

  /**
   * Generate AI-powered recommendations based on identified issues
   */
  private generateRecommendations(
    pageData: PageAnalytics,
    issues: CroIssue[]
  ): CroRecommendationDetail[] {
    const recommendations: CroRecommendationDetail[] = [];

    issues.forEach((issue, index) => {
      switch (issue.type) {
        case 'high_traffic_low_conversion':
          recommendations.push(...this.generateHighTrafficLowConversionRecs(pageData, issue));
          break;
        case 'intent_mismatch':
          recommendations.push(...this.generateIntentMismatchRecs(pageData, issue));
          break;
        case 'poor_engagement':
          recommendations.push(...this.generatePoorEngagementRecs(pageData, issue));
          break;
        case 'exit_page':
          recommendations.push(...this.generateExitPageRecs(pageData, issue));
          break;
      }
    });

    // Sort by expected impact and priority
    return recommendations.sort((a, b) => {
      const impactScore = (rec: CroRecommendationDetail) => 
        (rec.expectedImpact === 'high' ? 3 : rec.expectedImpact === 'medium' ? 2 : 1) *
        (rec.effort === 'low' ? 3 : rec.effort === 'medium' ? 2 : 1);
      
      return impactScore(b) - impactScore(a);
    }).slice(0, 5); // Return top 5 recommendations
  }

  /**
   * Generate recommendations for high traffic, low conversion pages
   */
  private generateHighTrafficLowConversionRecs(
    pageData: PageAnalytics,
    issue: CroIssue
  ): CroRecommendationDetail[] {
    return [
      {
        id: `rec-htlc-1-${Date.now()}`,
        category: 'cta',
        title: 'Optimize Call-to-Action',
        description: 'Improve CTA visibility, copy, and placement to drive more conversions',
        reasoning: `With ${pageData.pageViews.toLocaleString()} monthly visitors, even a small CTA improvement can yield ${Math.round(pageData.pageViews * 0.01)} additional conversions per month. Studies show that prominent, benefit-driven CTAs increase conversion by 28-45%.`,
        actionItems: [
          { task: 'Move primary CTA above the fold', priority: 'high', estimatedTime: '30 minutes' },
          { task: 'Use action-oriented copy (e.g., "Start Free Trial" vs "Submit")', priority: 'high', estimatedTime: '15 minutes' },
          { task: 'Increase button size to minimum 48px height', priority: 'medium', estimatedTime: '15 minutes' },
          { task: 'Use contrasting color for better visibility', priority: 'medium', estimatedTime: '20 minutes' },
          { task: 'Add directional cues (arrows) pointing to CTA', priority: 'low', estimatedTime: '30 minutes' },
        ],
        effort: 'low',
        expectedImpact: 'high',
        expectedLift: 35,
        confidence: 82,
        examples: [
          {
            before: 'Generic "Submit" button in footer',
            after: 'Prominent "Get Your Free Analysis" button above fold',
            result: '+42% conversion rate increase (Case Study: SaaS Landing Page)',
          },
        ],
      },
      {
        id: `rec-htlc-2-${Date.now()}`,
        category: 'trust',
        title: 'Add Trust Signals',
        description: 'Include social proof, testimonials, and security badges to build credibility',
        reasoning: `Your page lacks trust indicators. Research shows pages with social proof elements convert 34% better. With ${pageData.uniqueVisitors.toLocaleString()} unique visitors, this could add ${Math.round(pageData.uniqueVisitors * 0.008)} conversions monthly.`,
        actionItems: [
          { task: 'Add 3-5 customer testimonials with photos', priority: 'high', estimatedTime: '2 hours' },
          { task: 'Display customer count or "Used by X companies"', priority: 'high', estimatedTime: '1 hour' },
          { task: 'Add security badges (SSL, payment providers)', priority: 'medium', estimatedTime: '30 minutes' },
          { task: 'Include logo wall of recognized clients', priority: 'medium', estimatedTime: '1 hour' },
          { task: 'Add real-time social proof (e.g., "John just signed up")', priority: 'low', estimatedTime: '4 hours' },
        ],
        effort: 'medium',
        expectedImpact: 'high',
        expectedLift: 28,
        confidence: 78,
      },
      {
        id: `rec-htlc-3-${Date.now()}`,
        category: 'copy',
        title: 'Clarify Value Proposition',
        description: 'Make the unique value immediately clear in headline and subheadline',
        reasoning: `Users decide whether to stay or leave within 8 seconds. Your current ${pageData.bounceRate}% bounce rate suggests the value proposition isn't immediately clear. A benefit-focused headline can reduce bounce by 25%.`,
        actionItems: [
          { task: 'Rewrite headline to focus on specific outcome (not features)', priority: 'high', estimatedTime: '45 minutes' },
          { task: 'Add compelling subheadline explaining unique differentiator', priority: 'high', estimatedTime: '30 minutes' },
          { task: 'Use bullet points to highlight top 3 benefits', priority: 'medium', estimatedTime: '20 minutes' },
          { task: 'Include specific numbers/results (e.g., "3x faster")', priority: 'medium', estimatedTime: '15 minutes' },
        ],
        effort: 'low',
        expectedImpact: 'medium',
        expectedLift: 22,
        confidence: 75,
        examples: [
          {
            before: '"Advanced Analytics Platform for Businesses"',
            after: '"Make Data-Driven Decisions 10x Faster — Without a Data Team"',
            result: '+31% engagement, -18% bounce rate',
          },
        ],
      },
    ];
  }

  /**
   * Generate recommendations for intent mismatch
   */
  private generateIntentMismatchRecs(
    pageData: PageAnalytics,
    issue: CroIssue
  ): CroRecommendationDetail[] {
    return [
      {
        id: `rec-im-1-${Date.now()}`,
        category: 'copy',
        title: 'Align Page Content with User Intent',
        description: 'Adjust messaging to match what users are looking for when they arrive',
        reasoning: `Your ${pageData.bounceRate}% bounce rate indicates users aren't finding what they expected. Aligning content with ${pageData.userIntent} intent can reduce bounce by 35% and increase conversions by 28%.`,
        actionItems: [
          { task: 'Audit top landing keywords and ensure page content matches', priority: 'high', estimatedTime: '1 hour' },
          { task: 'Update headline to directly address search intent', priority: 'high', estimatedTime: '30 minutes' },
          { task: 'Add clear signposting for different user intents', priority: 'medium', estimatedTime: '45 minutes' },
          { task: 'Ensure ad copy matches landing page message', priority: 'high', estimatedTime: '30 minutes' },
        ],
        effort: 'medium',
        expectedImpact: 'high',
        expectedLift: 32,
        confidence: 80,
      },
    ];
  }

  /**
   * Generate recommendations for poor engagement
   */
  private generatePoorEngagementRecs(
    pageData: PageAnalytics,
    issue: CroIssue
  ): CroRecommendationDetail[] {
    return [
      {
        id: `rec-pe-1-${Date.now()}`,
        category: 'design',
        title: 'Improve Page Readability',
        description: 'Enhance visual hierarchy and content scannability',
        reasoning: `Average time on page of ${pageData.avgTimeOnPage}s suggests users can't quickly find what they need. Improving readability can increase engagement by 40% and conversions by 18%.`,
        actionItems: [
          { task: 'Increase font size to minimum 16px for body text', priority: 'high', estimatedTime: '15 minutes' },
          { task: 'Add more whitespace between sections', priority: 'medium', estimatedTime: '30 minutes' },
          { task: 'Use subheadings to break up long content', priority: 'high', estimatedTime: '45 minutes' },
          { task: 'Ensure sufficient color contrast (WCAG AA)', priority: 'medium', estimatedTime: '30 minutes' },
        ],
        effort: 'low',
        expectedImpact: 'medium',
        expectedLift: 18,
        confidence: 72,
      },
    ];
  }

  /**
   * Generate recommendations for high exit pages
   */
  private generateExitPageRecs(
    pageData: PageAnalytics,
    issue: CroIssue
  ): CroRecommendationDetail[] {
    return [
      {
        id: `rec-ep-1-${Date.now()}`,
        category: 'ux',
        title: 'Add Clear Next Steps',
        description: 'Guide users to continue their journey instead of leaving',
        reasoning: `With ${pageData.exitRate}% of users leaving from this page, you're missing opportunities. Adding clear next steps can reduce exits by 25% and recover ${Math.round(pageData.pageViews * 0.15)} potential conversions monthly.`,
        actionItems: [
          { task: 'Add "Related Pages" or "Recommended" section', priority: 'high', estimatedTime: '2 hours' },
          { task: 'Include persistent CTA in sidebar or sticky footer', priority: 'high', estimatedTime: '1 hour' },
          { task: 'Add exit-intent popup with special offer', priority: 'medium', estimatedTime: '3 hours' },
          { task: 'Implement breadcrumb navigation', priority: 'medium', estimatedTime: '1 hour' },
        ],
        effort: 'medium',
        expectedImpact: 'medium',
        expectedLift: 20,
        confidence: 70,
      },
    ];
  }

  /**
   * Generate recommendations for funnel drop-offs
   */
  private generateFunnelRecommendations(
    step: FunnelStep,
    issue: CroIssue
  ): CroRecommendationDetail[] {
    return [
      {
        id: `rec-funnel-1-${Date.now()}`,
        category: 'form',
        title: 'Reduce Form Friction',
        description: 'Simplify the form to reduce abandonment',
        reasoning: `${issue.metrics.current.toFixed(1)}% drop-off at ${step.stepName} is significantly above the ${issue.metrics.expected}% benchmark. Form optimization can recover 30-40% of these lost conversions.`,
        actionItems: [
          { task: 'Remove non-essential form fields (aim for <5 fields)', priority: 'high', estimatedTime: '1 hour' },
          { task: 'Add progress indicator showing remaining steps', priority: 'high', estimatedTime: '2 hours' },
          { task: 'Implement auto-fill for common fields', priority: 'medium', estimatedTime: '3 hours' },
          { task: 'Add inline validation with helpful error messages', priority: 'medium', estimatedTime: '2 hours' },
          { task: 'Offer guest checkout (no account required)', priority: 'high', estimatedTime: '4 hours' },
        ],
        effort: 'medium',
        expectedImpact: 'high',
        expectedLift: 35,
        confidence: 85,
      },
    ];
  }

  /**
   * Identify root causes for funnel drop-offs
   */
  private identifyFunnelDropOffCauses(step: FunnelStep): string[] {
    const causes = [];
    
    if (step.stepName.toLowerCase().includes('checkout')) {
      causes.push('Unexpected shipping costs revealed late in funnel');
      causes.push('Limited payment options');
      causes.push('Forced account creation');
      causes.push('Complex or long form');
    } else if (step.stepName.toLowerCase().includes('form')) {
      causes.push('Too many required fields');
      causes.push('Lack of trust signals near form');
      causes.push('Poor mobile form experience');
    } else {
      causes.push('Unclear value proposition at this stage');
      causes.push('Missing progress indicator');
      causes.push('Technical issues or slow loading');
    }

    return causes;
  }

  /**
   * Calculate priority score (0-100) based on impact and traffic
   */
  private calculatePriorityScore(gap: number, traffic: number): number {
    // Impact score: how far from benchmark (0-50 points)
    const impactScore = Math.min(50, (gap / 100) * 50);
    
    // Traffic score: more traffic = higher priority (0-50 points)
    const trafficScore = Math.min(50, (traffic / 5000) * 50);
    
    return Math.round(impactScore + trafficScore);
  }

  /**
   * Calculate overall page score (0-100)
   */
  private calculateOverallScore(pageData: PageAnalytics, issues: CroIssue[]): number {
    let score = 100;

    // Deduct points for each issue based on severity
    issues.forEach(issue => {
      const deduction = {
        critical: 25,
        high: 15,
        medium: 10,
        low: 5,
      }[issue.severity];

      score -= deduction;
    });

    return Math.max(0, score);
  }

  /**
   * Calculate projected impact of implementing recommendations
   */
  private calculateProjectedImpact(
    pageData: PageAnalytics,
    recommendations: CroRecommendationDetail[]
  ): {
    additionalConversions: number;
    conversionRateIncrease: number;
    estimatedRevenue: number;
    confidence: number;
  } {
    // Aggregate expected lift from all recommendations (diminishing returns)
    const totalLift = recommendations.reduce((sum, rec, index) => {
      const multiplier = 1 - (index * 0.1); // Diminishing returns for each additional rec
      return sum + (rec.expectedLift * multiplier);
    }, 0);

    const cappedLift = Math.min(totalLift, 80); // Cap at 80% improvement
    const newConversionRate = pageData.conversionRate * (1 + cappedLift / 100);
    const additionalConversions = Math.round(
      (pageData.uniqueVisitors * (newConversionRate / 100)) - pageData.conversions
    );

    // Average confidence from all recommendations
    const avgConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / 
                          (recommendations.length || 1);

    return {
      additionalConversions,
      conversionRateIncrease: cappedLift,
      estimatedRevenue: additionalConversions * 100, // Assume $100 per conversion
      confidence: Math.round(avgConfidence),
    };
  }

  /**
   * Get percentile ranking (lower is better for negative metrics like bounce rate)
   */
  private getPercentile(current: number, benchmark: number): number {
    const ratio = current / benchmark;
    return Math.min(100, Math.max(0, Math.round(ratio * 50)));
  }
}
