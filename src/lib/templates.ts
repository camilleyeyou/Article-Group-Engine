import type { Template, Asset, LayoutBlock } from '@/types';

/**
 * Core 20 template definitions
 * These define how each intent type should be displayed
 */
export const TEMPLATE_DEFINITIONS: Omit<Template, 'id' | 'created_at'>[] = [
  {
    name: 'Executive Messaging',
    slug: 'executive-messaging',
    description: 'CEO communications, board presentations, executive keynotes',
    layout_type: 'video-first',
    required_content_types: ['video', 'case_study'],
    tone_guidance: 'Speak to the weight of executive communication. Acknowledge that every word matters at this level.',
    is_fallback: false,
  },
  {
    name: 'Product Launch',
    slug: 'product-launch',
    description: 'General product launches and go-to-market',
    layout_type: 'case-study-first',
    required_content_types: ['case_study', 'article'],
    tone_guidance: 'Focus on momentum and market impact. Launch energy without hype.',
    is_fallback: false,
  },
  {
    name: 'Hard Tech Launch',
    slug: 'hard-tech-launch',
    description: 'Technical product launches requiring simplification of complex technology',
    layout_type: 'framework-first',
    required_content_types: ['diagram', 'case_study', 'article'],
    tone_guidance: 'Lead with frameworks and structure. Show how complexity becomes clarity.',
    is_fallback: false,
  },
  {
    name: 'Consumer Launch',
    slug: 'consumer-launch',
    description: 'Consumer-facing product launches',
    layout_type: 'video-first',
    required_content_types: ['video', 'case_study'],
    tone_guidance: 'Emotional resonance matters here. Connect product to human experience.',
    is_fallback: false,
  },
  {
    name: 'Rebranding',
    slug: 'rebranding',
    description: 'Brand refresh, repositioning, brand strategy',
    layout_type: 'case-study-first',
    required_content_types: ['case_study', 'article'],
    tone_guidance: 'Transformation narrative. Before/after, but with strategic depth.',
    is_fallback: false,
  },
  {
    name: 'Developer Relations',
    slug: 'developer-relations',
    description: 'DevRel, developer marketing, API launches, developer community',
    layout_type: 'article-first',
    required_content_types: ['article', 'case_study'],
    tone_guidance: 'Developers detect BS instantly. Be technical, be real, be helpful.',
    is_fallback: false,
  },
  {
    name: 'Sales Enablement',
    slug: 'sales-enablement',
    description: 'Sales messaging, playbooks, pitch materials',
    layout_type: 'framework-first',
    required_content_types: ['deck', 'case_study', 'article'],
    tone_guidance: 'Revenue-focused. Show how narrative becomes pipeline.',
    is_fallback: false,
  },
  {
    name: 'Internal Communications',
    slug: 'internal-communications',
    description: 'Employee communications, culture change, org transformations',
    layout_type: 'case-study-first',
    required_content_types: ['case_study', 'article'],
    tone_guidance: 'Internal audiences are the toughest. Authenticity is non-negotiable.',
    is_fallback: false,
  },
  {
    name: 'Keynote Development',
    slug: 'keynote-development',
    description: 'Conference keynotes, executive presentations',
    layout_type: 'video-first',
    required_content_types: ['video', 'case_study'],
    tone_guidance: 'Stage presence starts on the page. Show how we build memorable moments.',
    is_fallback: false,
  },
  {
    name: 'GTM Strategy',
    slug: 'gtm-strategy',
    description: 'Go-to-market strategy, market entry, vertical expansion',
    layout_type: 'framework-first',
    required_content_types: ['diagram', 'case_study', 'article'],
    tone_guidance: 'Strategic rigor. Marketecture lives here.',
    is_fallback: false,
  },
  {
    name: 'Technical Translation',
    slug: 'technical-translation',
    description: 'Explaining complex technology to non-technical audiences',
    layout_type: 'case-study-first',
    required_content_types: ['case_study', 'video', 'article'],
    tone_guidance: 'This is our superpower. Show the transformation from jargon to clarity.',
    is_fallback: false,
  },
  {
    name: 'Narrative Framework',
    slug: 'narrative-framework',
    description: 'Company narrative, messaging architecture, story development',
    layout_type: 'article-first',
    required_content_types: ['article', 'case_study', 'diagram'],
    tone_guidance: 'Story structure and strategic narrative. The foundation everything else builds on.',
    is_fallback: false,
  },
  {
    name: 'Investor Communications',
    slug: 'investor-communications',
    description: 'Investor relations, funding announcements, IPO communications',
    layout_type: 'framework-first',
    required_content_types: ['case_study', 'deck'],
    tone_guidance: 'Stakes are high. Precision and credibility above all.',
    is_fallback: false,
  },
  {
    name: 'Employer Branding',
    slug: 'employer-branding',
    description: 'Recruiting, employer brand, talent attraction',
    layout_type: 'video-first',
    required_content_types: ['video', 'case_study'],
    tone_guidance: 'Culture is felt, not described. Show authentic employee voice.',
    is_fallback: false,
  },
  {
    name: 'Partner Marketing',
    slug: 'partner-marketing',
    description: 'Partnership launches, co-marketing, channel marketing',
    layout_type: 'case-study-first',
    required_content_types: ['case_study', 'article'],
    tone_guidance: 'Two brands, one story. Show how we navigate joint narratives.',
    is_fallback: false,
  },
  {
    name: 'Thought Leadership',
    slug: 'thought-leadership',
    description: 'Executive thought leadership, industry POV, content strategy',
    layout_type: 'article-first',
    required_content_types: ['article', 'video'],
    tone_guidance: 'Ideas that move industries. Substance over self-promotion.',
    is_fallback: false,
  },
  {
    name: 'Crisis Communications',
    slug: 'crisis-communications',
    description: 'Crisis management, reputation management',
    layout_type: 'framework-first',
    required_content_types: ['case_study', 'article'],
    tone_guidance: 'Calm, prepared, strategic. Show we\'ve navigated high-pressure situations.',
    is_fallback: false,
  },
  {
    name: 'M&A Communications',
    slug: 'ma-communications',
    description: 'M&A announcements, post-merger integration communications',
    layout_type: 'case-study-first',
    required_content_types: ['case_study', 'article'],
    tone_guidance: 'Transformation at scale. Multiple stakeholders, one coherent story.',
    is_fallback: false,
  },
  {
    name: 'Analyst Relations',
    slug: 'analyst-relations',
    description: 'Industry analyst briefings, AR strategy',
    layout_type: 'framework-first',
    required_content_types: ['deck', 'case_study'],
    tone_guidance: 'Analysts want data and differentiation. Strategic positioning.',
    is_fallback: false,
  },
  {
    name: 'Customer Marketing',
    slug: 'customer-marketing',
    description: 'Customer advocacy, case study development, reference programs',
    layout_type: 'case-study-first',
    required_content_types: ['case_study', 'video'],
    tone_guidance: 'Let customers be the heroes. Authentic success stories.',
    is_fallback: false,
  },
  {
    name: 'General Capabilities',
    slug: 'general',
    description: 'Fallback template for queries that don\'t match specific intents',
    layout_type: 'balanced',
    required_content_types: ['case_study', 'video', 'article'],
    tone_guidance: 'Versatile and comprehensive. Show breadth without being generic.',
    is_fallback: true,
  },
];

