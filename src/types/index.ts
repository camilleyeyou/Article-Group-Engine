// Asset types
export type AssetType = 'case_study' | 'video' | 'article' | 'deck' | 'diagram';

export interface Asset {
  id: string;
  type: AssetType;
  title: string;
  client?: string;
  description?: string;
  content?: string;
  metadata?: Record<string, unknown>;
  thumbnail_url?: string;
  source_url?: string;
  vimeo_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetEmbedding {
  id: string;
  asset_id: string;
  embedding: number[];
  chunk_index: number;
  chunk_text: string;
  created_at: string;
}

// Template types
export type LayoutType = 'video-first' | 'framework-first' | 'case-study-first' | 'article-first' | 'balanced';

export interface Template {
  id: string;
  name: string;
  slug: string;
  description?: string;
  layout_type: LayoutType;
  required_content_types: AssetType[];
  tone_guidance?: string;
  is_fallback: boolean;
  created_at: string;
}

export interface IntentKeyword {
  id: string;
  template_id: string;
  keyword: string;
  weight: number;
  created_at: string;
}

// Query types
export interface QueryLog {
  id: string;
  session_id?: string;
  user_input: string;
  classified_intent?: string;
  confidence_score?: number;
  template_id?: string;
  served_asset_ids: string[];
  generated_narrative?: string;
  latency_ms?: number;
  feedback?: 'helpful' | 'not_helpful';
  created_at: string;
}

// Response types
export interface ClassificationResult {
  template: Template;
  confidence: number;
  matched_keywords: string[];
}

export interface SearchResult {
  asset: Asset;
  similarity: number;
  chunk_text: string;
}

export interface LayoutBlock {
  type: 'strategic_bridge' | 'hero_video' | 'case_study_card' | 'case_study_grid' | 'article_preview' | 'thought_leadership' | 'cta';
  asset_id?: string;
  content?: string;
  props?: Record<string, unknown>;
}

export interface GeneratedResponse {
  query_id: string;
  template: Template;
  narrative: string;
  layout: LayoutBlock[];
  assets: Asset[];
  latency_ms: number;
}

// Pinning rules
export interface PinningRule {
  id: string;
  keyword: string;
  asset_id: string;
  priority: number;
  created_at: string;
}

// API request/response types
export interface QueryRequest {
  query: string;
  session_id?: string;
}

export interface QueryResponse {
  success: boolean;
  data?: GeneratedResponse;
  error?: string;
}
