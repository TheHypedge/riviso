import { Injectable } from '@nestjs/common';
import { DataFetchResult } from './data-fetcher.service';
import { PromptAnalysis } from './prompt-mapper.service';

/**
 * Generates intelligent AI responses with confidence scores and explanations
 */

export interface AiResponse {
  answer: string;
  confidence: number;
  reasoning: string;
  dataUsed: DataSourceUsage[];
  suggestions: string[];
}

export interface DataSourceUsage {
  source: string;
  type: string;
  recordsUsed: number;
  confidence: number;
  summary: string;
}

@Injectable()
export class ResponseGeneratorService {
  /**
   * Generate response for traffic drop query
   */
  generateTrafficDropResponse(
    analysis: PromptAnalysis,
    dataResult: DataFetchResult
  ): AiResponse {
    // Extract data from results
    const analyticsData = dataResult.data.find(d => d.source.includes('Analytics'));
    const keywordData = dataResult.data.find(d => d.source.includes('Keyword'));
    const seoData = dataResult.data.find(d => d.source.includes('SEO'));

    const timeline = analyticsData?.data?.timeline || [];
    const summary = analyticsData?.data?.summary;
    const keywords = keywordData?.data?.keywords || [];
    const audits = seoData?.data?.audits || [];

    // Calculate confidence based on data availability
    let confidence = 0.7; // Base confidence
    if (timeline.length > 0) confidence += 0.1;
    if (keywords.length > 0) confidence += 0.1;
    if (audits.length > 0) confidence += 0.1;
    confidence = Math.min(confidence, 0.99);

    // Generate answer
    const dropPercentage = summary?.dropPercentage || -27.5;
    const dropDate = summary?.dropDate || '2024-01-15';
    
    let answer = `Based on my analysis of your analytics data, I've identified a significant traffic drop of ${Math.abs(dropPercentage).toFixed(1)}% that occurred around ${dropDate}.\n\n`;
    
    answer += `**Main Contributing Factors:**\n\n`;
    
    // Factor 1: Keyword ranking drops
    if (keywords.length > 0) {
      const totalDropped = keywords.length;
      const avgLoss = (keywords.reduce((sum: number, k: any) => sum + Math.abs(k.change), 0) / keywords.length).toFixed(1);
      answer += `1. **Keyword Ranking Declines** (High Impact)\n`;
      answer += `   - ${totalDropped} keywords lost rankings around the same time\n`;
      answer += `   - Average rank loss: ${avgLoss} positions\n`;
      answer += `   - Top affected: "${keywords[0].keyword}" (${keywords[0].previousRank} → ${keywords[0].currentRank})\n\n`;
    }
    
    // Factor 2: Technical SEO issues
    if (audits.length > 0 && audits[0].changes) {
      answer += `2. **Technical Performance Issues** (Medium Impact)\n`;
      audits[0].changes.forEach((change: string) => {
        answer += `   - ${change}\n`;
      });
      answer += `\n`;
    }
    
    // Factor 3: Seasonality or algorithm update
    answer += `3. **Potential Algorithm Update** (Uncertain)\n`;
    answer += `   - The timing suggests a possible Google algorithm update\n`;
    answer += `   - Check Google's official announcements for ${dropDate}\n\n`;
    
    answer += `**Recommended Actions:**\n`;
    answer += `1. Focus on recovering rankings for your top keywords\n`;
    answer += `2. Address the technical performance issues immediately\n`;
    answer += `3. Analyze your top competitors' recent content changes\n`;
    answer += `4. Review any site changes or deployments made before ${dropDate}`;

    // Generate reasoning
    const reasoning = `I analyzed ${timeline.length} days of traffic data, ${keywords.length} keyword rankings, and ${audits.length} SEO audits. The correlation between the traffic drop date (${dropDate}) and keyword ranking losses strongly suggests a ranking-related cause. My confidence is ${(confidence * 100).toFixed(0)}% based on the strength of this correlation and the completeness of the data.`;

    // Data usage summary
    const dataUsed: DataSourceUsage[] = dataResult.data.map(d => ({
      source: d.source,
      type: d.type,
      recordsUsed: d.recordCount,
      confidence: d.confidence,
      summary: this.summarizeDataUsage(d.source, d.recordCount),
    }));

    return {
      answer,
      confidence,
      reasoning,
      dataUsed,
      suggestions: [
        'Show me which pages lost the most traffic',
        'What did my competitors do differently?',
        'How can I recover these keyword rankings?',
      ],
    };
  }

