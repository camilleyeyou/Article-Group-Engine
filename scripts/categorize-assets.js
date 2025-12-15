#!/usr/bin/env node

/**
 * Categorize Assets by Business Capability
 * 
 * This script analyzes each asset and assigns it to one or more
 * business capabilities based on content analysis.
 * 
 * Usage:
 *   node scripts/categorize-assets.js
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai').default;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Business Capabilities Taxonomy
const CAPABILITIES = {
  // Foundational Strategy
  'narrative-frameworks': {
    name: 'Narrative Frameworks',
    category: 'Foundational Strategy',
    description: 'Crafting the core story that connects the product to the user',
    keywords: ['narrative', 'story', 'storytelling', 'framework', 'three-layer', 'hero journey', 'arc']
  },
  'positioning-messaging': {
    name: 'Positioning & Messaging',
    category: 'Foundational Strategy', 
    description: 'Defining where a product sits in the market and how to talk about it',
    keywords: ['positioning', 'messaging', 'value prop', 'differentiation', 'competitive', 'market position', 'brand voice']
  },
  'gtm-strategy': {
    name: 'GTM Strategy',
    category: 'Foundational Strategy',
    description: 'Planning the launch and sustainment of products',
    keywords: ['go-to-market', 'gtm', 'launch', 'product launch', 'market entry', 'rollout']
  },
  'journey-persona': {
    name: 'Journey Mapping & Personas',
    category: 'Foundational Strategy',
    description: "Understanding the customer's path and mindset",
    keywords: ['journey', 'persona', 'customer', 'empathy map', 'user research', 'audience', 'buyer']
  },

  // Content & Engagement
  'editorial-strategy': {
    name: 'Editorial Strategy',
    category: 'Content & Engagement',
    description: 'Planning content arcs rather than one-off pieces',
    keywords: ['editorial', 'content strategy', 'content calendar', 'content arc', 'blog', 'article']
  },
  'thought-leadership': {
    name: 'Thought Leadership',
    category: 'Content & Engagement',
    description: 'Establishing executive presence and authority in the industry',
    keywords: ['thought leadership', 'executive', 'authority', 'expertise', 'industry voice', 'point of view', 'pov']
  },
  'copywriting': {
    name: 'Copywriting & Scriptwriting',
    category: 'Content & Engagement',
    description: 'High-level creative writing for complex subjects',
    keywords: ['copy', 'script', 'writing', 'headline', 'tagline', 'creative writing']
  },
  'social-strategy': {
    name: 'Social Strategy',
    category: 'Content & Engagement',
    description: 'Campaigns designed for engagement rather than just reach',
    keywords: ['social', 'linkedin', 'twitter', 'engagement', 'community', 'viral']
  },

  // Visual & Design Systems
  'brand-design': {
    name: 'Brand Design',
    category: 'Visual & Design',
    description: 'Creating or refreshing visual identities',
    keywords: ['brand', 'visual identity', 'logo', 'rebrand', 'brand refresh', 'identity system']
  },
  'design-systems': {
    name: 'Design Systems',
    category: 'Visual & Design',
    description: 'Building scalable libraries for internal teams to use',
    keywords: ['design system', 'component library', 'style guide', 'ui kit', 'scalable design']
  },
  'video-production': {
    name: 'Video Production',
    category: 'Visual & Design',
    description: 'End-to-end production including strategy, directing, and motion graphics',
    keywords: ['video', 'production', 'motion', 'animation', 'film', 'documentary', 'explainer']
  },

  // Sales Enablement & Events
  'sales-collateral': {
    name: 'Sales Collateral',
    category: 'Sales Enablement & Events',
    description: 'Decks and one-pagers that actually help close deals',
    keywords: ['sales deck', 'one-pager', 'collateral', 'sales enablement', 'pitch deck', 'proposal']
  },
  'keynote-events': {
    name: 'Keynote & Event Strategy',
    category: 'Sales Enablement & Events',
    description: 'Crafting the main stage narrative for major conferences',
    keywords: ['keynote', 'conference', 'event', 'stage', 'presentation', 'reinvent', 'summit', 'mainstage']
  },
  'partner-marketing': {
    name: 'Partner Marketing',
    category: 'Sales Enablement & Events',
    description: 'Supporting alliance ecosystems and channel partners',
    keywords: ['partner', 'alliance', 'channel', 'ecosystem', 'co-marketing', 'joint']
  }
};

// Content type mapping
const CONTENT_TYPES = {
  'case_study': 'Case Study',
  'article': 'Article/Blog Post',
  'deck': 'Presentation/Deck',
  'video': 'Video',
  'diagram': 'Framework/Diagram',
  'guide': 'Guide/Playbook'
};

async function categorizeWithAI(asset) {
  const prompt = `Analyze this content and categorize it.

TITLE: ${asset.title}
CLIENT: ${asset.client || 'None'}
CURRENT TYPE: ${asset.type}

CONTENT (first 3000 chars):
${(asset.content || '').substring(0, 3000)}

---

Based on this content, determine:

1. PRIMARY_CAPABILITY: Which ONE business capability is this MOST relevant to?
   Options:
   - narrative-frameworks (core storytelling, narrative structure)
   - positioning-messaging (market positioning, value props, messaging)
   - gtm-strategy (product launches, go-to-market)
   - journey-persona (customer journeys, personas, empathy maps)
   - editorial-strategy (content planning, editorial calendars)
   - thought-leadership (executive POV, industry authority)
   - copywriting (creative writing, scripts)
   - social-strategy (social media campaigns)
   - brand-design (visual identity, branding)
   - design-systems (component libraries, style guides)
   - video-production (video content, motion graphics)
   - sales-collateral (sales decks, one-pagers)
   - keynote-events (conference presentations, events)
   - partner-marketing (channel/alliance marketing)

2. SECONDARY_CAPABILITIES: Up to 2 additional relevant capabilities (or "none")

3. CONTENT_TYPE: What type of content is this?
   - case_study (client work example with results)
   - article (blog post, thought piece)
   - guide (how-to, playbook, framework explanation)
   - deck (presentation)
   - video (video content)
   - diagram (visual framework)

4. IS_CASE_STUDY: Is this specifically a case study showing client work? (true/false)

5. QUALITY_SCORE: Rate 1-5 how valuable this content is for sales/marketing purposes

Respond in this exact JSON format:
{
  "primary_capability": "capability-slug",
  "secondary_capabilities": ["slug1", "slug2"],
  "content_type": "type",
  "is_case_study": true/false,
  "quality_score": 1-5,
  "reasoning": "brief explanation"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error(`  AI categorization failed: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('\n📊 Asset Categorization by Business Capability\n');
  console.log('='.repeat(50));

  // Fetch all assets
  const { data: assets, error } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch assets:', error);
    process.exit(1);
  }

  console.log(`Found ${assets.length} assets to categorize\n`);

  const results = {
    byCapability: {},
    caseStudies: [],
    highQuality: [],
    errors: []
  };

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    console.log(`[${i + 1}/${assets.length}] ${asset.title.substring(0, 50)}...`);

    const categorization = await categorizeWithAI(asset);

    if (!categorization) {
      results.errors.push(asset.title);
      continue;
    }

    console.log(`  → ${categorization.primary_capability} (${categorization.content_type}) Q:${categorization.quality_score}`);

    // Update the asset in database
    const newMetadata = {
      ...(asset.metadata || {}),
      primary_capability: categorization.primary_capability,
      secondary_capabilities: categorization.secondary_capabilities,
      content_type: categorization.content_type,
      is_case_study: categorization.is_case_study,
      quality_score: categorization.quality_score,
      categorized_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('assets')
      .update({ 
        type: categorization.content_type,
        metadata: newMetadata 
      })
      .eq('id', asset.id);

    if (updateError) {
      console.error(`  ❌ Update failed: ${updateError.message}`);
      results.errors.push(asset.title);
    }

    // Track results
    const cap = categorization.primary_capability;
    if (!results.byCapability[cap]) {
      results.byCapability[cap] = [];
    }
    results.byCapability[cap].push({
      id: asset.id,
      title: asset.title,
      client: asset.client,
      quality: categorization.quality_score
    });

    if (categorization.is_case_study) {
      results.caseStudies.push({ id: asset.id, title: asset.title, client: asset.client });
    }

    if (categorization.quality_score >= 4) {
      results.highQuality.push({ id: asset.id, title: asset.title });
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 100));
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('CATEGORIZATION SUMMARY');
  console.log('='.repeat(50));

  console.log('\n📁 By Capability:\n');
  for (const [cap, items] of Object.entries(results.byCapability).sort((a, b) => b[1].length - a[1].length)) {
    const capInfo = CAPABILITIES[cap];
    console.log(`  ${capInfo?.name || cap}: ${items.length} assets`);
  }

  console.log(`\n📋 Case Studies: ${results.caseStudies.length}`);
  results.caseStudies.forEach(cs => {
    console.log(`  - ${cs.title} ${cs.client ? `(${cs.client})` : ''}`);
  });

  console.log(`\n⭐ High Quality (4-5): ${results.highQuality.length}`);

  if (results.errors.length > 0) {
    console.log(`\n❌ Errors: ${results.errors.length}`);
  }

  console.log('\n✅ Done! Assets have been categorized.\n');
}

main().catch(console.error);
