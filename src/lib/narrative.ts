import { generateCompletion } from './llm';
import type { Template, Asset } from '@/types';

// Article Group voice guidelines
const VOICE_GUIDE = `You write in the voice of an Article Group strategist. Your tone is:

- **Smart but not academic** - You understand complex technology but explain it simply
- **Empathetic** - You understand the pressures and challenges your clients face
- **Confident but not arrogant** - You know your craft but stay curious
- **Concise** - Every word earns its place. No fluff, no jargon for jargon's sake
- **Strategic** - You think in narratives and frameworks, not just deliverables

You never:
- Use buzzwords without substance
- Sound like generic marketing copy
- Oversell or make hollow promises
- Talk down to the reader

You always:
- Connect the work to real business outcomes
- Acknowledge the complexity of the challenge
- Show (don't tell) expertise through specificity
- Leave the reader feeling understood`;

const NARRATIVE_PROMPT = `${VOICE_GUIDE}

You are generating the "Strategic Bridge" - an introductory narrative that connects a visitor's challenge to Article Group's relevant work. This narrative appears at the top of a personalized portfolio presentation.

The narrative should:
1. Acknowledge the specific challenge the visitor described
2. Briefly frame how Article Group typically approaches this type of problem
3. Set up the case studies and content that will follow
4. Be 2-4 sentences maximum
5. Feel like a senior strategist speaking directly to a potential client

Do NOT:
- List capabilities or services
- Make generic claims ("we're the best at...")
- Promise specific outcomes
- Mention the visitor by name or company
- Sound like a sales pitch`;

/**
 * Generate the Strategic Bridge narrative
 */
export async function generateNarrative(
  query: string,
  template: Template,
  relevantAssets: Asset[]
): Promise<string> {
  const assetContext = relevantAssets
    .slice(0, 3)
    .map(a => `- ${a.title}${a.client ? ` (${a.client})` : ''}: ${a.description || 'No description'}`)
    .join('\n');

  const userPrompt = `Visitor's challenge: "${query}"

Template context: This is a ${template.name.toLowerCase()} inquiry. Layout emphasizes: ${template.layout_type}.

Relevant work we'll be showing:
${assetContext}

Generate the Strategic Bridge narrative (2-4 sentences):`;

  const narrative = await generateCompletion(
    NARRATIVE_PROMPT,
    userPrompt,
    { temperature: 0.7, maxTokens: 300 }
  );

  return narrative.trim();
}

/**
 * Generate a template-specific intro variation
 */
export async function generateTemplateIntro(
  template: Template,
  query: string
): Promise<string> {
  const toneGuidance = template.tone_guidance || 'Use the standard Article Group voice.';
  
  const prompt = `${VOICE_GUIDE}

Additional tone guidance for this template: ${toneGuidance}

Generate a single opening sentence that acknowledges this challenge: "${query}"

The sentence should feel like the start of a conversation with a senior strategist. Keep it under 25 words.`;

  const intro = await generateCompletion(
    prompt,
    'Generate the opening sentence:',
    { temperature: 0.8, maxTokens: 100 }
  );

  return intro.trim();
}

/**
 * Generate asset-specific context (why this case study is relevant)
 */
export async function generateAssetContext(
  asset: Asset,
  query: string
): Promise<string> {
  const prompt = `${VOICE_GUIDE}

Given this visitor challenge: "${query}"

And this case study:
- Title: ${asset.title}
- Client: ${asset.client || 'N/A'}
- Description: ${asset.description || 'No description'}

Write ONE sentence explaining why this work is relevant to their challenge. Be specific, not generic.`;

  const context = await generateCompletion(
    prompt,
    'Generate the relevance statement:',
    { temperature: 0.7, maxTokens: 100 }
  );

  return context.trim();
}
