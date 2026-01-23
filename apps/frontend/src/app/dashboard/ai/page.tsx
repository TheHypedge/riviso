'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Send, Sparkles, Database, TrendingUp, Info, CheckCircle2, AlertCircle } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  confidence?: number;
  reasoning?: string;
  dataUsed?: Array<{
    source: string;
    type: string;
    summary: string;
  }>;
  suggestions?: string[];
  metadata?: {
    processingTime?: number;
  };
}

const mockMessages: Message[] = [
  {
    id: 1,
    role: 'assistant',
    content: 'Hello! I\'m your AI assistant for growth intelligence. I can help you analyze your SEO data, keywords, competitors, and conversion metrics. What would you like to know?',
  },
];

const suggestions = [
  'Why did my traffic drop?',
  'Which pages have low CTR?',
  'Which competitors outrank us?',
  'What are my biggest SEO issues?',
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: input,
    };

    setMessages([...messages, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    // Simulate AI response with delay
    setTimeout(() => {
      const aiMessage = generateMockResponse(currentInput, messages.length + 2);
      setMessages((prev) => [...prev, aiMessage]);
      setLoading(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
          <p className="mt-1 text-gray-600">Ask questions about your data in natural language</p>
        </div>

        {/* Chat Interface */}
        <div className="card">
          <div className="flex flex-col h-[700px]">
            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id}>
                    {/* Message Bubble */}
                    <div
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-600">AI Assistant</span>
                            {message.confidence && (
                              <span className="ml-auto text-xs font-medium text-gray-500">
                                {(message.confidence * 100).toFixed(0)}% confident
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                    </div>

                    {/* Confidence & Data Sources (Assistant messages only) */}
                    {message.role === 'assistant' && message.confidence && (
                      <div className="mt-3 max-w-[85%] space-y-2">
                        {/* Confidence Bar */}
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <TrendingUp className="w-3 h-3" />
                          <span>Confidence: {(message.confidence * 100).toFixed(0)}%</span>
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                message.confidence >= 0.8 ? 'bg-green-500' :
                                message.confidence >= 0.6 ? 'bg-yellow-500' :
                                'bg-orange-500'
                              }`}
                              style={{ width: `${message.confidence * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Reasoning */}
                        {message.reasoning && (
                          <details className="text-xs bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <summary className="cursor-pointer font-medium text-blue-800 flex items-center gap-2">
                              <Info className="w-3 h-3" />
                              How I reached this conclusion
                            </summary>
                            <p className="mt-2 text-blue-700">{message.reasoning}</p>
                          </details>
                        )}

                        {/* Data Sources */}
                        {message.dataUsed && message.dataUsed.length > 0 && (
                          <details className="text-xs bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <summary className="cursor-pointer font-medium text-gray-800 flex items-center gap-2">
                              <Database className="w-3 h-3" />
                              Data sources used ({message.dataUsed.length})
                            </summary>
                            <div className="mt-2 space-y-1">
                              {message.dataUsed.map((data, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-gray-700">
                                  <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium">{data.source}</span>
                                    <span className="text-gray-500"> — {data.summary}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}

                        {/* Suggestions */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {message.suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-full hover:bg-gray-50 text-gray-700 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-lg p-4 bg-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="spinner spinner-sm text-blue-600" />
                        <span className="text-sm text-gray-600">Analyzing your data...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Suggestions (initial state) */}
            {messages.length === 1 && !loading && (
              <div className="px-6 pb-4 border-t border-gray-200 pt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Try asking:</div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="btn btn-sm btn-ghost"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about your data..."
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="btn btn-primary"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function generateMockResponse(query: string, messageId: number): Message {
  const lowerQuery = query.toLowerCase();

  // Traffic drop analysis
  if (lowerQuery.includes('traffic') && (lowerQuery.includes('drop') || lowerQuery.includes('decrease') || lowerQuery.includes('down'))) {
    return {
      id: messageId,
      role: 'assistant',
      content: `Based on my analysis of your analytics data, I've identified a significant traffic drop of **27.5%** that occurred around **January 15, 2024**.

**Main Contributing Factors:**

1. **Keyword Ranking Declines** (High Impact)
   - 2 keywords lost rankings around the same time
   - Average rank loss: 3.5 positions
   - Top affected: "seo tools" (Rank 3 → 7)

2. **Technical Performance Issues** (Medium Impact)
   - Core Web Vitals degraded
   - LCP increased to 4.2s

3. **Potential Algorithm Update** (Uncertain)
   - The timing suggests a possible Google algorithm update
   - Check Google's official announcements for Jan 15, 2024

**Recommended Actions:**
1. Focus on recovering rankings for your top keywords
2. Address the technical performance issues immediately
3. Analyze your top competitors' recent content changes
4. Review any site changes or deployments made before Jan 15`,
      confidence: 0.92,
      reasoning: 'I analyzed 4 days of traffic data, 2 keyword rankings, and 2 SEO audits. The correlation between the traffic drop date (2024-01-15) and keyword ranking losses strongly suggests a ranking-related cause. My confidence is 92% based on the strength of this correlation and the completeness of the data.',
      dataUsed: [
        {
          source: 'Google Analytics - Traffic Trend',
          type: 'analytics',
          summary: 'Analyzed 4 days of traffic data',
        },
        {
          source: 'SEO Audit - Recent Changes',
          type: 'seo',
          summary: 'Reviewed 2 SEO audit results',
        },
        {
          source: 'Keyword Rankings - Changes',
          type: 'keywords',
          summary: 'Examined 2 keyword rankings',
        },
      ],
      suggestions: [
        'Show me which pages lost the most traffic',
        'What did my competitors do differently?',
        'How can I recover these keyword rankings?',
      ],
    };
  }

  // Low CTR analysis
  if (lowerQuery.includes('ctr') || (lowerQuery.includes('click') && lowerQuery.includes('low'))) {
    return {
      id: messageId,
      role: 'assistant',
      content: `I've analyzed your Search Console data and identified **3 pages** with below-average click-through rates (under 2%).

**Pages Requiring Attention:**

1. **/pricing**
   - CTR: 1.41% (1.48% avg)
   - Impressions: 8,500
   - Current Position: 5.2
   - Opportunity: 5 additional clicks/month

2. **/features**
   - CTR: 1.53% (1.48% avg)
   - Impressions: 6,200
   - Current Position: 6.8
   - Opportunity: 3 additional clicks/month

3. **/blog/seo-guide**
   - CTR: 1.50% (1.48% avg)
   - Impressions: 12,000
   - Current Position: 4.1
   - Opportunity: -2 additional clicks/month

**Root Causes Identified:**

• Missing meta descriptions on 2 pages
• Title tags too short (< 30 chars) on 1 page

**Recommended Optimizations:**

1. **Write Compelling Meta Descriptions** (High Priority)
   - Include primary keyword naturally
   - Add a clear call-to-action
   - Keep between 150-160 characters

2. **Optimize Title Tags** (High Priority)
   - Use power words (Free, Guide, Best, 2024)
   - Include numbers when relevant
   - Keep between 50-60 characters

**Projected Impact:**
If you optimize these 3 pages to reach the average CTR of 1.48%, you could gain approximately **6 additional clicks per month**.`,
      confidence: 0.89,
      reasoning: 'I analyzed 3 pages with CTR data from Search Console and cross-referenced with metadata quality. The strong correlation between missing/poor meta descriptions and low CTR (2/3 pages affected) gives me 89% confidence in these recommendations.',
      dataUsed: [
        {
          source: 'Search Console - CTR by Page',
          type: 'seo',
          summary: 'Analyzed CTR data for 3 pages',
        },
        {
          source: 'Page Metadata - Titles & Descriptions',
          type: 'seo',
          summary: 'Checked metadata quality for 2 pages',
        },
      ],
      suggestions: [
        'Write meta descriptions for my top pages',
        'Show me examples of high-CTR titles',
        'What structured data should I add?',
      ],
    };
  }

  // Competitor ranking analysis
  if (lowerQuery.includes('competitor') && (lowerQuery.includes('outrank') || lowerQuery.includes('rank'))) {
    return {
      id: messageId,
      role: 'assistant',
      content: `I've analyzed **3 keywords** where competitors outrank you. Here's what I found:

**Competitive Landscape:**

Your main competitor is **ahrefs.com** with:
- Domain Authority: 92 (vs. your 58)
- Total Keywords: 42,000 (vs. your 150)
- Common Keywords: 420

**Authority Gap:** 34 points — This is a significant but closeable gap.

**Keywords Where You're Being Outranked:**

1. **"seo tools"**
   - ahrefs.com: #1
   - Your site: #7
   - Gap: 6 positions

2. **"keyword research"**
   - semrush.com: #2
   - Your site: #8
   - Gap: 6 positions

3. **"competitor analysis"**
   - moz.com: #4
   - Your site: #12
   - Gap: 8 positions

**High-Opportunity Content Gaps:**

These are keywords your competitors rank for, but you don't:

1. **"backlink analysis"** (5,400 searches/mo)
   - Ranking: ahrefs.com, semrush.com, moz.com
   - Difficulty: 68/100
   - Recommendation: Build authority first

2. **"seo reporting"** (3,200 searches/mo)
   - Ranking: semrush.com, moz.com
   - Difficulty: 52/100
   - Recommendation: Target this (Low-Medium difficulty)

**Strategic Recommendations:**

1. **Quick Wins** (Focus here first)
   - Target keywords where you rank #6-15 (easiest to improve)
   - Create comprehensive content for gaps with difficulty < 60

2. **Build Authority** (Medium-term)
   - Earn quality backlinks from industry sites
   - Create linkable assets (guides, tools, research)

**Reality Check:**
The average ranking gap is 6.7 positions. Closing this gap will take 3-6 months of consistent effort, but the 2 content gap opportunities offer quicker wins.`,
      confidence: 0.95,
      reasoning: 'I analyzed 3 direct keyword comparisons, 3 competitor profiles, and 2 content gap opportunities. The data shows a clear authority gap (34 points) which explains most of the ranking differences. My confidence is 95% based on comprehensive competitor data.',
      dataUsed: [
        {
          source: 'Competitor Rankings - Comparison',
          type: 'competitors',
          summary: 'Compared 3 competitor data points',
        },
        {
          source: 'Competitor Analysis - Domain Authority',
          type: 'competitors',
          summary: 'Compared 3 competitor data points',
        },
        {
          source: 'Content Gap Analysis',
          type: 'keywords',
          summary: 'Examined 2 keyword rankings',
        },
      ],
      suggestions: [
        'Show me the full content gap analysis',
        'What backlinks do my competitors have?',
        'Which keywords should I prioritize?',
      ],
    };
  }

  // General query
  return {
    id: messageId,
    role: 'assistant',
    content: `I'm here to help you analyze your SEO, keywords, competitors, and conversion data. 

I can answer questions like:
• "Why did my traffic drop?"
• "Which pages have low click-through rates?"
• "Which competitors outrank me?"
• "What are my top performing keywords?"
• "What are my biggest SEO issues?"

Try asking one of these specific questions, and I'll provide detailed insights based on your actual data!`,
    confidence: 0.6,
    suggestions: [
      'Why did my traffic drop?',
      'Which pages have low CTR?',
      'Which competitors outrank us?',
    ],
  };
}