/**
 * Build the layout blocks for a template
 */
export function buildLayout(
  template: Template,
  assets: Asset[],
  narrative: string
): LayoutBlock[] {
  const layout: LayoutBlock[] = [];
  
  // Always start with the strategic bridge
  layout.push({
    type: 'strategic_bridge',
    content: narrative,
  });
  
  // Build layout based on template type
  switch (template.layout_type) {
    case 'video-first':
      layout.push(...buildVideoFirstLayout(assets));
      break;
    case 'framework-first':
      layout.push(...buildFrameworkFirstLayout(assets));
      break;
    case 'case-study-first':
      layout.push(...buildCaseStudyFirstLayout(assets));
      break;
    case 'article-first':
      layout.push(...buildArticleFirstLayout(assets));
      break;
    case 'balanced':
    default:
      layout.push(...buildBalancedLayout(assets));
      break;
  }
  
  // Always end with CTA
  layout.push({
    type: 'cta',
    props: { variant: 'primary' },
  });
  
  return layout;
}

function buildVideoFirstLayout(assets: Asset[]): LayoutBlock[] {
  const blocks: LayoutBlock[] = [];
  
  // Lead with video
  const video = assets.find(a => a.type === 'video');
  if (video) {
    blocks.push({ type: 'hero_video', asset_id: video.id });
  }
  
  // Case studies grid
  const caseStudies = assets.filter(a => a.type === 'case_study').slice(0, 3);
  if (caseStudies.length > 0) {
    blocks.push({
      type: 'case_study_grid',
      props: { asset_ids: caseStudies.map(a => a.id) },
    });
  }
  
  // Supporting article
  const article = assets.find(a => a.type === 'article');
  if (article) {
    blocks.push({ type: 'thought_leadership', asset_id: article.id });
  }
  
  return blocks;
}

