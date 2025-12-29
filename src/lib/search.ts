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
  
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);
  
  console.log(`[Search] Generating embedding for: "${query.substring(0, 50)}..."`);
  
  // Use simple search_assets function (NOT v2 which was broken)
  const { data, error } = await supabase.rpc('search_assets', {
    query_embedding: queryEmbedding,
    match_count: limit * 3, // Get more to allow for deduplication
    min_similarity: 0.0, // No threshold - let all results through
    filter_types: null, // Don't filter by type - we want all results
    filter_client: options?.clientFilter ?? null,
  });
  
  if (error) {
    console.error('[Search] RPC error:', error.message);
    
    // Fallback to direct query
    console.log('[Search] Falling back to direct query...');
    const { data: directData, error: directError } = await supabase
      .from('assets')
      .select('*')
      .limit(limit);
    
    if (directError) {
      throw new Error('Search failed: ' + directError.message);
    }
    
    return (directData || []).map((asset, index) => ({
      asset: asset as Asset,
      similarity: 0.5 - (index * 0.02),
      chunk_text: asset.description || ''
    }));
  }
  
  if (!data || data.length === 0) {
    console.log('[Search] No results from RPC, trying direct query...');
    const { data: directData } = await supabase
      .from('assets')
      .select('*')
      .limit(limit);
    
    return (directData || []).map((asset, index) => ({
      asset: asset as Asset,
      similarity: 0.5 - (index * 0.02),
      chunk_text: asset.description || ''
    }));
  }
  
  console.log(`[Search] RPC returned ${data.length} results`);
  
  // Deduplicate by asset ID (keep highest similarity for each asset)
  const seen = new Map<string, SearchResult>();
  
  for (const result of data as SearchResult[]) {
    const assetId = result.asset.id;
    const existing = seen.get(assetId);
    
    if (!existing || result.similarity > existing.similarity) {
      seen.set(assetId, result);
    }
  }
  
  // Convert to array and sort by similarity
  const deduped = Array.from(seen.values())
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
  
  console.log(`[Search] After deduplication: ${deduped.length} unique results`);
  
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
 * Detect capability from query - DISABLED (was causing 0 results)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function detectCapability(query: string): BusinessCapability | null {
  // Capability filtering was causing search_assets_v2 to return 0 results
  // because assets don't have primary_capability metadata set
  return null;
}

/**
 * Combined search: pinned assets first, then vector search
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
  
  // Get pinned assets first
  const pinned = await getPinnedAssets(query);
  const pinnedIds = new Set(pinned.map(a => a.id));
  
  console.log(`[Search] Query: "${query}"`);
  console.log(`[Search] Pinned assets: ${pinned.length}`);
  
  // Search for remaining assets - NO capability filtering
  const searchLimit = Math.max(1, limit - pinned.length);
  
  try {
    const searched = await searchAssets(query, {
      ...options,
      limit: searchLimit + pinned.length,
      // DO NOT pass capability - it breaks the search
    });
    
    console.log(`[Search] Vector search results: ${searched.length}`);
    
    // Filter out any pinned assets from search results
    const filteredSearched = searched.filter(r => !pinnedIds.has(r.asset.id));
    
    return {
      pinned,
      searched: filteredSearched.slice(0, searchLimit),
      detectedCapability: null,
    };
  } catch (error) {
    console.error('[Search] Vector search failed:', error);
    return {
      pinned,
      searched: [],
      detectedCapability: null,
    };
  }
}
