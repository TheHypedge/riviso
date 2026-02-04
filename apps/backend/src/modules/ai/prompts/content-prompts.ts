/**
 * AI Prompts for Dynamic Content Generation
 *
 * These prompts are used by the ContentGeneratorService to generate
 * natural, contextual content across CRO and Keyword Intelligence modules.
 */

export const PERSONA_GENERATION_PROMPT = `
You are an expert in buyer persona development and customer psychology.

Given the following website data:
- Industry: {{industry}}
- Business Model: {{businessModel}}
- Sample Content: {{content}}

Generate a detailed buyer persona in JSON format:
{
  "name": "Descriptive persona name (e.g., 'Enterprise Marketing Director', 'Budget-Conscious Homeowner')",
  "description": "2-3 sentence description of who they are and what they want",
  "demographics": {
    "ageRange": "age range (e.g., '35-50')",
    "incomeLevel": "low|medium|high|premium"
  },
  "goals": ["specific goal 1", "specific goal 2", "specific goal 3"],
  "painPoints": ["specific pain point 1", "specific pain point 2", "specific pain point 3"],
  "objections": ["common objection 1", "common objection 2"],
  "decisionFactors": ["factor 1", "factor 2", "factor 3"],
  "preferredChannels": ["channel 1", "channel 2"],
  "contentPreferences": ["preference 1", "preference 2"],
  "buyingBehavior": {
    "decisionSpeed": "impulsive|considered|extended",
    "priceSensitivity": "low|medium|high",
    "researchDepth": "minimal|moderate|extensive"
  }
}

Be specific, actionable, and data-driven. Avoid generic descriptions.
IMPORTANT: Return ONLY valid JSON, no additional text or explanation.
`;

export const BEHAVIORAL_TRIGGERS_PROMPT = `
You are a conversion rate optimization expert specializing in psychological triggers.

Given:
- Industry: {{industry}}
- Business Model: {{businessModel}}
- Current CTAs: {{currentCtas}}

Generate 6 behavioral triggers that would be most effective for this business in JSON format:
[
  {
    "name": "Trigger name",
    "description": "Clear description of what this trigger is",
    "effectiveness": 70-95,
    "implementation": "Specific implementation recommendation",
    "example": "Concrete example for this industry"
  }
]

Focus on triggers that are:
1. Highly relevant to the specific industry
2. Backed by conversion psychology research
3. Practical to implement
4. Measurably effective

IMPORTANT: Return ONLY valid JSON array, no additional text.
`;

export const COPY_IMPROVEMENT_PROMPT = `
You are a professional copywriter specializing in conversion-focused content.

Current copy:
Headline: {{currentHeadline}}
Description: {{currentDescription}}

Context:
- Industry: {{industry}}
- Business Model: {{businessModel}}
- Target Audience: {{targetAudience}}

Provide 3 specific copy improvements in JSON format:
{
  "headline": {
    "current": "current headline",
    "improved": "improved headline with clear value proposition",
    "reasoning": "Why this improvement works better"
  },
  "description": {
    "current": "current description",
    "improved": "improved description that's clearer and more persuasive",
    "reasoning": "Why this improvement works better"
  },
  "cta": {
    "suggestion": "Recommended call-to-action text",
    "reasoning": "Why this CTA is effective for this audience"
  }
}

Focus on:
- Clear value propositions
- Benefit-driven language
- Emotional resonance
- Action-oriented phrasing

IMPORTANT: Return ONLY valid JSON, no additional text.
`;

export const QUESTION_GENERATION_PROMPT = `
You are an SEO and search behavior expert.

Generate 8 natural, realistic user questions for the keyword "{{keyword}}" of type {{questionType}}.

Requirements:
- Questions should sound like actual Google searches
- Vary in specificity and length (short to long-tail)
- Include questions users would actually type
- Focus on user intent, not technical jargon
- Use natural, grammatically correct English

Return as JSON array:
[
  {
    "question": "the actual question exactly as a user would type it",
    "searchVolume": estimated_monthly_volume_as_number,
    "difficulty": "easy|medium|hard"
  }
]

Question Type Guidelines:
- WHAT: Definitional, explanatory questions
- WHY: Reasoning, motivation questions
- HOW: Process, tutorial questions
- WHEN: Timing, scheduling questions
- WHERE: Location, source questions
- WHO: People, authority questions
- CAN: Capability, possibility questions
- WHICH: Selection, comparison questions
- WILL: Future, prediction questions
- IS: Validation, confirmation questions
- COMPARISON: Versus, alternatives questions
- PREPOSITION: Contextual, situational questions

IMPORTANT: Return ONLY valid JSON array, no additional text.
`;

