import { Injectable } from '@nestjs/common';
import {
  TopicCluster,
  ClusterKeyword,
  KeywordContentGap,
  TopicMap,
  TopicMapNode,
  IntentStage,
} from '@riviso/shared-types';

/**
 * Analyzes topics to build semantic clusters and topic maps
 */
@Injectable()
export class TopicAnalyzerService {
  /**
   * Build a topic cluster around a pillar keyword
   */
  buildTopicCluster(keyword: string): TopicCluster {
    const normalizedKeyword = keyword.toLowerCase().trim();
    const clusterKeywords = this.generateClusterKeywords(normalizedKeyword);
    const gaps = this.identifyKeywordContentGaps(normalizedKeyword, clusterKeywords);

    return {
      id: `cluster-${Date.now()}`,
      name: this.generateClusterName(normalizedKeyword),
      pillarKeyword: normalizedKeyword,
      clusterKeywords,
      semanticRelevance: this.calculateSemanticRelevance(clusterKeywords),
      contentCoverage: this.calculateContentCoverage(clusterKeywords),
      gapAnalysis: gaps,
    };
  }

  /**
   * Generate a visual topic map
   */
  generateTopicMap(keyword: string, depth: 'quick' | 'standard' | 'deep' = 'standard'): TopicMap {
    const normalizedKeyword = keyword.toLowerCase().trim();
    const maxDepth = depth === 'quick' ? 2 : depth === 'standard' ? 3 : 4;

    const rootNode = this.buildTopicNode(normalizedKeyword, 'pillar', maxDepth);
    const allNodes = this.flattenNodes(rootNode);
    const connections = this.buildConnections(allNodes);

    return {
      rootTopic: normalizedKeyword,
      nodes: allNodes,
      connections,
      metrics: this.calculateMapMetrics(allNodes),
    };
  }

  private generateClusterKeywords(pillarKeyword: string): ClusterKeyword[] {
    const keywords: ClusterKeyword[] = [];
    const words = pillarKeyword.split(' ');

    // Synonyms
    const synonymPatterns = [
      `${pillarKeyword} tool`,
      `${pillarKeyword} software`,
      `${pillarKeyword} platform`,
      `${pillarKeyword} solution`,
    ];

    // Subtopics
    const subtopicPatterns = [
      `${pillarKeyword} strategy`,
      `${pillarKeyword} best practices`,
      `${pillarKeyword} techniques`,
      `${pillarKeyword} framework`,
      `${pillarKeyword} metrics`,
      `${pillarKeyword} analytics`,
    ];

    // Related concepts
    const relatedPatterns = [
      `${pillarKeyword} implementation`,
      `${pillarKeyword} optimization`,
      `${pillarKeyword} automation`,
      `${pillarKeyword} integration`,
    ];

    // Modifiers
    const modifierPatterns = [
      `best ${pillarKeyword}`,
      `top ${pillarKeyword}`,
      `free ${pillarKeyword}`,
      `enterprise ${pillarKeyword}`,
      `${pillarKeyword} for small business`,
    ];

    // Long tail
    const longTailPatterns = [
      `how to improve ${pillarKeyword}`,
      `${pillarKeyword} tips and tricks`,
      `${pillarKeyword} guide for beginners`,
      `${pillarKeyword} case studies`,
      `${pillarKeyword} ROI calculator`,
    ];

    const addKeywords = (patterns: string[], relationship: ClusterKeyword['relationship']) => {
      patterns.forEach(pattern => {
        keywords.push({
          keyword: pattern,
          relationship,
          volume: Math.floor(100 + Math.random() * 2000),
          difficulty: Math.floor(20 + Math.random() * 60),
          covered: Math.random() > 0.6,
        });
      });
    };

    addKeywords(synonymPatterns, 'synonym');
    addKeywords(subtopicPatterns, 'subtopic');
    addKeywords(relatedPatterns, 'related');
    addKeywords(modifierPatterns, 'modifier');
    addKeywords(longTailPatterns, 'long_tail');

    return keywords.sort((a, b) => b.volume - a.volume);
  }

