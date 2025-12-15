import { createServerClient } from './supabase';
import { generateEmbedding } from './embeddings';
import type { Asset, SearchResult, AssetType, BusinessCapability } from '@/types';

/**
 * Search for relevant assets using vector similarity
 */
export async function searchAssets(
  query: string,
  options?: {
    limit?: number;
    assetTypes?: AssetType[];
    clientFilter?: string;
    minSimilarity?: number;
    capability?: BusinessCapability;
  }
): Promise<SearchResult[]> {
  const supabase = createServerClient();
  const limit = options?.limit ?? 10;
  const minSimilarity = options?.minSimilarity ?? 0.2;
  
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);
  
  // Call the vector similarity search function
  const { data, error } = await supabase.rpc('search_assets_v2', {
    query_embedding: queryEmbedding,
    match_count: limit * 2, // Get more to allow for filtering/reranking
    min_similarity: minSimilarity,
    filter_types: options?.assetTypes ?? null,
    filter_client: options?.clientFilter ?? null,
    filter_capability: options?.capability ?? null,
  });
  
  if (error) {
    // Fallback to v1 if v2 doesn't exist yet
    if (error.message.includes('search_assets_v2')) {
      console.log('[Search] Falling back to search_assets v1');
      const { data: v1Data, error: v1Error } = await supabase.rpc('search_assets', {
        query_embedding: queryEmbedding,
        match_count: limit,
        min_similarity: minSimilarity,
        filter_types: options?.assetTypes ?? null,
        filter_client: options?.clientFilter ?? null,
      });
      
      if (v1Error) {
        console.error('Search error:', v1Error);
        throw new Error('Failed to search assets: ' + v1Error.message);
      }
      
      return v1Data as SearchResult[];
    }
    
    console.error('Search error:', error);
    throw new Error('Failed to search assets: ' + error.message);
  }
  
  // Rerank: prioritize case studies and high-quality content
  const results = (data as SearchResult[]).map(r => {
    let boost = 0;
    const metadata = r.asset.metadata as Record<string, unknown> | undefined;
    
    // Boost case studies
    if (metadata?.is_case_study === true || r.asset.type === 'case_study') {
      boost += 0.1;
    }
    
    // Boost high-quality content
    if (typeof metadata?.quality_score === 'number' && metadata.quality_score >= 4) {
      boost += 0.05;
    }
    
    // Boost if capability matches
    if (options?.capability && metadata?.primary_capability === options.capability) {
      boost += 0.15;
    }
    
    return {
      ...r,
      similarity: Math.min(1, r.similarity + boost)
    };
  });
  
  // Re-sort by boosted similarity and deduplicate by asset ID
  const seen = new Set<string>();
  const deduped = results
    .sort((a, b) => b.similarity - a.similarity)
    .filter(r => {
      if (seen.has(r.asset.id)) return false;
      seen.add(r.asset.id);
      return true;
    })
    .slice(0, limit);
  
  return deduped;
}

/**
 * Get assets by IDs (for pinned assets)
 */
export async function getAssetsByIds(ids: string[]): Promise<Asset[]> {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .in('id', ids);
  
  if (error) {
    throw new Error('Failed to get assets: ' + error.message);
  }
  
  return data as Asset[];
}

/**
 * Get pinned assets for keywords in a query
 */
export async function getPinnedAssets(query: string): Promise<Asset[]> {
  const supabase = createServerClient();
  
  // Get all pinning rules
  const { data: rules, error } = await supabase
    .from('pinning_rules')
    .select('keyword, asset_id, priority')
    .order('priority', { ascending: false });
  
  if (error || !rules) {
    return [];
  }
  
  // Find matching keywords in query (case-insensitive)
  const queryLower = query.toLowerCase();
  const matchedAssetIds: string[] = [];
  
  for (const rule of rules) {
    if (queryLower.includes(rule.keyword.toLowerCase())) {
      matchedAssetIds.push(rule.asset_id);
    }
  }
  
  if (matchedAssetIds.length === 0) {
    return [];
  }
  
  // Get the actual assets
  return getAssetsByIds(matchedAssetIds);
}

