import { Injectable, Logger } from '@nestjs/common';
import {
  NicheAnalysis,
  BusinessModel,
  IndustrySignal,
} from '@riviso/shared-types';

/**
 * Automatically detects website niche, industry, and business model
 * by analyzing content, structure, keywords, schema, and products
 */
@Injectable()
export class NicheDetectorService {
  private readonly logger = new Logger(NicheDetectorService.name);

  private readonly industryKeywords: Record<string, string[]> = {
    'E-commerce / Retail': ['shop', 'cart', 'checkout', 'product', 'buy', 'price', 'order', 'shipping', 'add to cart', 'store'],
    'SaaS / Software': ['software', 'platform', 'dashboard', 'login', 'signup', 'trial', 'subscription', 'features', 'api', 'integration'],
    'Healthcare': ['health', 'medical', 'doctor', 'patient', 'treatment', 'clinic', 'hospital', 'wellness', 'care'],
    'Finance / Banking': ['bank', 'loan', 'credit', 'investment', 'insurance', 'mortgage', 'financial', 'account', 'rate'],
    'Real Estate': ['property', 'home', 'real estate', 'listing', 'rent', 'apartment', 'house', 'mortgage', 'agent'],
    'Education': ['course', 'learn', 'training', 'education', 'student', 'class', 'curriculum', 'degree', 'certificate'],
    'Travel / Hospitality': ['travel', 'hotel', 'booking', 'flight', 'vacation', 'destination', 'resort', 'trip'],
    'Food & Restaurant': ['menu', 'restaurant', 'order', 'delivery', 'food', 'cuisine', 'reservation', 'dining'],
    'Professional Services': ['consulting', 'agency', 'service', 'solution', 'expertise', 'professional', 'partner'],
    'Technology': ['tech', 'innovation', 'digital', 'solution', 'cloud', 'data', 'automation', 'ai', 'machine learning'],
    'Media / Publishing': ['news', 'article', 'blog', 'content', 'subscribe', 'magazine', 'publication', 'editor'],
    'Fitness / Sports': ['fitness', 'gym', 'workout', 'training', 'exercise', 'sport', 'athlete', 'health'],
    'Beauty / Fashion': ['beauty', 'fashion', 'style', 'collection', 'trend', 'cosmetic', 'makeup', 'skincare'],
    'Automotive': ['car', 'vehicle', 'auto', 'dealer', 'motor', 'drive', 'model', 'lease'],
    'Legal': ['law', 'attorney', 'legal', 'lawyer', 'case', 'court', 'consultation', 'firm'],
    'Non-Profit': ['donate', 'charity', 'cause', 'mission', 'volunteer', 'community', 'foundation', 'support'],
  };

  private readonly businessModelIndicators: Record<BusinessModel, string[]> = {
    'ecommerce': ['add to cart', 'checkout', 'shipping', 'buy now', 'product', 'price', 'order'],
    'saas': ['free trial', 'pricing plans', 'monthly', 'annual', 'per user', 'enterprise', 'dashboard'],
    'marketplace': ['seller', 'buyer', 'listing', 'marketplace', 'vendor', 'commission'],
    'lead_generation': ['contact us', 'get quote', 'request demo', 'schedule call', 'free consultation'],
    'content_publisher': ['article', 'blog', 'news', 'subscribe', 'newsletter', 'author', 'published'],
    'subscription': ['subscribe', 'membership', 'monthly', 'annual plan', 'cancel anytime', 'premium'],
    'service_business': ['services', 'hire us', 'our process', 'portfolio', 'case study', 'clients'],
    'affiliate': ['review', 'comparison', 'best', 'top 10', 'affiliate', 'disclosure', 'recommended'],
    'freemium': ['free plan', 'upgrade', 'pro', 'premium features', 'free forever', 'paid plan'],
  };

  /**
   * Analyze website content to detect niche and business model
   */
  analyzeNiche(content: {
    title?: string;
    description?: string;
    headings?: string[];
    bodyText?: string;
    schemaTypes?: string[];
    productCount?: number;
    hasCart?: boolean;
    hasPricing?: boolean;
    hasLogin?: boolean;
    links?: string[];
  }): NicheAnalysis {
    const signals: IndustrySignal[] = [];
    const allText = this.combineText(content).toLowerCase();

    // Detect industry from content
    const industryScores = this.scoreIndustries(allText, signals);
    const sortedIndustries = Object.entries(industryScores)
      .sort(([, a], [, b]) => b - a);

    const primaryIndustry = sortedIndustries[0]?.[0] || 'General Business';
    const secondaryIndustries = sortedIndustries
      .slice(1, 4)
      .filter(([, score]) => score > 2)
      .map(([industry]) => industry);

    // Detect business model
    const businessModel = this.detectBusinessModel(content, allText, signals);

    // Analyze schema for industry signals
    this.analyzeSchema(content.schemaTypes, signals);

    // Calculate confidence
    const confidence = this.calculateConfidence(signals, industryScores[primaryIndustry] || 0);

    // Determine competitive position
    const competitivePosition = this.assessCompetitivePosition(content, signals);

    return {
      primaryIndustry,
      secondaryIndustries,
      businessModel,
      nicheConfidence: confidence,
      industrySignals: signals.slice(0, 10),
      competitivePosition,
    };
  }