function buildFrameworkFirstLayout(assets: Asset[]): LayoutBlock[] {
  const blocks: LayoutBlock[] = [];
  
  // Lead with diagram/framework
  const diagram = assets.find(a => a.type === 'diagram' || a.type === 'deck');
  if (diagram) {
    blocks.push({ type: 'case_study_card', asset_id: diagram.id }); // Reuse card for diagrams
  }
  
  // Case studies
  const caseStudies = assets.filter(a => a.type === 'case_study').slice(0, 2);
  if (caseStudies.length > 0) {
    blocks.push({
      type: 'case_study_grid',
      props: { asset_ids: caseStudies.map(a => a.id) },
    });
  }
  
  // Article
  const article = assets.find(a => a.type === 'article');
  if (article) {
    blocks.push({ type: 'article_preview', asset_id: article.id });
  }
  
  return blocks;
}

function buildCaseStudyFirstLayout(assets: Asset[]): LayoutBlock[] {
  const blocks: LayoutBlock[] = [];
  
  // Lead with case studies
  const caseStudies = assets.filter(a => a.type === 'case_study').slice(0, 3);
  if (caseStudies.length > 0) {
    // First case study as hero
    blocks.push({ type: 'case_study_card', asset_id: caseStudies[0].id });
    
    // Rest as grid
    if (caseStudies.length > 1) {
      blocks.push({
        type: 'case_study_grid',
        props: { asset_ids: caseStudies.slice(1).map(a => a.id) },
      });
    }
  }
  
  // Video if available
  const video = assets.find(a => a.type === 'video');
  if (video) {
    blocks.push({ type: 'hero_video', asset_id: video.id });
  }
  
  // Thought leadership
  const article = assets.find(a => a.type === 'article');
  if (article) {
    blocks.push({ type: 'thought_leadership', asset_id: article.id });
  }
  
  return blocks;
}

function buildArticleFirstLayout(assets: Asset[]): LayoutBlock[] {
  const blocks: LayoutBlock[] = [];
  
  // Lead with article/thought leadership
  const articles = assets.filter(a => a.type === 'article').slice(0, 2);
  if (articles.length > 0) {
    blocks.push({ type: 'thought_leadership', asset_id: articles[0].id });
  }
  
  // Case studies
  const caseStudies = assets.filter(a => a.type === 'case_study').slice(0, 2);
  if (caseStudies.length > 0) {
    blocks.push({
      type: 'case_study_grid',
      props: { asset_ids: caseStudies.map(a => a.id) },
    });
  }
  
  // Second article if available
  if (articles.length > 1) {
    blocks.push({ type: 'article_preview', asset_id: articles[1].id });
  }
  
  // Video
  const video = assets.find(a => a.type === 'video');
  if (video) {
    blocks.push({ type: 'hero_video', asset_id: video.id });
  }
  
  return blocks;
}

function buildBalancedLayout(assets: Asset[]): LayoutBlock[] {
  const blocks: LayoutBlock[] = [];
  
  // Video first if available
  const video = assets.find(a => a.type === 'video');
  if (video) {
    blocks.push({ type: 'hero_video', asset_id: video.id });
  }
  
  // Case studies
  const caseStudies = assets.filter(a => a.type === 'case_study').slice(0, 3);
  if (caseStudies.length > 0) {
    blocks.push({
      type: 'case_study_grid',
      props: { asset_ids: caseStudies.map(a => a.id) },
    });
  }
  
  // Article
  const article = assets.find(a => a.type === 'article');
  if (article) {
    blocks.push({ type: 'thought_leadership', asset_id: article.id });
  }
  
  return blocks;
}

/**
 * Get template by slug
 */
export function getTemplateDefinition(slug: string): Omit<Template, 'id' | 'created_at'> | undefined {
  return TEMPLATE_DEFINITIONS.find(t => t.slug === slug);
}

/**
 * Get fallback template
 */
export function getFallbackTemplate(): Omit<Template, 'id' | 'created_at'> {
  return TEMPLATE_DEFINITIONS.find(t => t.is_fallback)!;
}
