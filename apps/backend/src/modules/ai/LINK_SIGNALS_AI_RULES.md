# AI Rules for Link Signals Analysis

## Overview

When the AI system discusses link signals (formerly Off-Page SEO), it must follow strict rules to ensure accuracy and trust. The AI must never reference metrics that don't exist or can't be verified.

## Core Rules

### ❌ NEVER Reference These Metrics

The AI must **never** mention or reference:
- Domain Authority (DA)
- Trust Score
- Spam Score
- Toxicity %
- Competitive Authority Index
- Brand Authority Score
- Link Growth Velocity
- Most advanced metrics (see `/docs/metric-availability.md`)

### ✅ ALWAYS Reference These Metrics

The AI should focus on:
- Detected Referring Domains (verified)
- Detected Backlinks (verified)
- Follow vs Nofollow Ratio (verified)
- Link Hygiene Score (verified)
- Anchor Text Analysis (estimated, limited scope)

## Response Patterns

### ❌ Bad Response

> "Your Domain Authority is low at 20. You need to build more high-authority backlinks to improve your rankings."

**Why it's bad:**
- References DA (doesn't exist in our system)
- Makes assumptions about rankings
- No actionable guidance

### ✅ Good Response

> "Limited link coverage detected - only 2 referring domains found in whole-site crawl. This suggests you may have more backlinks that weren't discovered. To improve:
> 
> 1. **Add referrer URLs**: Export from Google Search Console and submit via the Link Signals interface
> 2. **Focus on editorial links**: Acquire links from topical, authoritative sources
> 3. **Monitor link hygiene**: Ensure follow ratio stays above 20% and fix any broken outbound links
> 
> Note: This analysis is based on Riviso's whole-site crawl. All metrics are verified and computed by Riviso - no external tools needed."

**Why it's good:**
- References only verified metrics
- Provides actionable steps
- Explains limitations
- Sets proper expectations

## Integration Points

### When User Asks About Backlinks

1. **Check available data**: Look for `offPageSeo` or `linkSignals` in context
2. **Reference only verified metrics**: Referring domains, backlinks, follow ratio
3. **Explain limitations**: Mention crawl scope and data coverage
4. **Provide actionable steps**: Focus on what can be done with available data

### When User Asks About Authority

1. **Never mention DA**: Instead, reference "link coverage" or "referring domains"
2. **Focus on what matters**: Editorial links, topical relevance, link quality
3. **Explain the gap**: "We don't have global backlink index data, but we can analyze what we've discovered"

### When User Asks About Link Quality

1. **Reference Link Hygiene Score**: This is the only verified quality metric
2. **Explain factors**: Follow ratio, broken links, redirects, HTTP/HTTPS
3. **Provide specific actions**: Fix broken links, improve follow ratio, etc.

## Example Prompts & Responses

### User: "What's my domain authority?"

**Response:**
> "Riviso doesn't use Domain Authority scores. Instead, we provide verified link signals from our whole-site crawl:
> 
> - **Detected Referring Domains**: 5 domains linking to you (from whole-site crawl)
> - **Detected Backlinks**: 12 total links discovered
> - **Link Hygiene Score**: 75/100 (based on verifiable link issues)
> 
> To get a more complete picture, add referrer URLs from Google Search Console. This will help Riviso discover more backlinks and give you better insights into your link profile."

### User: "How do I improve my backlinks?"

**Response:**
> "Based on Riviso's whole-site crawl analysis:
> 
> **Current Status:**
> - 2 referring domains detected (from whole-site crawl)
> - 8 backlinks found across your site
> - 62% follow ratio (good)
> 
> **Recommended Actions:**
> 1. **Discover more backlinks**: Export referrer URLs from Google Search Console and add them to Riviso's analysis
> 2. **Acquire editorial links**: Focus on getting links from topical, authoritative sources in your industry
> 3. **Improve link hygiene**: Your follow ratio is good, but monitor for broken outbound links
> 4. **Run regular whole-site crawls**: Riviso will discover new backlinks as your site grows
> 
> **Note**: This analysis is based on Riviso's whole-site crawl. All metrics are verified and computed by Riviso - no external tools needed."

### User: "Why is my link score low?"

**Response:**
> "Your Link Hygiene Score is 45/100. Here's what's affecting it:
> 
> **Issues Found:**
> - Follow ratio is 8% (very low - target 20-80%)
> - This suggests most of your detected links are nofollow
> 
> **What This Means:**
> - Nofollow links don't pass link equity
> - You need more editorial, dofollow links
> 
> **How to Improve:**
> 1. Focus on acquiring links from editorial sources (not paid/sponsored)
> 2. Build relationships with industry publications
> 3. Create linkable assets (research, tools, guides)
> 
> **Data Coverage**: This analysis is based on 15 backlinks found in crawl. Add referrer URLs to discover more links."

## System Prompt Addition

When building system prompts for link signals queries, include:

```
LINK SIGNALS RULES:
- Only reference verified metrics: Referring Domains, Backlinks, Follow Ratio, Link Hygiene Score
- Never mention: Domain Authority, Trust Score, Spam Score, or any removed metrics
- Always explain data limitations and crawl scope
- Focus on actionable insights based on available data
- Reference /docs/metric-availability.md for metric details
```

## Testing

Test AI responses with these queries:
1. "What's my domain authority?" → Should NOT mention DA
2. "How many backlinks do I have?" → Should reference detected backlinks only
3. "Is my link profile good?" → Should reference Link Hygiene Score and verified metrics
4. "How do I improve my backlinks?" → Should provide actionable steps without fake metrics

## Related Documentation

- `/docs/off-page-engine.md` - Engine capabilities and limitations
- `/docs/metric-availability.md` - Complete metric classification
- `/docs/architecture.md` - System architecture