/**
 * Detect capability from query
 */
export function detectCapability(query: string): BusinessCapability | null {
  const q = query.toLowerCase();
  
  const capabilityKeywords: Record<BusinessCapability, string[]> = {
    'narrative-frameworks': ['narrative', 'story', 'storytelling', 'framework', 'messaging framework'],
    'positioning-messaging': ['positioning', 'messaging', 'value prop', 'differentiation', 'competitive'],
    'gtm-strategy': ['go-to-market', 'gtm', 'launch', 'product launch', 'market entry'],
    'journey-persona': ['journey', 'persona', 'customer journey', 'empathy', 'buyer'],
    'editorial-strategy': ['editorial', 'content strategy', 'content calendar', 'blog strategy'],
    'thought-leadership': ['thought leadership', 'executive', 'point of view', 'pov', 'authority'],
    'copywriting': ['copy', 'copywriting', 'script', 'tagline', 'headline'],
    'social-strategy': ['social media', 'linkedin', 'social strategy', 'engagement'],
    'brand-design': ['brand design', 'visual identity', 'rebrand', 'logo', 'brand refresh'],
    'design-systems': ['design system', 'component', 'style guide'],
    'video-production': ['video', 'production', 'explainer video', 'motion', 'animation'],
    'sales-collateral': ['sales deck', 'one-pager', 'collateral', 'pitch deck', 'sales enablement'],
    'keynote-events': ['keynote', 'conference', 'event', 'mainstage', 'presentation', 'reinvent'],
    'partner-marketing': ['partner', 'alliance', 'channel', 'ecosystem', 'co-marketing'],
  };
  
  for (const [capability, keywords] of Object.entries(capabilityKeywords)) {
    if (keywords.some(kw => q.includes(kw))) {
      return capability as BusinessCapability;
    }
  }
  
  return null;
}

/**
 * Combined search: pinned assets first, then vector search with capability detection
 */
export async function searchWithPinning(
  query: string,
  options?: {
    limit?: number;
    assetTypes?: AssetType[];
    capability?: BusinessCapability;
  }
): Promise<{ pinned: Asset[]; searched: SearchResult[]; detectedCapability: BusinessCapability | null }> {
  const limit = options?.limit ?? 10;
  
  // Detect capability from query if not provided
  const detectedCapability = options?.capability ?? detectCapability(query);
  
  // Get pinned assets first
  const pinned = await getPinnedAssets(query);
  const pinnedIds = new Set(pinned.map(a => a.id));
  
  console.log(`[Search] Query: "${query}"`);
  console.log(`[Search] Detected capability: ${detectedCapability || 'none'}`);
  console.log(`[Search] Pinned assets: ${pinned.length}`);
  
  // Search for remaining assets
  const searchLimit = Math.max(1, limit - pinned.length);
  
  try {
    const searched = await searchAssets(query, {
      ...options,
      limit: searchLimit + pinned.length,
      capability: detectedCapability ?? undefined,
    });
    
    console.log(`[Search] Vector search results: ${searched.length}`);
    
    // Filter out any pinned assets from search results
    const filteredSearched = searched.filter(r => !pinnedIds.has(r.asset.id));
    
    return {
      pinned,
      searched: filteredSearched.slice(0, searchLimit),
      detectedCapability,
    };
  } catch (error) {
    console.error('[Search] Vector search failed:', error);
    return {
      pinned,
      searched: [],
      detectedCapability,
    };
  }
}

/*
-- Updated Postgres function for vector search with capability filtering
-- Run this in Supabase SQL editor:

CREATE OR REPLACE FUNCTION search_assets_v2(
  query_embedding vector(1536),
  match_count int DEFAULT 10,
  min_similarity float DEFAULT 0.2,
  filter_types text[] DEFAULT NULL,
  filter_client text DEFAULT NULL,
  filter_capability text DEFAULT NULL
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
    AND (filter_capability IS NULL OR a.metadata->>'primary_capability' = filter_capability 
         OR a.metadata->'secondary_capabilities' ? filter_capability)
    AND 1 - (ae.embedding <=> query_embedding) >= min_similarity
  ORDER BY ae.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
*/
