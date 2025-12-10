-- Article Group Strategic Narrative Engine
-- Database Schema for Supabase
-- Run this in the Supabase SQL Editor

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- TEMPLATES
-- ============================================
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  layout_type TEXT NOT NULL CHECK (layout_type IN ('video-first', 'framework-first', 'case-study-first', 'article-first', 'balanced')),
  required_content_types TEXT[] NOT NULL DEFAULT '{}',
  tone_guidance TEXT,
  is_fallback BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for slug lookup
CREATE INDEX idx_templates_slug ON templates(slug);
CREATE INDEX idx_templates_fallback ON templates(is_fallback) WHERE is_fallback = TRUE;

-- ============================================
-- INTENT KEYWORDS
-- ============================================
CREATE TABLE intent_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  weight FLOAT DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_intent_keywords_template ON intent_keywords(template_id);
CREATE INDEX idx_intent_keywords_keyword ON intent_keywords(keyword);

-- ============================================
-- ASSETS
-- ============================================
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('case_study', 'video', 'article', 'deck', 'diagram')),
  title TEXT NOT NULL,
  client TEXT,
  description TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  thumbnail_url TEXT,
  source_url TEXT,
  vimeo_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_client ON assets(client);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ASSET EMBEDDINGS (Vector Search)
-- ============================================
CREATE TABLE asset_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  embedding vector(1536),
  chunk_index INT DEFAULT 0,
  chunk_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity index (IVFFlat)
CREATE INDEX idx_asset_embeddings_vector ON asset_embeddings 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_asset_embeddings_asset ON asset_embeddings(asset_id);

-- ============================================
-- TEMPLATE-ASSET ASSOCIATIONS (Pinning)
-- ============================================
CREATE TABLE template_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  priority INT DEFAULT 0,
  is_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, asset_id)
);

CREATE INDEX idx_template_assets_template ON template_assets(template_id);

