import { Injectable, Logger } from '@nestjs/common';
import {
  QuestionCluster,
  UserQuestion,
  QuestionType,
  IntentStage,
} from '@riviso/shared-types';
import { ContentGeneratorService } from '../../ai/services/content-generator.service';

/**
 * Generates user questions from keywords - Similar to "Answer The Public"
 * but with intent classification and business relevance scoring
 * Now powered by AI for natural, contextual questions
 */
@Injectable()
export class QuestionGeneratorService {
  private readonly logger = new Logger(QuestionGeneratorService.name);

  constructor(private readonly contentGenerator: ContentGeneratorService) {}

  private readonly questionPrefixes: Record<QuestionType, string[]> = {
    [QuestionType.WHAT]: ['what is', 'what are', 'what does', 'what makes', 'what\'s the difference'],
    [QuestionType.WHY]: ['why is', 'why does', 'why should', 'why do', 'why are'],
    [QuestionType.HOW]: ['how to', 'how does', 'how can', 'how do', 'how much', 'how long'],
    [QuestionType.WHEN]: ['when to', 'when should', 'when is', 'when does', 'when can'],
    [QuestionType.WHERE]: ['where to', 'where can', 'where is', 'where does'],
    [QuestionType.WHO]: ['who uses', 'who needs', 'who should', 'who can'],
    [QuestionType.CAN]: ['can you', 'can I', 'can', 'could'],
    [QuestionType.WHICH]: ['which is', 'which are', 'which should', 'which'],
    [QuestionType.WILL]: ['will', 'would'],
    [QuestionType.IS]: ['is', 'are', 'does', 'do'],
    [QuestionType.COMPARISON]: ['vs', 'versus', 'or', 'compared to', 'better than'],
    [QuestionType.PREPOSITION]: ['for', 'with', 'without', 'near', 'to'],
  };

  private readonly intentMappings: Record<QuestionType, IntentStage> = {
    [QuestionType.WHAT]: IntentStage.INFORMATIONAL,
    [QuestionType.WHY]: IntentStage.INFORMATIONAL,
    [QuestionType.HOW]: IntentStage.PROBLEM_SOLUTION,
    [QuestionType.WHEN]: IntentStage.INFORMATIONAL,
    [QuestionType.WHERE]: IntentStage.TRANSACTIONAL,
    [QuestionType.WHO]: IntentStage.TRUST_DRIVEN,
    [QuestionType.CAN]: IntentStage.PROBLEM_SOLUTION,
    [QuestionType.WHICH]: IntentStage.COMPARATIVE,
    [QuestionType.WILL]: IntentStage.INFORMATIONAL,
    [QuestionType.IS]: IntentStage.INFORMATIONAL,
    [QuestionType.COMPARISON]: IntentStage.COMPARATIVE,
    [QuestionType.PREPOSITION]: IntentStage.TRANSACTIONAL,
  };

  async generateQuestions(keyword: string): Promise<QuestionCluster[]> {
    const clusters: QuestionCluster[] = [];
    const normalizedKeyword = keyword.toLowerCase().trim();

    // Generate questions for all types in parallel
    const questionPromises = Object.entries(this.questionPrefixes).map(async ([type, prefixes]) => {
      const questions = await this.generateQuestionsForType(
        normalizedKeyword,
        type as QuestionType,
        prefixes,
      );

      if (questions.length > 0) {
        return {
          type: type as QuestionType,
          questions,
          totalVolume: questions.reduce((sum, q) => sum + (q.searchVolume || 0), 0),
          avgPriority: questions.reduce((sum, q) => sum + q.priority, 0) / questions.length,
        };
      }
      return null;
    });

    const results = await Promise.all(questionPromises);
    const validClusters = results.filter((c): c is QuestionCluster => c !== null);

    return validClusters.sort((a, b) => b.avgPriority - a.avgPriority);
  }

  private async generateQuestionsForType(
    keyword: string,
    type: QuestionType,
    prefixes: string[],
  ): Promise<UserQuestion[]> {
    const baseIntent = this.intentMappings[type];

    try {
      // Try AI generation first
      const aiQuestions = await this.contentGenerator.generateQuestions(keyword, type, { count: 8 });

      // Map AI questions to our format
      return aiQuestions.map(q => ({
        question: q.question,
        type,
        searchVolume: q.searchVolume,
        intent: this.refineIntent(q.question, baseIntent),
        priority: this.calculatePriority(type, q.searchVolume, baseIntent),
      }));
    } catch (error) {
      this.logger.warn(`AI question generation failed for ${type}, using fallback: ${error.message}`);

      // Fallback to static patterns
      const patterns = this.getQuestionPatterns(keyword, type, prefixes);
      const questions: UserQuestion[] = [];

      for (const pattern of patterns) {
        const volume = this.estimateSearchVolume(pattern, keyword);
        const priority = this.calculatePriority(type, volume, baseIntent);

        questions.push({
          question: pattern,
          type,
          searchVolume: volume,
          intent: this.refineIntent(pattern, baseIntent),
          priority,
        });
      }

      return questions.sort((a, b) => b.priority - a.priority).slice(0, 8);
    }
  }