  private identifyKeywordContentGaps(pillarKeyword: string, clusterKeywords: ClusterKeyword[]): KeywordContentGap[] {
    const gaps: KeywordContentGap[] = [];
    const uncoveredKeywords = clusterKeywords.filter(k => !k.covered);

    // Group by relationship type
    const groupedByType = uncoveredKeywords.reduce((acc, k) => {
      if (!acc[k.relationship]) acc[k.relationship] = [];
      acc[k.relationship].push(k);
      return acc;
    }, {} as Record<string, ClusterKeyword[]>);

    for (const [type, keywords] of Object.entries(groupedByType)) {
      if (keywords.length > 0) {
        const topKeyword = keywords[0];
        gaps.push({
          topic: `${type.replace('_', ' ')} content for ${pillarKeyword}`,
          currentCoverage: 0,
          competitorCoverage: 60 + Math.random() * 30,
          opportunity: this.generateOpportunityDescription(type, keywords),
          suggestedContent: this.suggestContent(type, topKeyword.keyword),
        });
      }
    }

    return gaps.slice(0, 5);
  }

  private generateOpportunityDescription(type: string, keywords: ClusterKeyword[]): string {
    const totalVolume = keywords.reduce((sum, k) => sum + k.volume, 0);
    return `Capture ${totalVolume.toLocaleString()} monthly searches with ${type.replace('_', ' ')} content covering ${keywords.length} keywords`;
  }

  private suggestContent(type: string, keyword: string): string {
    const suggestions: Record<string, string> = {
      'synonym': `Create a comparison page: "${keyword}" alternatives and options`,
      'subtopic': `Write an in-depth guide: "Complete guide to ${keyword}"`,
      'related': `Develop a tutorial: "How to implement ${keyword}"`,
      'modifier': `Build a listicle: "Top 10 ${keyword} in 2024"`,
      'long_tail': `Create a FAQ page answering common questions about ${keyword}`,
    };
    return suggestions[type] || `Create comprehensive content about ${keyword}`;
  }

  private buildTopicNode(
    keyword: string,
    type: TopicMapNode['type'],
    maxDepth: number,
    currentDepth: number = 0,
  ): TopicMapNode {
    const node: TopicMapNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: keyword,
      type,
      volume: Math.floor(100 + Math.random() * 5000),
      intent: this.inferIntent(keyword),
      covered: Math.random() > 0.4,
    };

    if (currentDepth < maxDepth && type !== 'question') {
      node.children = this.generateChildNodes(keyword, type, maxDepth, currentDepth + 1);
    }