-- ============================================
-- QUERY LOGS
-- ============================================
CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  user_input TEXT NOT NULL,
  classified_intent TEXT,
  confidence_score FLOAT,
  template_id UUID REFERENCES templates(id),
  served_asset_ids UUID[] DEFAULT '{}',
  generated_narrative TEXT,
  latency_ms INT,
  feedback TEXT CHECK (feedback IN ('helpful', 'not_helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_queries_session ON queries(session_id);
CREATE INDEX idx_queries_intent ON queries(classified_intent);
CREATE INDEX idx_queries_created ON queries(created_at DESC);

-- ============================================
-- PINNING RULES
-- ============================================
CREATE TABLE pinning_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  priority INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pinning_rules_keyword ON pinning_rules(keyword);

-- ============================================
-- VECTOR SEARCH FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION search_assets(
  query_embedding vector(1536),
  match_count int DEFAULT 10,
  min_similarity float DEFAULT 0.5,
  filter_types text[] DEFAULT NULL,
  filter_client text DEFAULT NULL
)
RETURNS TABLE (
  asset jsonb,
  similarity float,
  chunk_text text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_jsonb(a.*) as asset,
    1 - (ae.embedding <=> query_embedding) as similarity,
    ae.chunk_text
  FROM asset_embeddings ae
  JOIN assets a ON a.id = ae.asset_id
  WHERE 
    (filter_types IS NULL OR a.type = ANY(filter_types))
    AND (filter_client IS NULL OR a.client ILIKE '%' || filter_client || '%')
    AND 1 - (ae.embedding <=> query_embedding) >= min_similarity
  ORDER BY ae.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE intent_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pinning_rules ENABLE ROW LEVEL SECURITY;

-- Public read access for templates and assets (needed for the frontend)
CREATE POLICY "Templates are viewable by everyone" ON templates FOR SELECT USING (true);
CREATE POLICY "Assets are viewable by everyone" ON assets FOR SELECT USING (true);
CREATE POLICY "Asset embeddings are viewable by everyone" ON asset_embeddings FOR SELECT USING (true);
CREATE POLICY "Template assets are viewable by everyone" ON template_assets FOR SELECT USING (true);
CREATE POLICY "Pinning rules are viewable by everyone" ON pinning_rules FOR SELECT USING (true);
CREATE POLICY "Intent keywords are viewable by everyone" ON intent_keywords FOR SELECT USING (true);

-- Queries can be inserted by anyone (for logging) but only viewed by authenticated users
CREATE POLICY "Anyone can insert queries" ON queries FOR INSERT WITH CHECK (true);
CREATE POLICY "Queries viewable by authenticated users" ON queries FOR SELECT USING (auth.role() = 'authenticated');

-- Service role can do everything (for admin operations)
-- This is handled automatically by Supabase when using the service role key

-- ============================================
-- SEED DATA: Core 20 Templates
-- ============================================
INSERT INTO templates (name, slug, description, layout_type, required_content_types, tone_guidance, is_fallback) VALUES
('Executive Messaging', 'executive-messaging', 'CEO communications, board presentations, executive keynotes', 'video-first', ARRAY['video', 'case_study'], 'Speak to the weight of executive communication. Acknowledge that every word matters at this level.', false),
('Product Launch', 'product-launch', 'General product launches and go-to-market', 'case-study-first', ARRAY['case_study', 'article'], 'Focus on momentum and market impact. Launch energy without hype.', false),
('Hard Tech Launch', 'hard-tech-launch', 'Technical product launches requiring simplification of complex technology', 'framework-first', ARRAY['diagram', 'case_study', 'article'], 'Lead with frameworks and structure. Show how complexity becomes clarity.', false),
('Consumer Launch', 'consumer-launch', 'Consumer-facing product launches', 'video-first', ARRAY['video', 'case_study'], 'Emotional resonance matters here. Connect product to human experience.', false),
('Rebranding', 'rebranding', 'Brand refresh, repositioning, brand strategy', 'case-study-first', ARRAY['case_study', 'article'], 'Transformation narrative. Before/after, but with strategic depth.', false),
('Developer Relations', 'developer-relations', 'DevRel, developer marketing, API launches, developer community', 'article-first', ARRAY['article', 'case_study'], 'Developers detect BS instantly. Be technical, be real, be helpful.', false),
('Sales Enablement', 'sales-enablement', 'Sales messaging, playbooks, pitch materials', 'framework-first', ARRAY['deck', 'case_study', 'article'], 'Revenue-focused. Show how narrative becomes pipeline.', false),
('Internal Communications', 'internal-communications', 'Employee communications, culture change, org transformations', 'case-study-first', ARRAY['case_study', 'article'], 'Internal audiences are the toughest. Authenticity is non-negotiable.', false),
('Keynote Development', 'keynote-development', 'Conference keynotes, executive presentations', 'video-first', ARRAY['video', 'case_study'], 'Stage presence starts on the page. Show how we build memorable moments.', false),
('GTM Strategy', 'gtm-strategy', 'Go-to-market strategy, market entry, vertical expansion', 'framework-first', ARRAY['diagram', 'case_study', 'article'], 'Strategic rigor. Marketecture lives here.', false),
('Technical Translation', 'technical-translation', 'Explaining complex technology to non-technical audiences', 'case-study-first', ARRAY['case_study', 'video', 'article'], 'This is our superpower. Show the transformation from jargon to clarity.', false),
('Narrative Framework', 'narrative-framework', 'Company narrative, messaging architecture, story development', 'article-first', ARRAY['article', 'case_study', 'diagram'], 'Story structure and strategic narrative. The foundation everything else builds on.', false),
('Investor Communications', 'investor-communications', 'Investor relations, funding announcements, IPO communications', 'framework-first', ARRAY['case_study', 'deck'], 'Stakes are high. Precision and credibility above all.', false),
('Employer Branding', 'employer-branding', 'Recruiting, employer brand, talent attraction', 'video-first', ARRAY['video', 'case_study'], 'Culture is felt, not described. Show authentic employee voice.', false),
('Partner Marketing', 'partner-marketing', 'Partnership launches, co-marketing, channel marketing', 'case-study-first', ARRAY['case_study', 'article'], 'Two brands, one story. Show how we navigate joint narratives.', false),
('Thought Leadership', 'thought-leadership', 'Executive thought leadership, industry POV, content strategy', 'article-first', ARRAY['article', 'video'], 'Ideas that move industries. Substance over self-promotion.', false),
('Crisis Communications', 'crisis-communications', 'Crisis management, reputation management', 'framework-first', ARRAY['case_study', 'article'], 'Calm, prepared, strategic. Show we have navigated high-pressure situations.', false),
('M&A Communications', 'ma-communications', 'M&A announcements, post-merger integration communications', 'case-study-first', ARRAY['case_study', 'article'], 'Transformation at scale. Multiple stakeholders, one coherent story.', false),
('Analyst Relations', 'analyst-relations', 'Industry analyst briefings, AR strategy', 'framework-first', ARRAY['deck', 'case_study'], 'Analysts want data and differentiation. Strategic positioning.', false),
('Customer Marketing', 'customer-marketing', 'Customer advocacy, case study development, reference programs', 'case-study-first', ARRAY['case_study', 'video'], 'Let customers be the heroes. Authentic success stories.', false),
('General Capabilities', 'general', 'Fallback template for queries that do not match specific intents', 'balanced', ARRAY['case_study', 'video', 'article'], 'Versatile and comprehensive. Show breadth without being generic.', true);

-- Done!
SELECT 'Schema created successfully! ' || COUNT(*) || ' templates seeded.' as status FROM templates;
