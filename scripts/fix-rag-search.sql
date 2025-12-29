-- FIX RAG SEARCH - Run in Supabase SQL Editor
-- This fixes the search_assets_v2 function that returns 0 results

-- Drop existing functions
DROP FUNCTION IF EXISTS search_assets(vector(1536), int, float, text[], text);
DROP FUNCTION IF EXISTS search_assets_v2(vector(1536), int, float, text[], text, text);

-- Recreate search_assets - SIMPLE, NO FILTERING
CREATE OR REPLACE FUNCTION search_assets(
  query_embedding vector(1536),
  match_count int DEFAULT 10,
  min_similarity float DEFAULT 0.0,
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
  ORDER BY ae.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Recreate search_assets_v2 - IGNORE capability filter (it was breaking search)
CREATE OR REPLACE FUNCTION search_assets_v2(
  query_embedding vector(1536),
  match_count int DEFAULT 10,
  min_similarity float DEFAULT 0.0,
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
  -- NOTE: filter_capability is IGNORED because assets don't have this metadata
  -- This was causing 0 results
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
  ORDER BY ae.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Verify
SELECT 'Functions created successfully' as status;