    return node;
  }

  private generateChildNodes(
    parentKeyword: string,
    parentType: TopicMapNode['type'],
    maxDepth: number,
    currentDepth: number,
  ): TopicMapNode[] {
    const children: TopicMapNode[] = [];
    const childCount = parentType === 'pillar' ? 5 : parentType === 'cluster' ? 4 : 3;

    if (parentType === 'pillar') {
      // Generate cluster nodes
      const clusterTopics = [
        `${parentKeyword} strategy`,
        `${parentKeyword} tools`,
        `${parentKeyword} best practices`,
        `${parentKeyword} examples`,
        `${parentKeyword} analytics`,
      ];
      clusterTopics.slice(0, childCount).forEach(topic => {
        children.push(this.buildTopicNode(topic, 'cluster', maxDepth, currentDepth));
      });
    } else if (parentType === 'cluster') {
      // Generate keyword nodes
      const keywordVariants = [
        `how to ${parentKeyword}`,
        `${parentKeyword} guide`,
        `best ${parentKeyword}`,
        `${parentKeyword} tips`,
      ];
      keywordVariants.slice(0, childCount).forEach(variant => {
        children.push(this.buildTopicNode(variant, 'keyword', maxDepth, currentDepth));
      });
    } else {
      // Generate question nodes
      const questions = [
        `what is ${parentKeyword}`,
        `how does ${parentKeyword} work`,
        `why use ${parentKeyword}`,
      ];
      questions.slice(0, childCount).forEach(question => {
        children.push(this.buildTopicNode(question, 'question', maxDepth, currentDepth));
      });
    }

    return children;
  }

  private flattenNodes(node: TopicMapNode): TopicMapNode[] {
    const nodes: TopicMapNode[] = [{ ...node, children: undefined }];
    if (node.children) {
      node.children.forEach(child => {
        nodes.push(...this.flattenNodes(child));
      });
    }
    return nodes;
  }

  private buildConnections(nodes: TopicMapNode[]): Array<{ source: string; target: string; strength: number }> {
    const connections: Array<{ source: string; target: string; strength: number }> = [];

    // Build connections based on semantic similarity
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const similarity = this.calculateLabelSimilarity(nodes[i].label, nodes[j].label);
        if (similarity > 0.3) {
          connections.push({
            source: nodes[i].id,
            target: nodes[j].id,
            strength: similarity,
          });
        }
      }
    }

    return connections;
  }

  private calculateLabelSimilarity(label1: string, label2: string): number {
    const words1 = new Set(label1.toLowerCase().split(' '));
    const words2 = new Set(label2.toLowerCase().split(' '));
    const intersection = [...words1].filter(w => words2.has(w)).length;
    const union = new Set([...words1, ...words2]).size;
    return intersection / union;
  }

  private calculateMapMetrics(nodes: TopicMapNode[]): TopicMap['metrics'] {
    const intentCounts: Record<IntentStage, number> = {
      [IntentStage.INFORMATIONAL]: 0,
      [IntentStage.COMPARATIVE]: 0,
      [IntentStage.TRANSACTIONAL]: 0,
      [IntentStage.PROBLEM_SOLUTION]: 0,
      [IntentStage.TRUST_DRIVEN]: 0,
    };

    let totalVolume = 0;
    let coveredCount = 0;

    nodes.forEach(node => {
      if (node.intent) intentCounts[node.intent]++;
      if (node.volume) totalVolume += node.volume;
      if (node.covered) coveredCount++;
    });

    return {
      totalNodes: nodes.length,
      coveredNodes: coveredCount,
      avgVolume: nodes.length > 0 ? Math.round(totalVolume / nodes.length) : 0,
      intentDistribution: intentCounts,
    };
  }

  private inferIntent(keyword: string): IntentStage {
    const lower = keyword.toLowerCase();
    if (lower.includes('buy') || lower.includes('price') || lower.includes('discount')) {
      return IntentStage.TRANSACTIONAL;
    }
    if (lower.includes('vs') || lower.includes('compare') || lower.includes('best')) {
      return IntentStage.COMPARATIVE;
    }
    if (lower.includes('how to') || lower.includes('fix') || lower.includes('solve')) {
      return IntentStage.PROBLEM_SOLUTION;
    }
    if (lower.includes('review') || lower.includes('trust') || lower.includes('reliable')) {
      return IntentStage.TRUST_DRIVEN;
    }
    return IntentStage.INFORMATIONAL;
  }

  private generateClusterName(keyword: string): string {
    const words = keyword.split(' ');
    if (words.length <= 2) {
      return `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Topic Cluster`;
    }
    return `${words.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Cluster`;
  }

  private calculateSemanticRelevance(keywords: ClusterKeyword[]): number {
    if (keywords.length === 0) return 0;
    // Higher relevance for more synonyms and subtopics
    const relevantTypes = ['synonym', 'subtopic', 'related'];
    const relevantCount = keywords.filter(k => relevantTypes.includes(k.relationship)).length;
    return Math.min(100, Math.round((relevantCount / keywords.length) * 100));
  }

  private calculateContentCoverage(keywords: ClusterKeyword[]): number {
    if (keywords.length === 0) return 0;
    const coveredCount = keywords.filter(k => k.covered).length;
    return Math.round((coveredCount / keywords.length) * 100);
  }
}
