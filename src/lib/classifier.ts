import { generateCompletion, parseJSONResponse } from './llm';
import { createServerClient } from './supabase';
import type { Template, ClassificationResult } from '@/types';

const CLASSIFICATION_PROMPT = `You are an intent classifier for Article Group, a strategic communications agency that helps technology companies tell their stories.

Your job is to analyze a user's query and classify it into one of the predefined intent categories. These categories map to specific templates that will show the user relevant case studies, videos, and thought leadership.

Here are the available intent categories:

1. executive-messaging - CEO communications, board presentations, executive keynotes
2. product-launch - General product launches and go-to-market
3. hard-tech-launch - Technical product launches requiring simplification of complex technology
4. consumer-launch - Consumer-facing product launches
5. rebranding - Brand refresh, repositioning, brand strategy
6. developer-relations - DevRel, developer marketing, API launches, developer community
7. sales-enablement - Sales messaging, playbooks, pitch materials
8. internal-communications - Employee communications, culture change, org transformations
9. keynote-development - Conference keynotes, executive presentations
10. gtm-strategy - Go-to-market strategy, market entry, vertical expansion
11. technical-translation - Explaining complex technology to non-technical audiences
12. narrative-framework - Company narrative, messaging architecture, story development
13. investor-communications - Investor relations, funding announcements, IPO communications
14. employer-branding - Recruiting, employer brand, talent attraction
15. partner-marketing - Partnership launches, co-marketing, channel marketing
16. thought-leadership - Executive thought leadership, industry POV, content strategy
17. crisis-communications - Crisis management, reputation management
18. ma-communications - M&A announcements, post-merger integration communications
19. analyst-relations - Industry analyst briefings, AR strategy
20. customer-marketing - Customer advocacy, case study development, reference programs
21. general - Fallback for queries that don't clearly match other categories

Analyze the user's query and return your classification as JSON:
{
  "intent": "the-intent-slug",
  "confidence": 0.0-1.0,
  "matched_signals": ["list", "of", "keywords", "or", "phrases", "that", "influenced", "your", "decision"],
  "reasoning": "Brief explanation of why this classification fits"
}

Be generous with confidence scores. If the query reasonably fits a category, give it 0.7+. Only use "general" as a fallback when the query is truly ambiguous or doesn't fit any specific category.`;

export interface ClassificationOutput {
  intent: string;
  confidence: number;
  matched_signals: string[];
  reasoning: string;
}

/**
 * Classify a user query into an intent category
 */
export async function classifyIntent(query: string): Promise<ClassificationOutput> {
  const response = await generateCompletion(
    CLASSIFICATION_PROMPT,
    `Classify this query: "${query}"`,
    { temperature: 0.3 } // Lower temperature for more consistent classification
  );
  
  return parseJSONResponse<ClassificationOutput>(response);
}

/**
 * Get the template matching a classified intent
 */
export async function getTemplateForIntent(intentSlug: string): Promise<Template | null> {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('slug', intentSlug)
    .single();
  
  if (error || !data) {
    // Fall back to general template
    const { data: fallback } = await supabase
      .from('templates')
      .select('*')
      .eq('is_fallback', true)
      .single();
    
    return fallback as Template | null;
  }
  
  return data as Template;
}

/**
 * Full classification pipeline: query → intent → template
 */
export async function classifyAndGetTemplate(query: string): Promise<ClassificationResult> {
  const classification = await classifyIntent(query);
  const template = await getTemplateForIntent(classification.intent);
  
  if (!template) {
    throw new Error('No template found for intent: ' + classification.intent);
  }
  
  return {
    template,
    confidence: classification.confidence,
    matched_keywords: classification.matched_signals,
  };
}