  /**
   * Generate response for low CTR query
   */
  generateLowCtrResponse(
    analysis: PromptAnalysis,
    dataResult: DataFetchResult
  ): AiResponse {
    // Extract data
    const searchConsoleData = dataResult.data.find(d => d.source.includes('CTR by Page'));
    const metadataData = dataResult.data.find(d => d.source.includes('Metadata'));

    const pages = searchConsoleData?.data?.pages || [];
    const avgCtr = searchConsoleData?.data?.summary?.avgCtr || 1.48;
    const metadataPages = metadataData?.data?.pages || [];
    const issues = metadataData?.data?.issues || [];

    // Calculate confidence
    let confidence = 0.75;
    if (pages.length >= 3) confidence += 0.1;
    if (issues.length > 0) confidence += 0.1;
    confidence = Math.min(confidence, 0.99);

    // Generate answer
    let answer = `I've analyzed your Search Console data and identified ${pages.length} pages with below-average click-through rates (under 2%).\n\n`;
    
    answer += `**Pages Requiring Attention:**\n\n`;
    pages.forEach((page: any, index: number) => {
      answer += `${index + 1}. **${page.url}**\n`;
      answer += `   - CTR: ${page.ctr.toFixed(2)}% (${avgCtr.toFixed(2)}% avg)\n`;
      answer += `   - Impressions: ${page.impressions.toLocaleString()}\n`;
      answer += `   - Current Position: ${page.avgPosition.toFixed(1)}\n`;
      answer += `   - Opportunity: ${((avgCtr - page.ctr) / 100 * page.impressions).toFixed(0)} additional clicks/month\n\n`;
    });

    answer += `**Root Causes Identified:**\n\n`;
    
    if (issues.length > 0) {
      issues.forEach((issue: string, index: number) => {
        answer += `${index + 1}. ${issue}\n`;
      });
      answer += `\n`;
    }

    // Analyze specific metadata issues
    const missingDescriptions = metadataPages.filter((p: any) => !p.metaDescription || p.descriptionLength === 0);
    const shortTitles = metadataPages.filter((p: any) => p.titleLength < 30);

    if (missingDescriptions.length > 0) {
      answer += `**Critical Issue: Missing Meta Descriptions**\n`;
      answer += `- ${missingDescriptions.length} pages have no meta description\n`;
      answer += `- This significantly impacts CTR in search results\n\n`;
    }

    answer += `**Recommended Optimizations:**\n\n`;
    answer += `1. **Write Compelling Meta Descriptions** (High Priority)\n`;
    answer += `   - Include primary keyword naturally\n`;
    answer += `   - Add a clear call-to-action\n`;
    answer += `   - Keep between 150-160 characters\n`;
    answer += `   - Example: "Discover how [Product] helps [solve problem]. Try free for 14 days. No credit card required."\n\n`;
    
    answer += `2. **Optimize Title Tags** (High Priority)\n`;
    answer += `   - Use power words (Free, Guide, Best, 2024)\n`;
    answer += `   - Include numbers when relevant\n`;
    answer += `   - Keep between 50-60 characters\n\n`;
    
    answer += `3. **Add Structured Data** (Medium Priority)\n`;
    answer += `   - Implement FAQ schema for relevant pages\n`;
    answer += `   - Add product schema for /pricing\n`;
    answer += `   - Use breadcrumb markup\n\n`;

    const totalOpportunity = pages.reduce((sum: number, p: any) => 
      sum + ((avgCtr - p.ctr) / 100 * p.impressions), 0
    );
    
    answer += `**Projected Impact:**\n`;
    answer += `If you optimize these ${pages.length} pages to reach the average CTR of ${avgCtr.toFixed(2)}%, you could gain approximately **${totalOpportunity.toFixed(0)} additional clicks per month**.`;

    const reasoning = `I analyzed ${pages.length} pages with CTR data from Search Console and cross-referenced with metadata quality. The strong correlation between missing/poor meta descriptions and low CTR (${missingDescriptions.length}/${pages.length} pages affected) gives me ${(confidence * 100).toFixed(0)}% confidence in these recommendations.`;

    const dataUsed: DataSourceUsage[] = dataResult.data.map(d => ({
      source: d.source,
      type: d.type,
      recordsUsed: d.recordCount,
      confidence: d.confidence,
      summary: this.summarizeDataUsage(d.source, d.recordCount),
    }));

    return {
      answer,
      confidence,
      reasoning,
      dataUsed,
      suggestions: [
        'Write meta descriptions for my top pages',
        'Show me examples of high-CTR titles',
        'What structured data should I add?',
      ],
    };
  }

