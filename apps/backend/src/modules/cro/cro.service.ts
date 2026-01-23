import { Injectable } from '@nestjs/common';
import {
  CroInsight,
  CroInsightType,
  CroDashboard,
  CroRecommendation,
  CroCategory,
  InsightStatus,
} from '@riviso/shared-types';
import { CroEngineService, PageAnalytics } from './services/cro-engine.service';

@Injectable()
export class CroService {
  constructor(private croEngine: CroEngineService) {}

  async getInsights(projectId: string): Promise<CroInsight[]> {
    // Mock page data - in production, fetch from analytics database
    const mockPages: PageAnalytics[] = [
      {
        url: '/products/premium-plan',
        pageViews: 2400,
        uniqueVisitors: 1850,
        avgTimeOnPage: 45,
        bounceRate: 58,
        exitRate: 62,
        conversions: 43,
        conversionRate: 1.8,
        trafficSource: 'organic',
        userIntent: 'transactional',
        pageType: 'product',
      },
      {
        url: '/checkout',
        pageViews: 1200,
        uniqueVisitors: 950,
        avgTimeOnPage: 120,
        bounceRate: 12,
        exitRate: 68,
        conversions: 304,
        conversionRate: 32,
        trafficSource: 'direct',
        userIntent: 'transactional',
        pageType: 'checkout',
      },
      {
        url: '/blog/ultimate-guide',
        pageViews: 3500,
        uniqueVisitors: 2800,
        avgTimeOnPage: 25,
        bounceRate: 72,
        exitRate: 68,
        conversions: 35,
        conversionRate: 1.0,
        trafficSource: 'organic',
        userIntent: 'informational',
        pageType: 'content',
      },
    ];

    const insights: CroInsight[] = [];

    // Analyze each page using the CRO engine
    for (const pageData of mockPages) {
      const analysis = await this.croEngine.analyzePage(pageData);
      
      if (analysis.issues.length > 0) {
        const primaryIssue = analysis.issues[0]; // Most severe issue
        
        insights.push({
          id: `insight-${Date.now()}-${Math.random()}`,
          projectId,
          pageUrl: pageData.url,
          type: this.mapIssueTypeToCroInsightType(primaryIssue.type),
          priority: primaryIssue.severity,
          title: primaryIssue.title,
          description: primaryIssue.description,
          currentMetrics: {
            url: pageData.url,
            pageViews: pageData.pageViews,
            uniqueVisitors: pageData.uniqueVisitors,
            avgTimeOnPage: pageData.avgTimeOnPage,
            bounceRate: pageData.bounceRate,
            exitRate: pageData.exitRate,
            conversions: pageData.conversions,
            conversionRate: pageData.conversionRate,
          },
          projectedImpact: {
            conversionRateIncrease: analysis.projectedImpact.conversionRateIncrease,
            additionalConversions: analysis.projectedImpact.additionalConversions,
            potentialRevenue: analysis.projectedImpact.estimatedRevenue,
            confidence: analysis.projectedImpact.confidence,
          },
          recommendations: this.mapEngineRecommendationsToCroRecommendations(analysis.recommendations),
          status: InsightStatus.NEW,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return insights.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private mapIssueTypeToCroInsightType(
    issueType: 'high_traffic_low_conversion' | 'intent_mismatch' | 'funnel_drop_off' | 'poor_engagement' | 'exit_page'
  ): CroInsightType {
    const mapping = {
      high_traffic_low_conversion: CroInsightType.HIGH_TRAFFIC_LOW_CONVERSION,
      intent_mismatch: CroInsightType.INTENT_MISMATCH,
      funnel_drop_off: CroInsightType.FUNNEL_DROP_OFF,
      poor_engagement: CroInsightType.POOR_ENGAGEMENT,
      exit_page: CroInsightType.HIGH_EXIT_RATE,
    };
    return mapping[issueType] || CroInsightType.POOR_ENGAGEMENT;
  }

  private mapEngineRecommendationsToCroRecommendations(
    engineRecs: any[]
  ): CroRecommendation[] {
    return engineRecs.map(rec => ({
      id: rec.id,
      category: this.mapCategory(rec.category),
      title: rec.title,
      description: rec.description,
      reasoning: rec.reasoning,
      actionItems: rec.actionItems.map((item: any) => ({
        id: `action-${Date.now()}-${Math.random()}`,
        description: item.task,
        completed: false,
      })),
      effort: rec.effort,
      expectedImpact: rec.expectedImpact,
      examples: rec.examples,
      aiGenerated: true,
    }));
  }

  private mapCategory(category: string): CroCategory {
    const mapping: { [key: string]: CroCategory } = {
      cta: CroCategory.CTA_OPTIMIZATION,
      trust: CroCategory.TRUST_SIGNALS,
      copy: CroCategory.COPY_OPTIMIZATION,
      design: CroCategory.DESIGN_UX,
      ux: CroCategory.DESIGN_UX,
      technical: CroCategory.TECHNICAL,
      form: CroCategory.FORM_OPTIMIZATION,
    };
    return mapping[category] || CroCategory.COPY_OPTIMIZATION;
  }

  async getInsightsOld(projectId: string): Promise<CroInsight[]> {
    // Old mock implementation - keeping for reference
    return [
      {
        id: 'insight-1',
        projectId,
        pageUrl: '/products/premium-plan',
        type: CroInsightType.HIGH_TRAFFIC_LOW_CONVERSION,
        priority: 'critical',
        title: 'High Traffic, Low Conversion on Premium Plan Page',
        description: 'This page receives 2,400 monthly visitors but only converts at 1.8%',
        currentMetrics: {
          url: '/products/premium-plan',
          pageViews: 2400,
          uniqueVisitors: 1850,
          avgTimeOnPage: 45,
          bounceRate: 58,
          exitRate: 62,
          conversions: 43,
          conversionRate: 1.8,
        },
        projectedImpact: {
          conversionRateIncrease: 65,
          additionalConversions: 28,
          potentialRevenue: 2800,
          confidence: 78,
        },
        recommendations: [],
        status: InsightStatus.NEW,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'insight-2',
        projectId,
        pageUrl: '/checkout',
        type: CroInsightType.FUNNEL_DROP_OFF,
        priority: 'high',
        title: 'High Cart Abandonment Rate',
        description: '68% of users abandon cart at checkout page',
        currentMetrics: {
          url: '/checkout',
          pageViews: 1200,
          uniqueVisitors: 950,
          avgTimeOnPage: 120,
          bounceRate: 12,
          exitRate: 68,
          conversions: 304,
          conversionRate: 32,
        },
        projectedImpact: {
          conversionRateIncrease: 45,
          additionalConversions: 137,
          potentialRevenue: 13700,
          confidence: 82,
        },
        recommendations: [],
        status: InsightStatus.NEW,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  async getDashboard(projectId: string): Promise<CroDashboard> {
    const insights = await this.getInsights(projectId);

    return {
      projectId,
      summary: {
        totalInsights: insights.length,
        criticalIssues: insights.filter(i => i.priority === 'critical').length,
        averageConversionRate: 2.5,
        projectedLift: 55,
        implementedRecommendations: 3,
      },
      topOpportunities: insights,
      recentTests: [
        {
          id: 'test-1',
          name: 'Checkout CTA Button Color',
          type: 'a_b',
          status: 'running',
          startDate: new Date().toISOString(),
          variants: [
            {
              id: 'var-control',
              name: 'Control (Blue)',
              conversionRate: 3.2,
              visitors: 1240,
              conversions: 40,
              isControl: true,
            },
            {
              id: 'var-test',
              name: 'Variant (Green)',
              conversionRate: 4.1,
              visitors: 1220,
              conversions: 50,
              isControl: false,
            },
          ],
        },
      ],
      impactAnalysis: {
        totalPotentialLift: 55,
        quickWins: insights.filter(i => i.priority === 'high').slice(0, 3),
        longTermOpportunities: insights.filter(i => i.priority === 'medium'),
        estimatedROI: 340,
      },
    };
  }

  async analyzePage(pageUrl: string, projectId: string): Promise<CroInsight> {
    // Mock AI-powered analysis
    return {
      id: `insight-${Date.now()}`,
      projectId,
      pageUrl,
      type: CroInsightType.POOR_ENGAGEMENT,
      priority: 'medium',
      title: 'Low Engagement Detected',
      description: 'Average time on page is below industry standards',
      currentMetrics: {
        url: pageUrl,
        pageViews: 850,
        uniqueVisitors: 680,
        avgTimeOnPage: 32,
        bounceRate: 64,
        exitRate: 58,
        conversions: 12,
        conversionRate: 1.4,
      },
      projectedImpact: {
        conversionRateIncrease: 35,
        additionalConversions: 4,
        confidence: 65,
      },
      recommendations: this.generateRecommendations(pageUrl),
      status: InsightStatus.NEW,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getRecommendations(insightId: string): Promise<CroRecommendation[]> {
    return this.generateRecommendations('/example-page');
  }

  private generateRecommendations(pageUrl: string): CroRecommendation[] {
    return [
      {
        id: 'rec-1',
        category: CroCategory.CTA_OPTIMIZATION,
        title: 'Optimize Call-to-Action Placement',
        description: 'Move primary CTA above the fold and increase button size',
        reasoning: 'Heat map analysis shows users rarely scroll to current CTA position. 78% of conversions happen when CTA is visible immediately.',
        actionItems: [
          {
            id: 'action-1',
            description: 'Reposition main CTA to hero section',
            completed: false,
          },
          {
            id: 'action-2',
            description: 'Increase button size to 48px height',
            completed: false,
          },
          {
            id: 'action-3',
            description: 'Use contrasting color for better visibility',
            completed: false,
          },
        ],
        effort: 'low',
        expectedImpact: 'high',
        aiGenerated: true,
      },
      {
        id: 'rec-2',
        category: CroCategory.TRUST_SIGNALS,
        title: 'Add Social Proof Elements',
        description: 'Include customer testimonials and trust badges',
        reasoning: 'Pages with social proof convert 34% better. Your page currently lacks trust indicators.',
        actionItems: [
          {
            id: 'action-4',
            description: 'Add 3-5 customer testimonials',
            completed: false,
          },
          {
            id: 'action-5',
            description: 'Include security badges near form',
            completed: false,
          },
          {
            id: 'action-6',
            description: 'Display customer count or ratings',
            completed: false,
          },
        ],
        effort: 'medium',
        expectedImpact: 'high',
        aiGenerated: true,
      },
      {
        id: 'rec-3',
        category: CroCategory.COPY_OPTIMIZATION,
        title: 'Improve Value Proposition Clarity',
        description: 'Rewrite headline to focus on customer benefits',
        reasoning: 'Current headline is feature-focused. Benefit-driven headlines increase engagement by 47%.',
        actionItems: [
          {
            id: 'action-7',
            description: 'Rewrite headline emphasizing outcomes',
            completed: false,
          },
          {
            id: 'action-8',
            description: 'Add subheadline explaining unique value',
            completed: false,
          },
          {
            id: 'action-9',
            description: 'Use bullet points for key benefits',
            completed: false,
          },
        ],
        effort: 'low',
        expectedImpact: 'medium',
        examples: [
          {
            title: 'Before vs After',
            description: 'Change from "Advanced Features" to "Grow Your Business 3x Faster"',
            impact: '28% increase in conversions',
          },
        ],
        aiGenerated: true,
      },
    ];
  }
}
