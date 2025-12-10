import { createServerClient } from './supabase';
import { generateEmbedding } from './embeddings';
import type { Asset, SearchResult, AssetType } from '@/types';

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
  }
): Promise<SearchResult[]> {
  const supabase = createServerClient();
  const limit = options?.limit ?? 10;
  const minSimilarity = options?.minSimilarity ?? 0.5;
  
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);
  
  // Call the vector similarity search function
  // This requires a Postgres function to be set up (see schema below)
  const { data, error } = await supabase.rpc('search_assets', {
    query_embedding: queryEmbedding,
    match_count: limit,
    min_similarity: minSimilarity,
    filter_types: options?.assetTypes ?? null,
    filter_client: options?.clientFilter ?? null,
  });
  
  if (error) {
    console.error('Search error:', error);
    throw new Error('Failed to search assets: ' + error.message);
  }
  
  return data as SearchResult[];
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
 * Combined search: pinned assets first, then vector search
 */
export async function searchWithPinning(
  query: string,
  options?: {
    limit?: number;
    assetTypes?: AssetType[];
  }
): Promise<{ pinned: Asset[]; searched: SearchResult[] }> {
  const limit = options?.limit ?? 10;
  
  // Get pinned assets first
  const pinned = await getPinnedAssets(query);
  const pinnedIds = new Set(pinned.map(a => a.id));
  
  // Search for remaining assets
  const searchLimit = Math.max(1, limit - pinned.length);
  const searched = await searchAssets(query, {
    ...options,
    limit: searchLimit + pinned.length, // Get extras to filter out pinned
  });
  
  // Filter out any pinned assets from search results
  const filteredSearched = searched.filter(r => !pinnedIds.has(r.asset.id));
  
  return {
    pinned,
    searched: filteredSearched.slice(0, searchLimit),
  };
}

/*
-- Required Postgres function for vector search
-- Run this in Supabase SQL editor:

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
*/