  private getQuestionPatterns(
    keyword: string,
    type: QuestionType,
    prefixes: string[],
  ): string[] {
    const patterns: string[] = [];
    const words = keyword.split(' ');
    const isNoun = !keyword.includes(' ') || words.length <= 2;

    switch (type) {
      case QuestionType.WHAT:
        patterns.push(
          `what is ${keyword}`,
          `what are the benefits of ${keyword}`,
          `what does ${keyword} mean`,
          `what is the best ${keyword}`,
          `what are ${keyword} examples`,
          `what makes a good ${keyword}`,
        );
        break;

      case QuestionType.WHY:
        patterns.push(
          `why is ${keyword} important`,
          `why use ${keyword}`,
          `why should I invest in ${keyword}`,
          `why does ${keyword} matter`,
          `why do companies need ${keyword}`,
        );
        break;

      case QuestionType.HOW:
        patterns.push(
          `how to ${isNoun ? `use ${keyword}` : keyword}`,
          `how to choose ${keyword}`,
          `how does ${keyword} work`,
          `how to improve ${keyword}`,
          `how to get started with ${keyword}`,
          `how much does ${keyword} cost`,
          `how to measure ${keyword} success`,
        );
        break;

      case QuestionType.WHEN:
        patterns.push(
          `when to use ${keyword}`,
          `when should I ${isNoun ? `invest in ${keyword}` : keyword}`,
          `when is ${keyword} needed`,
          `when to upgrade ${keyword}`,
        );
        break;

      case QuestionType.WHERE:
        patterns.push(
          `where to find ${keyword}`,
          `where to buy ${keyword}`,
          `where to learn ${keyword}`,
          `where to get ${keyword}`,
        );
        break;

      case QuestionType.WHO:
        patterns.push(
          `who uses ${keyword}`,
          `who needs ${keyword}`,
          `who should use ${keyword}`,
          `who are the best ${keyword} providers`,
          `who invented ${keyword}`,
        );
        break;

      case QuestionType.CAN:
        patterns.push(
          `can ${keyword} be automated`,
          `can I do ${keyword} myself`,
          `can ${keyword} save money`,
          `can ${keyword} improve performance`,
        );
        break;

      case QuestionType.WHICH:
        patterns.push(
          `which ${keyword} is best`,
          `which ${keyword} should I choose`,
          `which ${keyword} for beginners`,
          `which ${keyword} for enterprise`,
        );
        break;

      case QuestionType.WILL:
        patterns.push(
          `will ${keyword} help my business`,
          `will ${keyword} work for me`,
          `will ${keyword} improve ROI`,
        );
        break;

      case QuestionType.IS:
        patterns.push(
          `is ${keyword} worth it`,
          `is ${keyword} free`,
          `is ${keyword} easy to use`,
          `is ${keyword} secure`,
          `is ${keyword} better than alternatives`,
        );
        break;

      case QuestionType.COMPARISON:
        patterns.push(
          `${keyword} vs competitors`,
          `${keyword} vs traditional methods`,
          `${keyword} alternatives`,
          `best ${keyword} compared`,
          `${keyword} pros and cons`,
        );
        break;

      case QuestionType.PREPOSITION:
        patterns.push(
          `${keyword} for small business`,
          `${keyword} for beginners`,
          `${keyword} for enterprise`,
          `${keyword} with integrations`,
          `${keyword} near me`,
          `tools for ${keyword}`,
        );
        break;
    }

    return patterns;
  }

  private estimateSearchVolume(question: string, keyword: string): number {
    // Simulate search volume estimation based on question characteristics
    const baseVolume = 100 + Math.random() * 900;
    const wordCount = question.split(' ').length;

    // Shorter questions typically have higher volume
    const lengthMultiplier = Math.max(0.3, 1 - (wordCount - 4) * 0.1);

    // Common question types get higher volume
    const commonPhrases = ['how to', 'what is', 'best', 'vs'];
    const isCommon = commonPhrases.some(phrase => question.includes(phrase));
    const commonMultiplier = isCommon ? 1.5 : 1;

    return Math.round(baseVolume * lengthMultiplier * commonMultiplier);
  }

  private calculatePriority(
    type: QuestionType,
    volume: number,
    intent: IntentStage,
  ): number {
    let priority = 50;

    // Volume impact (0-30 points)
    priority += Math.min(30, volume / 50);

    // Intent impact (0-20 points)
    const intentScores: Record<IntentStage, number> = {
      [IntentStage.TRANSACTIONAL]: 20,
      [IntentStage.COMPARATIVE]: 18,
      [IntentStage.PROBLEM_SOLUTION]: 15,
      [IntentStage.TRUST_DRIVEN]: 12,
      [IntentStage.INFORMATIONAL]: 10,
    };
    priority += intentScores[intent] || 10;

    return Math.min(100, Math.round(priority));
  }

  private refineIntent(question: string, baseIntent: IntentStage): IntentStage {
    const lowerQuestion = question.toLowerCase();

    // Override based on specific patterns
    if (lowerQuestion.includes('buy') || lowerQuestion.includes('price') || lowerQuestion.includes('cost')) {
      return IntentStage.TRANSACTIONAL;
    }
    if (lowerQuestion.includes('vs') || lowerQuestion.includes('compare') || lowerQuestion.includes('better')) {
      return IntentStage.COMPARATIVE;
    }
    if (lowerQuestion.includes('review') || lowerQuestion.includes('trust') || lowerQuestion.includes('reliable')) {
      return IntentStage.TRUST_DRIVEN;
    }
    if (lowerQuestion.includes('how to') || lowerQuestion.includes('fix') || lowerQuestion.includes('solve')) {
      return IntentStage.PROBLEM_SOLUTION;
    }

    return baseIntent;
  }
}