export const CONTENT_BRIEF_TITLE_PROMPT = `
You are an SEO content strategist specializing in high-performing titles.

Create a compelling content title for:
- Keyword: {{keyword}}
- Intent: {{intent}}
- Angle: {{angle}}
- Year: {{year}}

Requirements:
- Under 60 characters (for SEO)
- Include primary keyword naturally
- Create curiosity or promise value
- Match user intent ({{intent}})
- Professional and credible tone

Intent-specific guidelines:
- INFORMATIONAL: Educational, comprehensive, authoritative
- COMPARATIVE: Comparison-focused, objective, data-driven
- TRANSACTIONAL: Action-focused, value-driven, clear benefit
- PROBLEM_SOLUTION: Solution-oriented, practical, step-by-step
- TRUST_DRIVEN: Credible, evidence-based, trustworthy

Return as JSON:
{
  "title": "The optimized title",
  "reasoning": "Why this title is effective"
}

IMPORTANT: Return ONLY valid JSON, no additional text.
`;

export const CONTENT_OUTLINE_PROMPT = `
You are a content strategist creating detailed article outlines.

Create a comprehensive content outline for:
- Keyword: {{keyword}}
- Intent: {{intent}}
- Target Word Count: {{targetWordCount}}

Generate an outline with 5-7 main sections, each with 3-4 key points in JSON format:
{
  "introduction": {
    "heading": "Introduction heading",
    "keyPoints": ["point 1", "point 2", "point 3"]
  },
  "sections": [
    {
      "heading": "Section heading (H2)",
      "keyPoints": ["specific point 1", "specific point 2", "specific point 3"],
      "subsections": [
        {
          "heading": "Subsection heading (H3)",
          "keyPoints": ["point 1", "point 2"]
        }
      ]
    }
  ],
  "conclusion": {
    "heading": "Conclusion heading",
    "keyPoints": ["key takeaway 1", "key takeaway 2", "CTA"]
  }
}

Requirements:
- Logical flow from introduction to conclusion
- Cover all aspects of the keyword topic
- Include actionable, specific points
- Match user intent
- SEO-friendly heading structure

IMPORTANT: Return ONLY valid JSON, no additional text.
`;

export const FAQ_GENERATION_PROMPT = `
You are an SEO and content expert specializing in FAQ schema.

Generate {{count}} FAQ items for the topic "{{topic}}" in JSON format:
[
  {
    "question": "Clear, natural question users would ask",
    "answer": "Comprehensive, helpful answer (2-3 sentences, 150-250 words)",
    "category": "Category this FAQ belongs to"
  }
]

Requirements:
- Questions should be natural and conversational
- Answers should be informative and complete
- Use grammatically correct English
- Include relevant keywords naturally
- Provide actual value, not generic fluff
- Each answer should be substantive (150-250 words)

IMPORTANT: Return ONLY valid JSON array, no additional text.
`;

export const TOPIC_CLUSTER_PROMPT = `
You are a content strategist specializing in topic clustering and semantic SEO.

Generate related topic clusters for the pillar keyword "{{pillarKeyword}}":

Return as JSON:
{
  "synonyms": ["synonym 1", "synonym 2", "synonym 3"],
  "subtopics": ["related subtopic 1", "related subtopic 2", "related subtopic 3"],
  "relatedConcepts": ["concept 1", "concept 2", "concept 3"],
  "longTail": ["long-tail variation 1", "long-tail variation 2", "long-tail variation 3"],
  "contentSuggestions": [
    {
      "title": "Content piece title",
      "type": "blog_post|guide|tutorial|comparison|case_study",
      "targetKeywords": ["keyword 1", "keyword 2"]
    }
  ]
}

Focus on:
- Semantically related terms
- User intent variations
- Content gap opportunities
- Practical, implementable ideas

IMPORTANT: Return ONLY valid JSON, no additional text.
`;

/**
 * Helper function to replace template variables in prompts
 */
export function fillPromptTemplate(template: string, variables: Record<string, any>): string {
  let filledTemplate = template;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    filledTemplate = filledTemplate.replace(placeholder, String(value));
  }

  return filledTemplate;
}

/**
 * Helper function to parse JSON responses from AI
 */
export function parseAiJsonResponse<T>(response: string): T {
  try {
    // Remove markdown code blocks if present
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error(`Failed to parse AI JSON response: ${error.message}\nResponse: ${response}`);
  }
}