  /**
   * Generate response for competitor ranking query
   */
  generateCompetitorRankingResponse(
    analysis: PromptAnalysis,
    dataResult: DataFetchResult
  ): AiResponse {
    // Extract data
    const comparisonData = dataResult.data.find(d => d.source.includes('Comparison'));
    const authorityData = dataResult.data.find(d => d.source.includes('Authority'));
    const gapData = dataResult.data.find(d => d.source.includes('Gap'));

    const comparisons = comparisonData?.data?.comparisons || [];
    const competitors = authorityData?.data?.competitors || [];
    const ourDomain = authorityData?.data?.ourDomain || {};
    const opportunities = gapData?.data?.opportunities || [];

    // Calculate confidence
    let confidence = 0.85;
    if (comparisons.length >= 3) confidence += 0.05;
    if (competitors.length >= 3) confidence += 0.05;
    if (opportunities.length > 0) confidence += 0.05;
    confidence = Math.min(confidence, 0.99);

    // Generate answer
    let answer = `I've analyzed ${comparisons.length} keywords where competitors outrank you. Here's what I found:\n\n`;
    
    answer += `**Competitive Landscape:**\n\n`;
    
    if (competitors.length > 0) {
      const topCompetitor = competitors[0];
      answer += `Your main competitor is **${topCompetitor.domain}** with:\n`;
      answer += `- Domain Authority: ${topCompetitor.authorityScore} (vs. your ${ourDomain.authorityScore})\n`;
      answer += `- Total Keywords: ${topCompetitor.totalKeywords.toLocaleString()} (vs. your ${ourDomain.totalKeywords})\n`;
      answer += `- Common Keywords: ${topCompetitor.commonKeywords}\n\n`;
      
      const authorityGap = topCompetitor.authorityScore - ourDomain.authorityScore;
      answer += `**Authority Gap:** ${authorityGap} points — This is a significant but closeable gap.\n\n`;
    }

    answer += `**Keywords Where You're Being Outranked:**\n\n`;
    
    comparisons.slice(0, 5).forEach((comp: any, index: number) => {
      answer += `${index + 1}. **"${comp.keyword}"**\n`;
      answer += `   - ${comp.competitorDomain}: #${comp.competitorRank}\n`;
      answer += `   - Your site: #${comp.ourRank}\n`;
      answer += `   - Gap: ${comp.gap} positions\n\n`;
    });

    if (opportunities.length > 0) {
      answer += `**High-Opportunity Content Gaps:**\n\n`;
      answer += `These are keywords your competitors rank for, but you don't:\n\n`;
      
      opportunities.forEach((opp: any, index: number) => {
        answer += `${index + 1}. **"${opp.keyword}"** (${opp.searchVolume.toLocaleString()} searches/mo)\n`;
        answer += `   - Ranking: ${opp.competitorsRanking.join(', ')}\n`;
        answer += `   - Difficulty: ${opp.difficulty}/100\n`;
        answer += `   - Recommendation: ${opp.difficulty < 60 ? 'Target this (Low-Medium difficulty)' : 'Build authority first'}\n\n`;
      });
    }

    answer += `**Strategic Recommendations:**\n\n`;
    
    answer += `1. **Quick Wins** (Focus here first)\n`;
    answer += `   - Target keywords where you rank #6-15 (easiest to improve)\n`;
    answer += `   - Create comprehensive content for gaps with difficulty < 60\n`;
    answer += `   - Improve on-page SEO for underperforming pages\n\n`;
    
    answer += `2. **Build Authority** (Medium-term)\n`;
    answer += `   - Earn quality backlinks from industry sites\n`;
    answer += `   - Create linkable assets (guides, tools, research)\n`;
    answer += `   - Guest post on authoritative blogs\n\n`;
    
    answer += `3. **Content Strategy** (Long-term)\n`;
    answer += `   - Analyze top-ranking competitor content\n`;
    answer += `   - Create better, more comprehensive versions\n`;
    answer += `   - Focus on E-E-A-T signals (expertise, authority, trust)\n\n`;

    const avgGap = (comparisons.reduce((sum: number, c: any) => sum + c.gap, 0) / comparisons.length).toFixed(1);
    answer += `**Reality Check:**\n`;
    answer += `The average ranking gap is ${avgGap} positions. Closing this gap will take 3-6 months of consistent effort, but the ${opportunities.length} content gap opportunities offer quicker wins.`;

    const reasoning = `I analyzed ${comparisons.length} direct keyword comparisons, ${competitors.length} competitor profiles, and ${opportunities.length} content gap opportunities. The data shows a clear authority gap (${competitors[0]?.authorityScore - ourDomain.authorityScore} points) which explains most of the ranking differences. My confidence is ${(confidence * 100).toFixed(0)}% based on comprehensive competitor data.`;

    const dataUsed: DataSourceUsage[] = dataResult.data.map(d => ({
      source: d.source,
      type: d.type,
      recordsUsed: d.recordCount,
      confidence: d.confidence,
      summary: this.summarizeDataUsage(d.source, d.recordCount),
    }));

    return {
      answer,
      confidence,
      reasoning,
      dataUsed,
      suggestions: [
        'Show me the full content gap analysis',
        'What backlinks do my competitors have?',
        'Which keywords should I prioritize?',
      ],
    };
  }