  private combineText(content: {
    title?: string;
    description?: string;
    headings?: string[];
    bodyText?: string;
  }): string {
    const parts: string[] = [];
    if (content.title) parts.push(content.title);
    if (content.description) parts.push(content.description);
    if (content.headings) parts.push(...content.headings);
    if (content.bodyText) parts.push(content.bodyText.slice(0, 5000));
    return parts.join(' ');
  }

  private scoreIndustries(text: string, signals: IndustrySignal[]): Record<string, number> {
    const scores: Record<string, number> = {};

    for (const [industry, keywords] of Object.entries(this.industryKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          const matchWeight = keyword.split(' ').length; // Multi-word keywords worth more
          score += matches.length * matchWeight;
          if (matches.length >= 2) {
            signals.push({
              signal: `Found "${keyword}" ${matches.length} times`,
              source: 'keywords',
              weight: matchWeight * matches.length,
            });
          }
        }
      }
      scores[industry] = score;
    }

    return scores;
  }

  private detectBusinessModel(
    content: {
      hasCart?: boolean;
      hasPricing?: boolean;
      hasLogin?: boolean;
      productCount?: number;
    },
    text: string,
    signals: IndustrySignal[],
  ): BusinessModel {
    const modelScores: Record<BusinessModel, number> = {
      'ecommerce': 0,
      'saas': 0,
      'marketplace': 0,
      'lead_generation': 0,
      'content_publisher': 0,
      'subscription': 0,
      'service_business': 0,
      'affiliate': 0,
      'freemium': 0,
    };

    // Score based on structural elements
    if (content.hasCart) {
      modelScores['ecommerce'] += 10;
      signals.push({ signal: 'Shopping cart detected', source: 'structure', weight: 10 });
    }
    if (content.hasPricing) {
      modelScores['saas'] += 5;
      modelScores['subscription'] += 5;
      signals.push({ signal: 'Pricing page detected', source: 'structure', weight: 5 });
    }
    if (content.hasLogin) {
      modelScores['saas'] += 3;
      signals.push({ signal: 'Login functionality detected', source: 'structure', weight: 3 });
    }
    if (content.productCount && content.productCount > 10) {
      modelScores['ecommerce'] += 8;
      modelScores['marketplace'] += 5;
      signals.push({ signal: `${content.productCount} products detected`, source: 'products', weight: 8 });
    }

    // Score based on text indicators
    for (const [model, indicators] of Object.entries(this.businessModelIndicators)) {
      for (const indicator of indicators) {
        if (text.includes(indicator.toLowerCase())) {
          modelScores[model as BusinessModel] += 2;
        }
      }
    }

    // Find highest scoring model
    const topModel = Object.entries(modelScores)
      .sort(([, a], [, b]) => b - a)[0];

    return (topModel?.[0] as BusinessModel) || 'service_business';
  }

  private analyzeSchema(schemaTypes: string[] | undefined, signals: IndustrySignal[]): void {
    if (!schemaTypes || schemaTypes.length === 0) return;

    const schemaIndustryMap: Record<string, string> = {
      'Product': 'E-commerce / Retail',
      'SoftwareApplication': 'SaaS / Software',
      'MedicalClinic': 'Healthcare',
      'Restaurant': 'Food & Restaurant',
      'RealEstateAgent': 'Real Estate',
      'Course': 'Education',
      'Hotel': 'Travel / Hospitality',
      'LegalService': 'Legal',
      'Organization': 'Professional Services',
    };

    for (const schema of schemaTypes) {
      if (schemaIndustryMap[schema]) {
        signals.push({
          signal: `${schema} schema detected`,
          source: 'schema',
          weight: 5,
        });
      }
    }
  }

  private calculateConfidence(signals: IndustrySignal[], topScore: number): number {
    const signalCount = signals.length;
    const signalWeight = signals.reduce((sum, s) => sum + s.weight, 0);

    // Base confidence on signal diversity and strength
    let confidence = 40; // Base

    if (signalCount >= 5) confidence += 15;
    if (signalCount >= 10) confidence += 10;
    if (signalWeight >= 20) confidence += 15;
    if (signalWeight >= 50) confidence += 10;
    if (topScore >= 10) confidence += 10;

    return Math.min(95, confidence);
  }

  private assessCompetitivePosition(
    content: {
      hasLogin?: boolean;
      productCount?: number;
    },
    signals: IndustrySignal[],
  ): NicheAnalysis['competitivePosition'] {
    const signalWeight = signals.reduce((sum, s) => sum + s.weight, 0);

    // Simple heuristic based on site sophistication
    if (signalWeight >= 50 && content.hasLogin && content.productCount && content.productCount > 50) {
      return 'leader';
    }
    if (signalWeight >= 30) {
      return 'challenger';
    }
    if (signalWeight >= 15) {
      return 'niche_player';
    }
    return 'emerging';
  }
}