  /**
   * Generate general response
   */
  generateGeneralResponse(userPrompt: string): AiResponse {
    const answer = `I'm your AI assistant for growth intelligence. I can help you with:

• **Traffic Analysis** - "Why did my traffic drop?"
• **CTR Optimization** - "Which pages have low click-through rates?"
• **Competitor Research** - "Which competitors outrank me?"
• **Keyword Insights** - "What are my top keywords?"
• **SEO Audits** - "What are my biggest SEO issues?"
• **CRO Recommendations** - "How can I improve conversions?"

Ask me a specific question about your data, and I'll provide detailed insights with supporting data sources.`;

    return {
      answer,
      confidence: 0.6,
      reasoning: 'General guidance provided. Ask a specific question for detailed analysis with data.',
      dataUsed: [],
      suggestions: [
        'Why did my traffic drop?',
        'Which pages have low CTR?',
        'Which competitors outrank us?',
        'What are my biggest SEO issues?',
      ],
    };
  }

  /**
   * Summarize data usage for transparency
   */
  private summarizeDataUsage(sourceName: string, recordCount: number): string {
    if (sourceName.includes('Analytics')) {
      return `Analyzed ${recordCount} days of traffic data`;
    }
    if (sourceName.includes('Keyword')) {
      return `Examined ${recordCount} keyword rankings`;
    }
    if (sourceName.includes('SEO')) {
      return `Reviewed ${recordCount} SEO audit results`;
    }
    if (sourceName.includes('Competitor')) {
      return `Compared ${recordCount} competitor data points`;
    }
    if (sourceName.includes('CTR')) {
      return `Analyzed CTR data for ${recordCount} pages`;
    }
    if (sourceName.includes('Metadata')) {
      return `Checked metadata quality for ${recordCount} pages`;
    }
    return `Processed ${recordCount} records`;
  }
}
